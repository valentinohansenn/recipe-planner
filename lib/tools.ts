// import { cached } from '@/lib/cache';
import { parsingSchema, RecipeArtifact } from '@/lib/schema';
import { streamObject, tool } from 'ai';
import { z } from 'zod';
import { exa } from './exa';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

// Type definition for Exa search results
interface ExaSearchResult {
    title: string | null;
    url: string;
    text?: string | null;
    highlights?: string[] | null;
    score?: number;
}

export const generateRecipeTool = tool({
    description: `Generate or update a recipe based on user requirements.
  Use this tool whenever the user asks to create a new recipe or modify an existing one.
  For modifications, consider the previous recipe context and apply the requested changes.`,
    inputSchema: z.object({
        recipeName: z.string().describe('The name of the recipe'),
        description: z.string().describe('Brief description of the dish'),
        prepTime: z.number().describe('Preparation time in minutes'),
        cookTime: z.number().describe('Cooking time in minutes'),
        servings: z.number().describe('Number of servings'),
        difficulty: z.enum(['easy', 'medium', 'hard']).describe('Recipe difficulty level'),
        ingredients: z.array(
            z.object({
                item: z.string(),
                amount: z.string(),
                category: z.enum(['protein', 'vegetable', 'grain', 'dairy', 'spice', 'other'])
            })
        ).describe('List of ingredients with amounts'),
        steps: z.array(
            z.object({
                stepNumber: z.number(),
                instruction: z.string(),
                duration: z.number().optional()
            })
        ).describe('Step-by-step cooking instructions'),
        tips: z.array(z.string()).optional().describe('Helpful cooking tips'),
        nutritionEstimate: z.object({
            calories: z.number(),
            protein: z.string(),
            carbs: z.string(),
            fat: z.string()
        }).optional().describe('Nutritional information per serving'),
        dietaryRestrictions: z.string().optional().describe('Any dietary restrictions or preferences'),
        cuisine: z.string().optional().describe('Cuisine style')
    }),
    execute: async (params) => {
        // Stream the recipe artifact with loading states
        const recipe = RecipeArtifact.stream({
            title: params.recipeName,
            description: params.description,
            prepTime: 0,
            cookTime: 0,
            servings: params.servings,
            difficulty: params.difficulty,
            ingredients: [],
            steps: [],
            status: 'loading',
            progress: 0
        });

        // Update with basic info
        await recipe.update({
            prepTime: params.prepTime,
            cookTime: params.cookTime,
            status: 'streaming',
            progress: 0.3
        });

        // Add ingredients
        await recipe.update({
            ingredients: params.ingredients,
            progress: 0.6
        });

        // Complete with steps and optional data
        await recipe.complete({
            title: params.recipeName,
            description: params.description,
            prepTime: params.prepTime,
            cookTime: params.cookTime,
            servings: params.servings,
            difficulty: params.difficulty,
            ingredients: params.ingredients,
            steps: params.steps,
            tips: params.tips,
            nutritionEstimate: params.nutritionEstimate,
            status: 'complete',
            progress: 1.0
        });

        return `Recipe "${params.recipeName}" has been ${params.dietaryRestrictions ? 'updated' : 'created'} successfully!`;
    }
});

// export const generateRecipeTool = cached(generateRecipeToolBase);

export const searchRecipesTool = tool({
    description: `Search for authentic recipes from chefs, blogs, and YouTube.
    Use this tool when the user asks for a specific chef's recipe, an authentic traditional recipe, a video tutorial, or a popular/trending recipe.`,
    inputSchema: z.object({
        query: z.string().describe('The recipe search query'),
        includeVideos: z.boolean().describe('Whether to include video results').default(false),
        dietaryFilter: z.string().optional().describe('Dietary restrictions to filter by'),
        source: z.enum(['any', 'blogs', 'youtube', 'chefs']).default('any').describe('Source preference')
    }),
    execute: async (params) => {
        const domains = {
            blogs: [
                'seriouseats.com',
                'bonappetit.com',
                'foodnetwork.com',
                'epicurious.com',
                'delish.com',
                'thekitchn.com',
                'tasty.co'
            ],
            youtube: ['youtube.com'],
            chefs: [
                'gordonramsay.com',
                'jamieoliver.com',
                'joshuaweissman.com',
                'cooking.nytimes.com'
            ],
            any: []
        }

        const includeDomains = domains[params.source] || []
        const enhancedQuery = params.dietaryFilter ? `${params.query} with ${params.dietaryFilter}` : params.query

        try {
            const results = await exa.searchAndContents(enhancedQuery, {
                type: 'auto',
                numResults: 5,
                text: true,
                highlights: true,
                includeDomains: includeDomains.length > 0 ? includeDomains : undefined,
            })

            let videoResults: ExaSearchResult[] = []
            if (params.includeVideos) {
                const videoSearch = await exa.searchAndContents(enhancedQuery, {
                    type: 'auto',
                    numResults: 5,
                    text: true,
                    highlights: true,
                    includeDomains: domains.youtube,
                })
                videoResults = videoSearch.results
            }

            const recipes = results.results.map((result) => ({
                title: result.title,
                url: result.url,
                source: new URL(result.url).hostname.replace('www', ''),
                excerpt: result.highlights?.[0] || result.text?.substring(0, 500),
                fullText: result.text?.substring(0, 2000),
                relevanceScore: result.score
            }))

            const videos = videoResults.map(video => ({
                title: video.title,
                url: video.url,
                excerpt: video.text?.substring(0, 300),
            }))

            return {
                query: enhancedQuery,
                recipesFound: recipes.length,
                recipes,
                videos: params.includeVideos ? videos : [],
                message: `Found ${recipes.length} recipes and ${videos.length} videos for "${enhancedQuery}"`
            }
        } catch (error: unknown) {
            return {
                query: enhancedQuery,
                recipesFound: 0,
                recipes: [],
                videos: [],
                message: `Error searching for recipes: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
    }
})

export const processScrapedRecipeTool = tool({
    description: "Process a scraped recipe from a search result into a clean format",
    inputSchema: z.object({
        recipeText: z.string().describe('The text content of the recipe to process'),
        recipeTitle: z.string().describe('Recipe title'),
        sourceUrl: z.string().describe('Original recipe URL'),
        sourceName: z.string().describe('Website/chef name'),
        userModifications: z.string().optional().describe('User-requested modifications')
    }),
    execute: async function* ({ recipeText, recipeTitle, sourceUrl, sourceName, userModifications }) {
        const recipe = RecipeArtifact.stream({
            title: recipeTitle,
            description: '',
            prepTime: 0,
            cookTime: 0,
            servings: 0,
            difficulty: 'medium',
            ingredients: [],
            steps: [],
            status: 'loading',
            progress: 0
        })

        yield { text: `Processing recipe "${recipeTitle}" from ${sourceName}...` };

        const { partialObjectStream } = streamObject({
            model: google('gemini-2.5-flash'),
            schema: parsingSchema,
            prompt: `Extract structured data from this recipe:
    Title: ${recipeTitle}
            Source: ${sourceName}
            ${userModifications ? `\nModifications: ${userModifications}` : ''}

Recipe:
            ${recipeText}

            Parse all ingredients(with amounts and categories), steps(numbered with durations), times, servings, difficulty, and tips.`,
        });

        let progress = 0
        let finalRecipeData: Record<string, unknown> = {}
        for await (const partialObject of partialObjectStream) {
            progress = Math.min(progress + 0.1, 0.9)
            finalRecipeData = { ...finalRecipeData, ...partialObject }
            await recipe.update({
                status: 'streaming',
                progress
            });
        }

        yield { text: `Processing ${Math.round(progress * 100)}% ` }

        const tips = [
            `Original recipe from: ${sourceName} `,
            `View full recipe: ${sourceUrl} `,
            ...(userModifications ? [`Modified: ${userModifications} `] : [])
        ]

        await recipe.complete({
            title: (finalRecipeData.title as string) || recipeTitle,
            description: (finalRecipeData.description as string) || '',
            prepTime: (finalRecipeData.prepTime as number) || 0,
            cookTime: (finalRecipeData.cookTime as number) || 0,
            servings: (finalRecipeData.servings as number) || 1,
            difficulty: (finalRecipeData.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
            ingredients: (finalRecipeData.ingredients as Array<{ item: string, amount: string, category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other' }>) || [],
            steps: (finalRecipeData.steps as Array<{ stepNumber: number, instruction: string, duration?: number }>) || [],
            tips,
            nutritionEstimate: finalRecipeData.nutritionEstimate as { calories: number, protein: string, carbs: string, fat: string } | undefined,
            status: 'complete',
            progress: 1.0
        });

        yield { text: `Recipe "${recipeTitle}" processed successfully!` };
    }
});
