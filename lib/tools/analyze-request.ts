import { tool } from 'ai';
import { openai } from "@ai-sdk/openai"
import { generateObject } from 'ai';
import { z } from 'zod';

export const analyzeRequestTool = tool({
    description: 'Analyze cooking requests to determine optimal approach, research needs, technical level, and workflow strategy',
    inputSchema: z.object({
        userQuery: z.string().describe('The user\'s cooking request or question'),
        conversationContext: z.string().optional().describe('Previous conversation context'),
        userPreferences: z.object({
            dietaryRestrictions: z.array(z.string()).optional(),
            skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
            timeConstraints: z.number().optional().describe('Available time in minutes'),
            equipmentLimitations: z.array(z.string()).optional()
        }).optional()
    }),
    execute: async ({ userQuery, conversationContext, userPreferences }) => {
        const startTime = Date.now();
        console.log('[ANALYZE_REQUEST]: ⏱️  Starting analysis...')
        const { object } = await generateObject({
            model: openai('gpt-4o'),
            temperature: 0.9, // Higher temperature for faster analysis
            schema: z.object({
                // Core Classification
                queryType: z.enum([
                    'recipe-request', 'technique-question', 'ingredient-substitution',
                    'recipe-modification', 'recipe-scaling', 'meal-planning',
                    'nutrition-question', 'equipment-advice', 'troubleshooting',
                    'cuisine-exploration', 'dietary-adaptation'
                ]),
                recipeName: z.string().optional().describe('Extracted or inferred recipe name'),

                // Research Strategy
                needsResearch: z.boolean().describe('Whether to search for authentic sources'),
                researchReason: z.string().optional().describe('Specific reason research is needed'),
                researchStrategy: z.object({
                    sources: z.enum(['chefs', 'blogs', 'youtube', 'academic', 'any']),
                    keywords: z.array(z.string()),
                    priority: z.enum(['authenticity', 'simplicity', 'innovation', 'health'])
                }).optional(),

                // Technical Assessment
                technicalLevel: z.enum(['basic', 'intermediate', 'advanced']),
                complexityFactors: z.array(z.string()).optional().describe('What makes this complex/simple'),
                requiredSkills: z.array(z.string()).optional().describe('Specific cooking skills needed'),
                estimatedComplexity: z.object({
                    prepTime: z.number().describe('Estimated prep time in minutes'),
                    cookTime: z.number().describe('Estimated cook time in minutes'),
                    activeTime: z.number().describe('Hands-on time required'),
                    skillLevel: z.string().describe('Required cooking skills description'),
                    equipmentNeeded: z.array(z.string()).describe('Essential equipment')
                }),

                // Content Analysis
                cuisineStyle: z.string().optional().describe('Detected cuisine type'),
                dietaryConsiderations: z.array(z.string()).optional().describe('Dietary restrictions or preferences'),
                keyIngredients: z.array(z.string()).optional().describe('Main ingredients mentioned or implied'),
                seasonality: z.string().optional().describe('Seasonal considerations'),

                // User Intent & Context
                userIntent: z.string().describe('What the user is trying to achieve'),
                urgency: z.enum(['immediate', 'today', 'planning', 'learning']).optional(),
                context: z.string().optional().describe('Inferred context (dinner party, weeknight, etc.)'),

                // Recommendations
                recommendedApproach: z.string().describe('Best strategy for this request'),
                alternativeOptions: z.array(z.string()).optional().describe('Alternative approaches to consider'),
                potentialChallenges: z.array(z.string()).optional().describe('Potential difficulties to address'),
                successTips: z.array(z.string()).optional().describe('Key tips for success'),

                // Confidence & Next Steps
                confidence: z.number().min(0).max(1).optional().describe('Confidence in analysis'),
                nextSteps: z.array(z.string()).optional().describe('Recommended next actions'),
                followUpQuestions: z.array(z.string()).optional().describe('Questions to clarify if needed')
            }),
            prompt: `Analyze: "${userQuery}"

            ${conversationContext ? `Context: ${conversationContext}` : ''}
            ${userPreferences ? `Prefs: ${JSON.stringify(userPreferences)}` : ''}

            Provide:
            1. Type & intent
            2. Research needs (chef names, traditional recipes, trending dishes)
            3. Technical level, time estimates
            4. Cuisine, dietary needs
            5. Approach & tips

            Be brief.`
        });

        const analysis = object;
        const executionTime = Date.now() - startTime;

        // Build concise response message
        const totalTime = analysis.estimatedComplexity.prepTime + analysis.estimatedComplexity.cookTime;
        let message = `🧠 Analyzed: ${analysis.technicalLevel} level, ~${totalTime}min`;

        if (analysis.needsResearch) {
            message += `, researching ${analysis.researchStrategy?.sources || 'sources'}`;
        }

        console.log(`[ANALYZE_REQUEST]: ✅ Completed in ${executionTime}ms - Type: ${analysis.queryType}, Recipe: ${analysis.recipeName || 'N/A'}`)

        return {
            analysis,
            message: `${message}\n⏱️ Analysis time: ${executionTime}ms`,
            confidence: analysis.confidence,
            nextSteps: analysis.nextSteps,
            alternatives: analysis.alternativeOptions,
            followUpQuestions: analysis.followUpQuestions || [],
            executionTime
        };
    }
});
