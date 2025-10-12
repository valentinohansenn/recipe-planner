import { artifact } from "@ai-sdk-tools/artifacts"
import { z } from "zod"

export const recipeSchema = z.object({
    recipeName: z.string().describe('The name of the recipe'),
    description: z.string().describe('Brief description of the dish'),
    prepTime: z.number().describe('Preparation time in minutes'),
    cookTime: z.number().describe('Cooking time in minutes'),
    chillTime: z.number().optional().describe('Chilling/resting time in minutes if applicable'),
    servings: z.number().describe('Number of servings'),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('Recipe difficulty level'),
    chefsNotes: z.string().max(800).optional().describe('Chef Shanice\'s concise notes (150-200 words max). Focus on the most critical technique, key ingredient choice, or essential success tip. Be warm but direct.'),
    toolsNeeded: z.array(z.string()).optional().describe('List of all kitchen tools and equipment needed for this recipe'),
    ingredients: z.array(
        z.object({
            item: z.string(),
            amount: z.string(),
            category: z.enum(['protein', 'vegetable', 'grain', 'dairy', 'spice', 'other']),
            section: z.string().optional()
        })
    ).describe('List of ingredients with amounts'),
    steps: z.array(
        z.object({
            stepNumber: z.number(),
            instruction: z.string(),
            duration: z.number().optional(),
            section: z.string().optional()
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
})

export const RecipeArtifact = artifact('recipe', z.object({
    title: z.string(),
    description: z.string(),
    prepTime: z.number(),
    cookTime: z.number(),
    chillTime: z.number().optional(),
    servings: z.number(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    chefsNotes: z.string().optional(),
    toolsNeeded: z.array(z.string()).optional(),
    ingredients: z.array(
        z.object({
            item: z.string(),
            amount: z.string(),
            category: z.enum(['protein', 'vegetable', 'grain', 'dairy', 'spice', 'other']),
            section: z.string().optional()
        })
    ),
    steps: z.array(
        z.object({
            stepNumber: z.number(),
            instruction: z.string(),
            duration: z.number().optional(),
            section: z.string().optional()
        })
    ),
    tips: z.array(z.string()).optional(),
    nutritionEstimate: z.object({
        calories: z.number(),
        protein: z.string(),
        carbs: z.string(),
        fat: z.string()
    }).optional(),
    sources: z.array(
        z.object({
            title: z.string(),
            url: z.string(),
            source: z.string().optional()
        })
    ).optional(),
    status: z.enum(['loading', 'streaming', 'complete', 'error']),
    progress: z.number().min(0).max(1).default(0)
}));

export type Recipe = z.infer<typeof RecipeArtifact.schema>
