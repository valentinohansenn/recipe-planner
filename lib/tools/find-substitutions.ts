import { tool } from 'ai';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const findSubstitutionsTool = tool({
    description: 'Find ingredient substitutions with detailed ratios, impacts, and usage guidance',
    inputSchema: z.object({
        ingredient: z.string().describe('The ingredient to substitute'),
        reason: z.enum(['allergy', 'dietary-restriction', 'unavailable', 'preference', 'health', 'cost']),
        context: z.string().optional().describe('Recipe or cooking context'),
        dietaryRestrictions: z.array(z.string()).optional(),
        prioritize: z.enum(['flavor', 'texture', 'nutrition', 'convenience', 'cost']).default('flavor')
    }),
    execute: async ({ ingredient, reason, context, dietaryRestrictions, prioritize }) => {
        const startTime = Date.now();
        console.log(`[FIND_SUBSTITUTIONS]: ⏱️  Finding substitutions for "${ingredient}"...`);

        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: z.object({
                originalIngredient: z.string(),
                substitutions: z.array(z.object({
                    substitute: z.string(),
                    ratio: z.string(),
                    flavorImpact: z.string(),
                    textureImpact: z.string(),
                    nutritionImpact: z.string(),
                    bestFor: z.array(z.string()),
                    limitations: z.array(z.string()),
                    confidence: z.number().min(1).max(5),
                    cost: z.enum(['cheaper', 'similar', 'more-expensive']),
                    availability: z.enum(['common', 'specialty', 'rare'])
                })),
                generalGuidance: z.string(),
                contextSpecificTips: z.array(z.string()),
                whatToAvoid: z.array(z.string()),
                emergencyOptions: z.array(z.string())
            }),
            prompt: `Find substitutions for: "${ingredient}"

            Reason for substitution: ${reason}
            ${context ? `Recipe context: ${context}` : ''}
            ${dietaryRestrictions ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}` : ''}
            Priority: ${prioritize}

            Provide comprehensive substitution options including:
            1. Multiple substitution options ranked by suitability
            2. Exact ratios and conversion instructions
            3. Impact on flavor, texture, and nutrition
            4. Best use cases and limitations for each option
            5. Context-specific guidance
            6. Emergency/last-resort options

            Consider the reason for substitution and prioritize ${prioritize} in recommendations.`
        });

        const result = object;

        let message = `🔄 **Substitutions for ${result.originalIngredient}**\n\n`;
        message += `**Reason:** ${reason} | **Priority:** ${prioritize}\n\n`;

        message += `📋 **Recommended Substitutions:**\n`;
        result.substitutions
            .sort((a, b) => b.confidence - a.confidence)
            .forEach((sub, index) => {
                message += `**${index + 1}. ${sub.substitute}** (${sub.confidence}/5 ⭐)\n`;
                message += `   **Ratio:** ${sub.ratio}\n`;
                message += `   **Flavor:** ${sub.flavorImpact}\n`;
                message += `   **Texture:** ${sub.textureImpact}\n`;
                message += `   **Nutrition:** ${sub.nutritionImpact}\n`;
                message += `   **Best for:** ${sub.bestFor.join(', ')}\n`;
                message += `   **Cost:** ${sub.cost} | **Availability:** ${sub.availability}\n`;
                if (sub.limitations.length > 0) {
                    message += `   **Limitations:** ${sub.limitations.join(', ')}\n`;
                }
                message += '\n';
            });

        message += `💡 **General Guidance:**\n${result.generalGuidance}\n\n`;

        if (result.contextSpecificTips.length > 0) {
            message += `🎯 **Context-Specific Tips:**\n${result.contextSpecificTips.map(tip => `• ${tip}`).join('\n')}\n\n`;
        }

        if (result.whatToAvoid.length > 0) {
            message += `❌ **Avoid These:**\n${result.whatToAvoid.map(avoid => `• ${avoid}`).join('\n')}\n\n`;
        }

        if (result.emergencyOptions.length > 0) {
            message += `🚨 **Emergency Options:**\n${result.emergencyOptions.map(option => `• ${option}`).join('\n')}`;
        }

        const executionTime = Date.now() - startTime;
        console.log(`[FIND_SUBSTITUTIONS]: ✅ Completed in ${executionTime}ms - Found ${result.substitutions.length} substitutions`);

        return {
            success: true,
            originalIngredient: ingredient,
            reason,
            prioritize,
            message: `${message}\n\n⏱️ Search time: ${executionTime}ms`,
            substitutions: result.substitutions,
            topRecommendation: result.substitutions.sort((a, b) => b.confidence - a.confidence)[0],
            guidance: {
                general: result.generalGuidance,
                contextSpecific: result.contextSpecificTips,
                warnings: result.whatToAvoid,
                emergency: result.emergencyOptions
            },
            executionTime
        };
    }
});
