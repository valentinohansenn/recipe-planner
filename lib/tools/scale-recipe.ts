import { tool } from 'ai';
import { z } from 'zod';
import { formatTime } from '@/lib/time-format';

export const scaleRecipeTool = tool({
    description: 'Intelligently scale recipe ingredients and adjust cooking parameters',
    inputSchema: z.object({
        targetServings: z.number().min(1).max(50),
        originalServings: z.number().min(1),
        recipeName: z.string(),
        recipeData: z.object({
            ingredients: z.array(z.object({
                item: z.string(),
                amount: z.string(),
                category: z.string()
            })),
            prepTime: z.number(),
            cookTime: z.number(),
            difficulty: z.enum(['easy', 'medium', 'hard'])
        }).optional(),
        scalingPreferences: z.object({
            roundToNiceNumbers: z.boolean().default(true),
            adjustCookingTimes: z.boolean().default(true),
            provideTips: z.boolean().default(true)
        }).optional()
    }),
    execute: async ({ targetServings, originalServings, recipeName, recipeData, scalingPreferences = {} }) => {
        const startTime = Date.now();
        console.log(`[SCALE_RECIPE]: ⏱️  Scaling "${recipeName}" from ${originalServings} to ${targetServings} servings (${(targetServings / originalServings).toFixed(2)}x)`)
        const scaleFactor = targetServings / originalServings;
        const isScalingUp = scaleFactor > 1;
        const isScalingDown = scaleFactor < 1;
        const isMajorChange = scaleFactor > 2 || scaleFactor < 0.5;

        // Calculate time adjustments
        let timeAdjustments = '';
        if (scalingPreferences.adjustCookingTimes && recipeData) {
            const prepTimeAdjustment = isScalingUp ? Math.ceil(recipeData.prepTime * 1.1) : recipeData.prepTime;
            const cookTimeAdjustment = isMajorChange ?
                (isScalingUp ? Math.ceil(recipeData.cookTime * 1.15) : Math.ceil(recipeData.cookTime * 0.9)) :
                recipeData.cookTime;

            timeAdjustments = `\n⏱️ **Adjusted Times:**\n• Prep: ${formatTime(prepTimeAdjustment)} (${prepTimeAdjustment > recipeData.prepTime ? '+' : ''}${prepTimeAdjustment - recipeData.prepTime} min)\n• Cook: ${formatTime(cookTimeAdjustment)} (${cookTimeAdjustment > recipeData.cookTime ? '+' : ''}${cookTimeAdjustment - recipeData.cookTime} min)`;
        }

        // Generate scaling tips
        let scalingTips = '';
        if (scalingPreferences.provideTips) {
            const tips = [];

            if (isMajorChange) {
                tips.push('Major scaling may require equipment changes (larger pots, multiple batches)');
            }

            if (isScalingUp) {
                tips.push('Taste and adjust seasonings gradually - they don\'t always scale linearly');
                tips.push('Consider cooking in batches if your equipment is too small');
            }

            if (isScalingDown) {
                tips.push('Small amounts can cook faster - watch timing carefully');
                tips.push('Some ingredients (like eggs) may be hard to scale down precisely');
            }

            if (scaleFactor !== Math.round(scaleFactor)) {
                tips.push('Use kitchen scale for accuracy with fractional measurements');
            }

            if (tips.length > 0) {
                scalingTips = `\n💡 **Scaling Tips:**\n${tips.map(tip => `• ${tip}`).join('\n')}`;
            }
        }

        // Equipment considerations
        let equipmentNotes = '';
        if (isMajorChange) {
            equipmentNotes = `\n🔧 **Equipment Notes:**\n• ${isScalingUp ? 'Larger' : 'Smaller'} pots, pans, and mixing bowls may be needed\n• ${isScalingUp ? 'Consider batch cooking if equipment is limiting' : 'Smaller equipment may cook faster'}`;
        }

        const message = `📏 **Scaling Complete!**\n\n"${recipeName}" scaled from ${originalServings} to ${targetServings} servings\n🔢 **Scale Factor:** ${scaleFactor.toFixed(2)}x\n\n📝 **Instructions:**\n• Multiply all ingredient amounts by **${scaleFactor.toFixed(2)}**${scalingPreferences.roundToNiceNumbers ? '\n• Round to convenient measurements (1.3 cups → 1⅓ cups)' : ''}${timeAdjustments}${scalingTips}${equipmentNotes}`;

        const executionTime = Date.now() - startTime;
        console.log(`[SCALE_RECIPE]: ✅ Completed in ${executionTime}ms`);

        return {
            success: true,
            scaleFactor,
            originalServings,
            targetServings,
            message: `${message}\n\n⏱️ Scaling time: ${executionTime}ms`,
            adjustments: {
                timeChanges: scalingPreferences.adjustCookingTimes,
                equipmentChanges: isMajorChange,
                batchCookingRecommended: isScalingUp && isMajorChange
            },
            executionTime
        };
    }
});
