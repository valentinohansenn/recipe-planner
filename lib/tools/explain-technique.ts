import { tool } from 'ai';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const explainTechniqueTool = tool({
    description: 'Provide detailed explanations of cooking techniques, science, and methods',
    inputSchema: z.object({
        technique: z.string().describe('The cooking technique to explain'),
        context: z.string().optional().describe('Recipe or dish context'),
        level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
        includeScience: z.boolean().default(true),
        includeVariations: z.boolean().default(true),
        includeTroubleshooting: z.boolean().default(true)
    }),
    execute: async ({ technique, context, level, includeScience, includeVariations, includeTroubleshooting }) => {
        const startTime = Date.now();
        console.log(`[EXPLAIN_TECHNIQUE]: ⏱️  Explaining "${technique}"...`);

        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: z.object({
                techniqueName: z.string(),
                definition: z.string(),
                purpose: z.string(),
                stepByStepProcess: z.array(z.object({
                    step: z.number(),
                    action: z.string(),
                    details: z.string(),
                    timing: z.string().optional(),
                    visualCues: z.string().optional()
                })),
                keyPrinciples: z.array(z.string()),
                commonMistakes: z.array(z.string()),
                successIndicators: z.array(z.string()),
                equipment: z.array(z.string()),
                variations: z.array(z.object({
                    name: z.string(),
                    description: z.string(),
                    whenToUse: z.string()
                })).optional(),
                science: z.object({
                    whatHappens: z.string(),
                    whyItWorks: z.string(),
                    keyFactors: z.array(z.string())
                }).optional(),
                troubleshooting: z.array(z.object({
                    problem: z.string(),
                    cause: z.string(),
                    solution: z.string()
                })).optional(),
                practiceExercises: z.array(z.string()),
                relatedTechniques: z.array(z.string())
            }),
            prompt: `Explain the cooking technique: "${technique}"
            ${context ? `In the context of: ${context}` : ''}

            Target level: ${level}
            Include science: ${includeScience}
            Include variations: ${includeVariations}
            Include troubleshooting: ${includeTroubleshooting}

            Provide a comprehensive explanation suitable for ${level} cooks, covering:
            1. Clear definition and purpose
            2. Step-by-step process with timing and visual cues
            3. Key principles and success factors
            4. Common mistakes and how to avoid them
            ${includeScience ? '5. The science behind why it works' : ''}
            ${includeVariations ? '6. Variations and when to use them' : ''}
            ${includeTroubleshooting ? '7. Troubleshooting common problems' : ''}
            8. Practice exercises to master the technique`
        });

        const explanation = object;

        let message = `🎓 **Technique Masterclass: ${explanation.techniqueName}**\n\n`;
        message += `**Definition:** ${explanation.definition}\n`;
        message += `**Purpose:** ${explanation.purpose}\n\n`;

        message += `👨‍🍳 **Step-by-Step Process:**\n`;
        explanation.stepByStepProcess.forEach(step => {
            message += `${step.step}. **${step.action}**\n   ${step.details}`;
            if (step.timing) message += `\n   ⏱️ *Timing: ${step.timing}*`;
            if (step.visualCues) message += `\n   👀 *Look for: ${step.visualCues}*`;
            message += '\n\n';
        });

        message += `🎯 **Key Principles:**\n${explanation.keyPrinciples.map(principle => `• ${principle}`).join('\n')}\n\n`;

        message += `🔧 **Equipment Needed:**\n${explanation.equipment.map(item => `• ${item}`).join('\n')}\n\n`;

        if (explanation.science && includeScience) {
            message += `🧪 **The Science:**\n`;
            message += `**What Happens:** ${explanation.science.whatHappens}\n`;
            message += `**Why It Works:** ${explanation.science.whyItWorks}\n`;
            message += `**Key Factors:** ${explanation.science.keyFactors.join(', ')}\n\n`;
        }

        message += `✅ **Success Indicators:**\n${explanation.successIndicators.map(indicator => `• ${indicator}`).join('\n')}\n\n`;

        message += `❌ **Common Mistakes:**\n${explanation.commonMistakes.map(mistake => `• ${mistake}`).join('\n')}\n\n`;

        if (explanation.variations && includeVariations) {
            message += `🔄 **Variations:**\n`;
            explanation.variations.forEach(variation => {
                message += `• **${variation.name}:** ${variation.description}\n  *When to use: ${variation.whenToUse}*\n`;
            });
            message += '\n';
        }

        if (explanation.troubleshooting && includeTroubleshooting) {
            message += `🚨 **Troubleshooting:**\n`;
            explanation.troubleshooting.forEach(issue => {
                message += `• **Problem:** ${issue.problem}\n  **Cause:** ${issue.cause}\n  **Solution:** ${issue.solution}\n\n`;
            });
        }

        message += `🏋️ **Practice Exercises:**\n${explanation.practiceExercises.map(exercise => `• ${exercise}`).join('\n')}\n\n`;

        message += `🔗 **Related Techniques:** ${explanation.relatedTechniques.join(', ')}`;

        const executionTime = Date.now() - startTime;
        console.log(`[EXPLAIN_TECHNIQUE]: ✅ Completed in ${executionTime}ms`);

        return {
            success: true,
            technique: explanation.techniqueName,
            level,
            message: `${message}\n\n⏱️ Explanation time: ${executionTime}ms`,
            content: explanation,
            executionTime,
            nextSteps: [
                'Practice this technique with a simple recipe',
                'Learn related techniques',
                'Explore variations and applications',
                'Study the science behind other cooking methods'
            ]
        };
    }
});
