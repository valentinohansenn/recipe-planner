import { tool } from 'ai';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const modifyRecipeTool = tool({
    description: 'Modify recipes for dietary restrictions, ingredient substitutions, or technique changes',
    inputSchema: z.object({
        recipeName: z.string(),
        modificationType: z.enum([
            'dietary-restriction', 'ingredient-substitution', 'technique-change',
            'healthier-version', 'easier-version', 'flavor-variation'
        ]),
        modifications: z.object({
            dietaryRestrictions: z.array(z.string()).optional(),
            substituteIngredients: z.array(z.object({
                original: z.string(),
                replacement: z.string(),
                reason: z.string().optional()
            })).optional(),
            techniqueChanges: z.array(z.string()).optional(),
            flavorProfile: z.string().optional(),
            difficultyTarget: z.enum(['easier', 'same', 'more-advanced']).optional()
        }),
        preserveAuthenticity: z.boolean().default(true)
    }),
    execute: async ({ recipeName, modificationType, modifications, preserveAuthenticity }) => {
        const startTime = Date.now();
        console.log(`[MODIFY_RECIPE]: ⏱️  Modifying "${recipeName}" - Type: ${modificationType}`)
        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: z.object({
                modifiedRecipeName: z.string(),
                changesSummary: z.string(),
                ingredientChanges: z.array(z.object({
                    original: z.string(),
                    replacement: z.string(),
                    reason: z.string(),
                    impact: z.string()
                })),
                techniqueChanges: z.array(z.object({
                    original: z.string(),
                    modified: z.string(),
                    reason: z.string(),
                    difficulty: z.enum(['easier', 'same', 'harder'])
                })),
                flavorImpact: z.string(),
                nutritionalChanges: z.string().optional(),
                successTips: z.array(z.string()),
                potentialChallenges: z.array(z.string()),
                authenticityNotes: z.string().optional()
            }),
            prompt: `Modify "${recipeName}" for: ${modificationType}

Requested modifications: ${JSON.stringify(modifications)}
Preserve authenticity: ${preserveAuthenticity}

Provide comprehensive modification analysis including:
1. All ingredient substitutions with rationale
2. Technique changes and their impact
3. Flavor and nutritional implications
4. Success tips for the modified version
5. Potential challenges to watch for
${preserveAuthenticity ? '6. Notes on maintaining authenticity while accommodating changes' : ''}`
        });

        const result = object;

        let message = `🔄 **Recipe Modification Complete!**\n\n`;
        message += `**Modified Recipe:** ${result.modifiedRecipeName}\n`;
        message += `**Changes:** ${result.changesSummary}\n\n`;

        if (result.ingredientChanges.length > 0) {
            message += `🥘 **Ingredient Changes:**\n`;
            result.ingredientChanges.forEach(change => {
                message += `• ${change.original} → ${change.replacement}\n  *${change.reason}*\n`;
            });
            message += '\n';
        }

        if (result.techniqueChanges.length > 0) {
            message += `👨‍🍳 **Technique Changes:**\n`;
            result.techniqueChanges.forEach(change => {
                message += `• ${change.original} → ${change.modified} (${change.difficulty})\n  *${change.reason}*\n`;
            });
            message += '\n';
        }

        message += `🎨 **Flavor Impact:** ${result.flavorImpact}\n`;

        if (result.nutritionalChanges) {
            message += `📊 **Nutritional Changes:** ${result.nutritionalChanges}\n`;
        }

        if (result.authenticityNotes && preserveAuthenticity) {
            message += `🌍 **Authenticity Notes:** ${result.authenticityNotes}\n`;
        }

        message += `\n💡 **Success Tips:**\n${result.successTips.map(tip => `• ${tip}`).join('\n')}`;

        if (result.potentialChallenges.length > 0) {
            message += `\n⚠️ **Watch Out For:**\n${result.potentialChallenges.map(challenge => `• ${challenge}`).join('\n')}`;
        }

        const executionTime = Date.now() - startTime;
        console.log(`[MODIFY_RECIPE]: ✅ Completed in ${executionTime}ms`);

        return {
            success: true,
            modificationType,
            modifiedRecipeName: result.modifiedRecipeName,
            message: `${message}\n\n⏱️ Modification time: ${executionTime}ms`,
            changes: {
                ingredients: result.ingredientChanges,
                techniques: result.techniqueChanges,
                flavor: result.flavorImpact,
                nutrition: result.nutritionalChanges
            },
            guidance: {
                successTips: result.successTips,
                challenges: result.potentialChallenges,
                authenticity: result.authenticityNotes
            },
            executionTime
        };
    }
});
