import { tool } from 'ai';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const planMealTool = tool({
    description: 'Create comprehensive meal plans with recipes, shopping lists, and prep schedules',
    inputSchema: z.object({
        planType: z.enum(['single-meal', 'daily', 'weekly', 'event']),
        requirements: z.object({
            people: z.number().default(4),
            dietaryRestrictions: z.array(z.string()).optional(),
            cuisinePreferences: z.array(z.string()).optional(),
            timeConstraints: z.object({
                prepTime: z.number().optional(),
                cookTime: z.number().optional(),
                totalTime: z.number().optional()
            }).optional(),
            skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
            budget: z.enum(['budget', 'moderate', 'premium']).optional(),
            occasion: z.string().optional()
        }),
        preferences: z.object({
            includeShoppingList: z.boolean().default(true),
            includePrepSchedule: z.boolean().default(true),
            includeNutrition: z.boolean().default(true),
            balanceNutrition: z.boolean().default(true),
            minimizeWaste: z.boolean().default(true)
        }).optional()
    }),
    execute: async ({ planType, requirements, preferences = {} }) => {
        const startTime = Date.now();
        console.log(`[PLAN_MEAL]: ⏱️  Creating ${planType} meal plan for ${requirements.people} people...`);

        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: z.object({
                planTitle: z.string(),
                overview: z.string(),
                meals: z.array(z.object({
                    name: z.string(),
                    type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'appetizer', 'dessert']),
                    description: z.string(),
                    servings: z.number(),
                    prepTime: z.number(),
                    cookTime: z.number(),
                    difficulty: z.enum(['easy', 'medium', 'hard']),
                    keyIngredients: z.array(z.string()),
                    dietaryTags: z.array(z.string()),
                    estimatedCost: z.enum(['$', '$$', '$$$']).optional()
                })),
                shoppingList: z.object({
                    produce: z.array(z.string()),
                    proteins: z.array(z.string()),
                    dairy: z.array(z.string()),
                    pantry: z.array(z.string()),
                    other: z.array(z.string())
                }).optional(),
                prepSchedule: z.array(z.object({
                    timeframe: z.string(),
                    tasks: z.array(z.string()),
                    duration: z.string()
                })).optional(),
                nutritionSummary: z.object({
                    totalCalories: z.number(),
                    proteinBalance: z.string(),
                    vegetableServings: z.number(),
                    balanceNotes: z.string()
                }).optional(),
                tips: z.array(z.string()),
                alternatives: z.array(z.string())
            }),
            prompt: `Create a ${planType} meal plan for ${requirements.people} people.

Requirements:
${JSON.stringify(requirements, null, 2)}

Preferences:
${JSON.stringify(preferences, null, 2)}

Create a well-balanced, practical meal plan that:
1. Meets all dietary requirements and preferences
2. Fits within time and skill constraints
3. Provides nutritional balance
4. Minimizes food waste through smart ingredient usage
5. Includes practical preparation guidance

${preferences.includeShoppingList ? 'Include a organized shopping list by category.' : ''}
${preferences.includePrepSchedule ? 'Include a prep schedule to maximize efficiency.' : ''}
${preferences.includeNutrition ? 'Include nutritional analysis and balance notes.' : ''}`
        });

        const plan = object;

        let message = `🍽️ **${plan.planTitle}**\n\n`;
        message += `${plan.overview}\n\n`;

        message += `📋 **Meal Plan:**\n`;
        plan.meals.forEach(meal => {
            message += `• **${meal.name}** (${meal.type})\n`;
            message += `  ${meal.description}\n`;
            message += `  ⏱️ ${meal.prepTime + meal.cookTime} min • 👥 ${meal.servings} servings • 🎯 ${meal.difficulty}`;
            if (meal.estimatedCost) message += ` • 💰 ${meal.estimatedCost}`;
            message += `\n  🥘 Key ingredients: ${meal.keyIngredients.join(', ')}\n\n`;
        });

        if (plan.shoppingList && preferences.includeShoppingList) {
            message += `🛒 **Shopping List:**\n`;
            if (plan.shoppingList.produce.length) message += `**Produce:** ${plan.shoppingList.produce.join(', ')}\n`;
            if (plan.shoppingList.proteins.length) message += `**Proteins:** ${plan.shoppingList.proteins.join(', ')}\n`;
            if (plan.shoppingList.dairy.length) message += `**Dairy:** ${plan.shoppingList.dairy.join(', ')}\n`;
            if (plan.shoppingList.pantry.length) message += `**Pantry:** ${plan.shoppingList.pantry.join(', ')}\n`;
            if (plan.shoppingList.other.length) message += `**Other:** ${plan.shoppingList.other.join(', ')}\n`;
            message += '\n';
        }

        if (plan.prepSchedule && preferences.includePrepSchedule) {
            message += `📅 **Prep Schedule:**\n`;
            plan.prepSchedule.forEach(phase => {
                message += `**${phase.timeframe}** (${phase.duration}):\n`;
                phase.tasks.forEach(task => message += `• ${task}\n`);
                message += '\n';
            });
        }

        if (plan.nutritionSummary && preferences.includeNutrition) {
            message += `📊 **Nutrition Summary:**\n`;
            message += `• Total calories: ~${plan.nutritionSummary.totalCalories}\n`;
            message += `• Protein balance: ${plan.nutritionSummary.proteinBalance}\n`;
            message += `• Vegetable servings: ${plan.nutritionSummary.vegetableServings}\n`;
            message += `• Balance notes: ${plan.nutritionSummary.balanceNotes}\n\n`;
        }

        message += `💡 **Success Tips:**\n${plan.tips.map(tip => `• ${tip}`).join('\n')}\n\n`;

        if (plan.alternatives.length > 0) {
            message += `🔄 **Alternative Options:**\n${plan.alternatives.map(alt => `• ${alt}`).join('\n')}`;
        }

        const executionTime = Date.now() - startTime;
        console.log(`[PLAN_MEAL]: ✅ Completed in ${executionTime}ms - ${plan.meals.length} meals planned`);

        return {
            success: true,
            planType,
            planTitle: plan.planTitle,
            message: `${message}\n\n⏱️ Planning time: ${executionTime}ms`,
            mealCount: plan.meals.length,
            totalPeople: requirements.people,
            plan,
            executionTime,
            nextSteps: [
                'Get detailed recipes for specific meals',
                'Modify meals for dietary preferences',
                'Scale the plan for different group sizes',
                'Create shopping list with quantities',
                'Plan prep timeline in detail'
            ]
        };
    }
});
