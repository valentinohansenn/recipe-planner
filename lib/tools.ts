// import { cached } from '@/lib/cache';
import { RecipeArtifact, recipeSchema } from '@/lib/schema';
import { tool } from 'ai';
import { z } from 'zod';
import { exa } from '@/lib/exa';
import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { generateRecipeSystem } from '@/lib/prompt';
import { formatTime } from '@/lib/time-format';

interface ExaSearchResult {
    title: string | null;
    url: string;
    text?: string | null;
    highlights?: string[] | null;
    score?: number;
}

export const searchRecipesTool = tool({
    description: `Search for authentic recipes from chefs, blogs, and YouTube to gather inspiration and reference sources.
    Use this tool when the user asks for a specific chef's recipe, an authentic traditional recipe, a video tutorial, or a popular/trending recipe.

    🚨 CRITICAL WORKFLOW: This tool is ONLY the first step. After calling this tool, you MUST:
    1. Read the returned 'recipes' array from the tool result
    2. IMMEDIATELY call generateRecipe tool in the same response
    3. Pass the 'recipes' array as the 'sources' parameter to generateRecipe

    DO NOT stop after this tool. DO NOT wait. DO NOT ask the user anything. Continue immediately to generateRecipe.`,
    inputSchema: z.object({
        query: z.string().describe('The recipe search query'),
        includeVideos: z.boolean().describe('Whether to include video results').default(false),
        dietaryFilter: z.string().optional().describe('Dietary restrictions to filter by'),
        source: z.enum(['any', 'blogs', 'youtube', 'chefs']).default('any').describe('Source preference')
    }),
    execute: async ({ query, includeVideos, dietaryFilter, source }) => {
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

        const includeDomains = domains[source] || []
        const enhancedQuery = dietaryFilter ? `${query} with ${dietaryFilter}` : query

    try {
        const results = await exa.searchAndContents(enhancedQuery, {
            type: 'auto',
            numResults: 5,
            text: true,
            highlights: true,
            includeDomains: includeDomains.length > 0 ? includeDomains : undefined,
            })

            let videoResults: ExaSearchResult[] = []
        if (includeVideos) {
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
                title: result.title || 'Untitled',
            url: result.url,
            source: new URL(result.url).hostname.replace('www.', ''),
            excerpt: result.highlights?.[0] || result.text?.substring(0, 500),
                fullText: result.text?.substring(0, 3000), // Increased for more context
            relevanceScore: result.score
            }))

        const videos = videoResults.map(video => ({
                title: video.title || 'Untitled Video',
            url: video.url,
            excerpt: video.text?.substring(0, 300),
            }))

        return {
            query: enhancedQuery,
            recipesFound: recipes.length,
            recipes,
            videos: includeVideos ? videos : [],
                message: `✅ Found ${recipes.length} excellent recipes${includeVideos ? ` and ${videos.length} videos` : ''} for "${enhancedQuery}"!

🚨 CRITICAL: You MUST immediately call generateRecipe tool now. Do not stop, do not wait, do not ask the user anything. Call generateRecipe with these sources right now in this same response.

Pass this entire 'recipes' array as the 'sources' parameter to synthesize a comprehensive recipe.`
            }
    } catch (error: unknown) {
        return {
            query: enhancedQuery,
            recipesFound: 0,
            recipes: [],
            videos: [],
                message: `Error searching for recipes: ${error instanceof Error ? error.message : 'Unknown error'}. You should still call generateRecipe to create a recipe based on your expertise.`
            }
        }
    }
})

export const generateRecipeTool = tool({
    description: `Generate a comprehensive recipe by synthesizing information from searched sources and user requirements.

  ⚠️ CRITICAL: This tool MUST be called for EVERY recipe request. It creates the recipe artifact that displays on the right panel.

  Usage:
  - If you used searchRecipesTool first, pass the returned 'recipes' array as the 'sources' parameter
  - If no search was done, create the recipe from your expertise (sources can be empty/undefined)
  - This is the FINAL and REQUIRED step in recipe generation - do not skip it!`,
    inputSchema: z.object({
        recipeName: z.string().describe('The name of the recipe to generate'),
        userRequirements: z.string().describe('The user\'s specific requirements, preferences, or modifications'),
        sources: z.array(
            z.object({
                title: z.string(),
                url: z.string(),
                excerpt: z.string().optional(),
                fullText: z.string().optional()
            })
        ).optional().describe('Search results from searchRecipesTool to use as context'),
        servings: z.number().optional().describe('Desired number of servings'),
        dietaryRestrictions: z.string().optional().describe('Any dietary restrictions or preferences'),
        cuisine: z.string().optional().describe('Cuisine style')
    }),
    execute: async function* ({ recipeName, userRequirements, sources, servings, dietaryRestrictions, cuisine }) {

        // Build context from sources
        let sourceContext = '';
        const sourcesList: Array<{ title: string; url: string; source?: string }> = [];

        if (sources && sources.length > 0) {
            sourceContext = '\n\nReference Sources:\n' + sources.map((s, i) => {
                sourcesList.push({
                    title: s.title,
                    url: s.url,
                    source: new URL(s.url).hostname.replace('www.', '')
                });
                return `${i + 1}. ${s.title}\n   ${s.fullText || s.excerpt || 'No content available'}`;
            }).join('\n\n');
        }

        // Build the generation prompt
        const prompt = `Create a detailed recipe for: ${recipeName}

User Requirements: ${userRequirements}
${servings ? `Servings: ${servings}` : ''}
${dietaryRestrictions ? `Dietary Restrictions: ${dietaryRestrictions}` : ''}
${cuisine ? `Cuisine Style: ${cuisine}` : ''}
${sourceContext}

${sources && sources.length > 0 ? 'Synthesize the information from the reference sources above and create a comprehensive, detailed recipe that incorporates the best techniques and insights.' : 'Create a comprehensive recipe based on your culinary expertise.'}`;

        // Initialize the artifact in loading state
        const recipe = RecipeArtifact.stream({
            title: recipeName,
            description: '',
            prepTime: 0,
            cookTime: 0,
            chillTime: undefined,
            servings: servings || 4,
            difficulty: 'medium' as const,
            chefsNotes: undefined,
            toolsNeeded: undefined,
            ingredients: [],
            steps: [],
            sources: sourcesList,
            status: 'streaming' as const,
            progress: 0.05 // Start with small initial progress
        });

        yield {
            text: sources && sources.length > 0
                ? `Analyzing ${sources.length} recipe source${sources.length > 1 ? 's' : ''} and synthesizing a comprehensive recipe for "${recipeName}"...`
                : `Creating a detailed recipe for "${recipeName}"...`
        }

        // Stream the recipe generation using streamObject
        const { partialObjectStream, object } = streamObject({
            model: google('gemini-2.0-flash-exp'),
            schema: recipeSchema,
            system: generateRecipeSystem,
            prompt: prompt,
        });

        let lastUpdate = Date.now();
        const updateInterval = 300; // Update every 300ms to avoid too many updates
        let hasYieldedIngredients = false;
        let hasYieldedSteps = false;
        let hasYieldedTips = false;
        let currentProgress = 0.1; // Start at 10% after initialization

        for await (const partialObject of partialObjectStream) {
            const now = Date.now();

            // Calculate dynamic progress based on content generation
            let newProgress = 0.1; // Base progress

            // Progress milestones based on content completion
            if (partialObject.recipeName) newProgress = Math.max(newProgress, 0.15);
            if (partialObject.description) newProgress = Math.max(newProgress, 0.2);
            if (partialObject.chefsNotes) newProgress = Math.max(newProgress, 0.3);
            if (partialObject.toolsNeeded && partialObject.toolsNeeded.length > 0) newProgress = Math.max(newProgress, 0.4);

            // More granular progress for ingredients (40% to 60%)
            if (partialObject.ingredients && partialObject.ingredients.length > 0) {
                const ingredientProgress = Math.min(partialObject.ingredients.length / 15, 1); // Assume ~15 ingredients max
                newProgress = Math.max(newProgress, 0.4 + (ingredientProgress * 0.2));
            }

            // More granular progress for steps (60% to 80%)
            if (partialObject.steps && partialObject.steps.length > 0) {
                const stepProgress = Math.min(partialObject.steps.length / 10, 1); // Assume ~10 steps max
                newProgress = Math.max(newProgress, 0.6 + (stepProgress * 0.2));
            }

            if (partialObject.tips && partialObject.tips.length > 0) newProgress = Math.max(newProgress, 0.85);
            if (partialObject.nutritionEstimate) newProgress = Math.max(newProgress, 0.95);

            // Update current progress smoothly (with small incremental increases)
            if (newProgress > currentProgress) {
                // Smooth transition - don't jump too quickly
                const maxIncrement = 0.05; // Max 5% increase per update
                currentProgress = Math.min(currentProgress + maxIncrement, newProgress);
            }

            // Yield progress updates for major milestones
            if (!hasYieldedIngredients && partialObject.ingredients && partialObject.ingredients.length > 0) {
                hasYieldedIngredients = true;
                yield { text: `✓ Generated ${partialObject.ingredients.length} ingredients...` };
            }

            if (!hasYieldedSteps && partialObject.steps && partialObject.steps.length > 0) {
                hasYieldedSteps = true;
                yield { text: `✓ Creating step-by-step instructions...` };
            }

            if (!hasYieldedTips && partialObject.tips && partialObject.tips.length > 0) {
                hasYieldedTips = true;
                yield { text: `✓ Adding helpful cooking tips...` };
            }

            // Throttle updates for better performance
            if (now - lastUpdate > updateInterval) {
                // Filter out undefined ingredients and add section field
                type PartialIngredient = { item?: string; amount?: string; category?: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other'; section?: string };
                type CompleteIngredient = { item: string; amount: string; category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other'; section?: string };

                const ingredients = (partialObject.ingredients || [])
                    .filter((ing: PartialIngredient | undefined): ing is CompleteIngredient =>
                        ing !== undefined && typeof ing.item === 'string' && typeof ing.amount === 'string' && typeof ing.category === 'string'
                    )
                    .map((ing: CompleteIngredient) => ({
                        item: ing.item,
                        amount: ing.amount,
                        category: ing.category,
                        section: ing.section
                    }));

                // Filter out undefined steps and add section field
                type PartialStep = { stepNumber?: number; instruction?: string; duration?: number; section?: string };
                type CompleteStep = { stepNumber: number; instruction: string; duration?: number; section?: string };

                const steps = (partialObject.steps || [])
                    .filter((step: PartialStep | undefined): step is CompleteStep =>
                        step !== undefined && typeof step.instruction === 'string' && typeof step.stepNumber === 'number'
                    )
                    .map((step: CompleteStep) => ({
                        stepNumber: step.stepNumber,
                        instruction: step.instruction,
                        duration: step.duration,
                        section: step.section
                    }));

                // Filter out undefined tips
                const tips = partialObject.tips
                    ? partialObject.tips.filter((tip: string | undefined): tip is string => tip !== undefined && typeof tip === 'string')
                    : undefined;

                // Filter out undefined tools
                const toolsNeeded = partialObject.toolsNeeded
                    ? partialObject.toolsNeeded.filter((tool: string | undefined): tool is string => tool !== undefined && typeof tool === 'string')
                    : undefined;

                // Only include nutritionEstimate if all required fields are present
                const nutritionEstimate = partialObject.nutritionEstimate &&
                    partialObject.nutritionEstimate.calories !== undefined &&
                    partialObject.nutritionEstimate.protein !== undefined &&
                    partialObject.nutritionEstimate.carbs !== undefined &&
                    partialObject.nutritionEstimate.fat !== undefined
                    ? {
                        calories: partialObject.nutritionEstimate.calories,
                        protein: partialObject.nutritionEstimate.protein,
                        carbs: partialObject.nutritionEstimate.carbs,
                        fat: partialObject.nutritionEstimate.fat
                    }
                    : undefined;

                await recipe.update({
                    title: partialObject.recipeName || recipeName,
                    description: partialObject.description || '',
                    prepTime: partialObject.prepTime || 0,
                    cookTime: partialObject.cookTime || 0,
                    chillTime: partialObject.chillTime,
                    servings: partialObject.servings || servings || 4,
                    difficulty: partialObject.difficulty || 'medium',
                    chefsNotes: partialObject.chefsNotes,
                    toolsNeeded,
                    ingredients,
                    steps,
                    tips,
                    nutritionEstimate,
                    sources: sourcesList,
                    status: 'streaming' as const,
                    progress: currentProgress // Dynamic progress based on content
                });

                lastUpdate = now;
            }
        }

        // Wait for the final complete object
        const finalRecipe = await object;

        // Complete the artifact with final data
        await recipe.complete({
            title: finalRecipe.recipeName,
            description: finalRecipe.description,
            prepTime: finalRecipe.prepTime,
            cookTime: finalRecipe.cookTime,
            chillTime: finalRecipe.chillTime,
            servings: finalRecipe.servings,
            difficulty: finalRecipe.difficulty,
            chefsNotes: finalRecipe.chefsNotes,
            toolsNeeded: finalRecipe.toolsNeeded,
            ingredients: finalRecipe.ingredients,
            steps: finalRecipe.steps,
            tips: finalRecipe.tips,
            nutritionEstimate: finalRecipe.nutritionEstimate,
            sources: sourcesList,
            status: 'complete' as const,
            progress: 1.0
        });

        // Final completion message
        const totalActiveTime = finalRecipe.prepTime + finalRecipe.cookTime;
        const chillTimeText = finalRecipe.chillTime ? ` + ${formatTime(finalRecipe.chillTime)} chill` : '';
        const completionMessage = `✓ Recipe complete! "${finalRecipe.recipeName}" features ${finalRecipe.ingredients.length} ingredients, ${finalRecipe.steps.length} steps, and takes ${formatTime(totalActiveTime)} active time (${formatTime(finalRecipe.prepTime)} prep + ${formatTime(finalRecipe.cookTime)} cook${chillTimeText}).`;

        return completionMessage;
    }
});

// export const generateRecipeTool = cached(generateRecipeToolBase);
