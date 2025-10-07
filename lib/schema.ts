import { artifact } from "@ai-sdk-tools/artifacts"
import { z } from "zod"

export const parsingSchema = z.object({
    title: z.string(),
    description: z.string(),
    prepTime: z.number(),
    cookTime: z.number(),
    servings: z.number(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
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
    }).optional()
})

export const RecipeArtifact = artifact('recipe', z.object({
    title: z.string(),
    description: z.string(),
    prepTime: z.number(),
    cookTime: z.number(),
    servings: z.number(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
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
