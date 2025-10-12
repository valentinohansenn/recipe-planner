import { tool } from 'ai';
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';
import { RecipeArtifact, recipeSchema } from '@/lib/schema';
import { exa } from '@/lib/exa';
import { searchWithPerplexity } from '@/lib/perplexity';
import { generateRecipeSystem } from '@/lib/prompt';
import { formatTime } from '@/lib/time-format';
import { sendStatusMessage } from '@/lib/artifact-context';

// Types
interface SearchResult {
    title: string;
    url: string;
    source: string;
    excerpt?: string;
    fullText?: string;
    relevanceScore?: number;
}

interface RecipeConfig {
    recipeName: string;
    shouldResearch: boolean;
    targetLevel: 'basic' | 'intermediate' | 'advanced';
    servings: number;
}

interface ProgressMilestones {
    description: boolean;
    ingredients: boolean;
    steps: boolean;
    tips: boolean;
    nutrition: boolean;
    chefsNotes: boolean;
}

interface AnalysisInput {
    recipeName?: string;
    needsResearch: boolean;
    researchStrategy?: {
        sources: 'chefs' | 'blogs' | 'youtube' | 'academic' | 'any';
        keywords: string[];
        priority: 'authenticity' | 'simplicity' | 'innovation' | 'health';
    };
    technicalLevel: 'basic' | 'intermediate' | 'advanced';
    cuisineStyle?: string;
    dietaryConsiderations: string[];
    estimatedComplexity: {
        prepTime: number;
        cookTime: number;
        activeTime: number;
        skillLevel: string;
        equipmentNeeded: string[];
    };
    userIntent: string;
    successTips: string[];
    potentialChallenges: string[];
}

interface CustomizationsInput {
    servings?: number;
    forceResearch?: boolean;
    additionalRequirements?: string;
    skillLevelOverride?: 'basic' | 'intermediate' | 'advanced';
    timeConstraints?: number;
}

interface PartialRecipeData {
    recipeName?: string;
    description?: string;
    prepTime?: number;
    cookTime?: number;
    chillTime?: number;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    chefsNotes?: string;
    toolsNeeded?: (string | undefined)[];
    ingredients?: Array<{
        item?: string;
        amount?: string;
        category?: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other';
        section?: string;
    } | undefined>;
    steps?: Array<{
        stepNumber?: number;
        instruction?: string;
        duration?: number;
        section?: string;
    } | undefined>;
    tips?: (string | undefined)[];
    nutritionEstimate?: {
        calories?: number;
        protein?: string;
        carbs?: string;
        fat?: string;
    };
}

// Constants - Removed unused DOMAIN_MAP and VIDEO_SOCIAL_DOMAINS for cleaner code

// Helper Functions
function createRecipeConfig(analysis: AnalysisInput, customizations: CustomizationsInput = {}): RecipeConfig {
    return {
        recipeName: analysis.recipeName || 'Custom Recipe',
        shouldResearch: customizations.forceResearch || analysis.needsResearch,
        targetLevel: customizations.skillLevelOverride || analysis.technicalLevel,
        servings: customizations.servings || 4
    };
}

function buildSearchQuery(recipeName: string, analysis: AnalysisInput): string {
    // Start with recipe name + "recipe" for better results
    let searchQuery = `${recipeName} recipe`;

    // Add cuisine for authenticity
    if (analysis.cuisineStyle) {
        searchQuery += ` ${analysis.cuisineStyle}`;
    }

    // Add "authentic" or "traditional" for better quality sources
    if (analysis.researchStrategy?.priority === 'authenticity') {
        searchQuery += ' authentic traditional';
    }

    // Add first 2 keywords only (avoid query bloat)
    if (analysis.researchStrategy?.keywords && analysis.researchStrategy.keywords.length > 0) {
        searchQuery += ` ${analysis.researchStrategy.keywords.slice(0, 2).join(' ')}`;
    }

    return searchQuery;
}

async function performResearch(config: RecipeConfig, analysis: AnalysisInput): Promise<{ sources: SearchResult[], researchSummary: string }> {
    if (!config.shouldResearch) {
        return { sources: [], researchSummary: '' };
    }

    try {
        const searchQuery = buildSearchQuery(config.recipeName, analysis);

        console.log('[RESEARCH]: Starting fast parallel search for:', searchQuery);

        // ⚡ OPTIMIZATION: Run Perplexity and Exa in parallel for 2-3x speedup
        const [perplexityResult, exaResults] = await Promise.all([
            searchWithPerplexity(searchQuery).catch(err => {
                console.log('[RESEARCH]: Perplexity failed:', err.message);
                return null;
            }),
            exa.searchAndContents(searchQuery, {
                type: 'neural',
                numResults: 2, // Just 2 sources for speed
                text: { maxCharacters: 800 }, // Limit text extraction
                highlights: true,
            }).catch(err => {
                console.log('[RESEARCH]: Exa failed:', err.message);
                return { results: [] };
            })
        ]);

        const sources: SearchResult[] = [];
        const sourceTypes: string[] = [];

        // Add Perplexity source if available (best quality, synthesized)
        if (perplexityResult && perplexityResult.content) {
            console.log('[RESEARCH]: ✓ Perplexity found synthesized info with', perplexityResult.sources.length, 'sources');
            sources.push({
                title: `${config.recipeName} - Expert Web Research`,
                url: perplexityResult.sources[0] || 'https://perplexity.ai',
                source: 'perplexity.ai',
                excerpt: perplexityResult.content.substring(0, 150),
                fullText: perplexityResult.content.substring(0, 800), // Reduced from 1500
                relevanceScore: 1.0
            });
            sourceTypes.push('Web Research');
        }

        // Add Exa sources (fast, diverse)
        if (exaResults.results.length > 0) {
            const exaSources = exaResults.results
                .map(result => ({
                    title: result.title || 'Untitled',
                    url: result.url,
                    source: new URL(result.url).hostname.replace('www.', ''),
                    excerpt: result.highlights?.join(' ') || result.text?.substring(0, 100),
                    fullText: result.text?.substring(0, 400), // Reduced from 500
                    relevanceScore: result.score
                }))
                .filter(s => s.fullText && s.fullText.length > 80);

            const needed = Math.min(2 - sources.length, exaSources.length);
            if (needed > 0) {
                sources.push(...exaSources.slice(0, needed));
                sourceTypes.push('Web Articles');
                console.log('[RESEARCH]: ✓ Added', needed, 'Exa sources');
            }
        }

        console.log('[RESEARCH]: Final source count:', sources.length);
        console.log('[RESEARCH]: Source types:', sourceTypes.join(', '));

        const uniqueSources = [...new Set(sources.map(s => s.source))];
        const researchSummary = sources.length > 0
            ? `Found ${sources.length} sources: ${sourceTypes.join(' + ')} from ${uniqueSources.join(', ')}`
            : 'Using culinary expertise';

        return { sources, researchSummary };
    } catch (error) {
        console.error('[RESEARCH]: Research failed:', error);
        return {
            sources: [],
            researchSummary: 'Using culinary expertise (research unavailable)'
        };
    }
}

function buildPrompt(config: RecipeConfig, analysis: AnalysisInput, userQuery: string, _customizations: CustomizationsInput, sources: SearchResult[]): string {
    // Build source context - simplified for speed
    let sourceContext = '';

    if (sources.length > 0) {
        sourceContext = '\n\n**SOURCES:**\n';
        sources.forEach((s, i) => {
            // Keep it short - just 150 chars per source for faster generation
            sourceContext += `${i + 1}. ${s.title}\n${s.fullText?.substring(0, 150) || s.excerpt}...\n\n`;
        });
    }

    const dietaryContext = analysis.dietaryConsiderations && analysis.dietaryConsiderations.length > 0
        ? `\n**DIETARY:** ${analysis.dietaryConsiderations.join(', ')}`
        : '';

    return `Create ${config.targetLevel} recipe: ${config.recipeName} (${config.servings} servings)

${userQuery}${dietaryContext}
${sourceContext}

**Requirements:**
- Match source timing & techniques
- Precise measurements & clear steps
- Chef's notes ≤800 chars
- 3-4 practical tips`;
}

function filterAndValidateData(partialObject: PartialRecipeData) {
    const filteredIngredients = (partialObject.ingredients || [])
        .filter((ing): ing is NonNullable<typeof ing> => !!(ing && ing.item && ing.amount && ing.category))
        .map((ing) => ({
            item: ing.item!,
            amount: ing.amount!,
            category: ing.category!,
            section: ing.section
        }));

    const filteredSteps = (partialObject.steps || [])
        .filter((step): step is NonNullable<typeof step> => !!(step && step.instruction && typeof step.stepNumber === 'number'))
        .map((step) => ({
            stepNumber: step.stepNumber!,
            instruction: step.instruction!,
            duration: step.duration,
            section: step.section
        }));

    const filteredTips = partialObject.tips
        ? partialObject.tips.filter((tip): tip is string => tip != null && typeof tip === 'string')
        : undefined;

    const filteredTools = partialObject.toolsNeeded
        ? partialObject.toolsNeeded.filter((tool): tool is string => tool != null && typeof tool === 'string')
        : undefined;

    const nutritionEstimate = partialObject.nutritionEstimate &&
        partialObject.nutritionEstimate.calories != null &&
        partialObject.nutritionEstimate.protein != null &&
        partialObject.nutritionEstimate.carbs != null &&
        partialObject.nutritionEstimate.fat != null
        ? {
            calories: partialObject.nutritionEstimate.calories,
            protein: partialObject.nutritionEstimate.protein,
            carbs: partialObject.nutritionEstimate.carbs,
            fat: partialObject.nutritionEstimate.fat
        }
        : undefined;

    return {
        filteredIngredients,
        filteredSteps,
        filteredTips,
        filteredTools,
        nutritionEstimate
    };
}

function createCompletionSummary(finalRecipe: PartialRecipeData, config: RecipeConfig, analysis: AnalysisInput, sources: SearchResult[]) {
    const totalTime = (finalRecipe.prepTime || 0) + (finalRecipe.cookTime || 0);
    const chillTimeText = finalRecipe.chillTime ? ` + ${formatTime(finalRecipe.chillTime)} chill` : '';
    const sourceText = sources.length > 0 ? ` based on ${sources.length} expert sources` : '';
    const uniqueSources = [...new Set(sources.map(s => s.source))];

    let completionMessage = `✅ **"${finalRecipe.recipeName || 'Recipe'}" Complete!**\n\n`;
    completionMessage += `🎯 **Created ${config.targetLevel}-level recipe${sourceText}**\n`;
    if (sources.length > 0) {
        completionMessage += `📚 **Sources:** ${uniqueSources.slice(0, 3).join(', ')}${uniqueSources.length > 3 ? ` +${uniqueSources.length - 3} more` : ''}\n`;
    }
    completionMessage += `📊 **Details:** ${finalRecipe.ingredients?.length || 0} ingredients • ${finalRecipe.steps?.length || 0} steps • ${formatTime(totalTime)} total${chillTimeText}\n`;
    completionMessage += `🏆 **Difficulty:** ${finalRecipe.difficulty || 'medium'} (${analysis.estimatedComplexity.skillLevel})\n`;

    if (finalRecipe.tips && finalRecipe.tips.length > 0) {
        completionMessage += `\n💡 **Top Tips:**\n`;
        finalRecipe.tips.slice(0, 3).forEach((tip) => {
            if (tip) {
                completionMessage += `• ${tip}\n`;
            }
        });
    }

    return {
        completionMessage,
        totalTime,
        uniqueSources
    };
}

export const createRecipeTool = tool({
    description: 'Create comprehensive recipes directly from user requests with optional research and intelligent content generation. Can work with or without prior analysis.',
    inputSchema: z.object({
        analysis: z.object({
            recipeName: z.string().optional(),
            needsResearch: z.boolean().default(true),
            researchStrategy: z.object({
                sources: z.enum(['chefs', 'blogs', 'youtube', 'academic', 'any']),
                keywords: z.array(z.string()),
                priority: z.enum(['authenticity', 'simplicity', 'innovation', 'health'])
            }).optional(),
            technicalLevel: z.enum(['basic', 'intermediate', 'advanced']).default('intermediate'),
            cuisineStyle: z.string().optional(),
            dietaryConsiderations: z.array(z.string()).default([]),
            estimatedComplexity: z.object({
                prepTime: z.number().default(30),
                cookTime: z.number().default(45),
                activeTime: z.number().default(20),
                skillLevel: z.string().default('intermediate'),
                equipmentNeeded: z.array(z.string()).default(['basic kitchen tools'])
            }).optional(),
            userIntent: z.string().optional(),
            successTips: z.array(z.string()).default([]),
            potentialChallenges: z.array(z.string()).default([])
        }).optional().describe('Optional analysis results from analyzeRequest tool. If not provided, will use smart defaults.'),
        userQuery: z.string().describe('Original user request - e.g., "make tiramisu" or "Korean salt bread recipe"'),
        customizations: z.object({
            servings: z.number().default(4),
            forceResearch: z.boolean().default(false),
            additionalRequirements: z.string().optional(),
            skillLevelOverride: z.enum(['basic', 'intermediate', 'advanced']).optional(),
            timeConstraints: z.number().optional().describe('Maximum total time in minutes')
        }).optional()
    }),
    execute: async ({ analysis: providedAnalysis, userQuery, customizations = {} }) => {
        // ⚡ FAST PATH: Create smart defaults if no analysis provided
        const defaultAnalysis: AnalysisInput = {
            recipeName: userQuery.replace(/^(make|create|recipe for|how to make)\s+/i, '').trim(),
            needsResearch: true,
            technicalLevel: 'intermediate' as const,
            cuisineStyle: undefined,
            dietaryConsiderations: [],
            estimatedComplexity: {
                prepTime: 30,
                cookTime: 45,
                activeTime: 20,
                skillLevel: 'intermediate',
                equipmentNeeded: ['basic kitchen tools']
            },
            userIntent: userQuery,
            successTips: [],
            potentialChallenges: []
        };

        // Merge provided analysis with defaults
        const analysis: AnalysisInput = providedAnalysis ? {
            ...defaultAnalysis,
            ...providedAnalysis,
            estimatedComplexity: providedAnalysis.estimatedComplexity || defaultAnalysis.estimatedComplexity
        } : defaultAnalysis;
        const toolStartTime = Date.now();

        // Initialize configuration
        const config = createRecipeConfig(analysis, customizations);
        console.log(`[CREATE_RECIPE]: ⏱️  Starting recipe generation - "${config.recipeName}" (${config.targetLevel} level, ${config.servings} servings)`)

        // Send real-time status updates to the UI
        sendStatusMessage(`Creating ${config.targetLevel}-level "${config.recipeName}" for ${config.servings} servings...`)

        // Research phase
        if (config.shouldResearch) {
            sendStatusMessage(`Researching ${analysis.researchStrategy?.priority || 'authentic'} sources...`)
        }

        const researchStartTime = Date.now();

        const { sources, researchSummary } = await performResearch(config, analysis);
        const researchTime = Date.now() - researchStartTime;

        if (config.shouldResearch) {
            console.log(`[CREATE_RECIPE]: ✅ Research completed in ${researchTime}ms - Found ${sources.length} sources`)
            if (sources.length > 0) {
                sendStatusMessage(researchSummary)
            } else {
                sendStatusMessage(`Research unavailable, using culinary expertise`)
            }
        }

        // Initialize recipe artifact
        const recipe = RecipeArtifact.stream({
            title: config.recipeName,
            description: '',
            prepTime: analysis.estimatedComplexity.prepTime,
            cookTime: analysis.estimatedComplexity.cookTime,
            chillTime: undefined,
            servings: config.servings,
            difficulty: config.targetLevel === 'basic' ? 'easy' :
                config.targetLevel === 'advanced' ? 'hard' : 'medium',
            chefsNotes: undefined,
            toolsNeeded: analysis.estimatedComplexity.equipmentNeeded,
            ingredients: [],
            steps: [],
            tips: [],
            nutritionEstimate: undefined,
            sources: sources.map(s => ({
                title: s.title,
                url: s.url,
                source: s.source
            })),
            status: 'streaming',
            progress: 0.1
        });

        sendStatusMessage(config.shouldResearch
            ? `Synthesizing recipe from ${sources.length} expert sources...`
            : `Crafting recipe using culinary expertise...`)

        // Build comprehensive prompt
        const prompt = buildPrompt(config, analysis, userQuery, customizations, sources);

        // Stream recipe generation with enhanced progress
        sendStatusMessage(`Generating ingredients and instructions...`)
        const generationStart = Date.now();
        const { partialObjectStream, object } = streamObject({
            model: google('gemini-2.5-flash'),
            schema: recipeSchema,
            system: generateRecipeSystem,
            prompt,
            temperature: 1.0, // Maximum temperature for fastest generation
        });

        let currentProgress = 0.15;
        const milestones: ProgressMilestones = {
            description: false,
            ingredients: false,
            steps: false,
            tips: false,
            nutrition: false,
            chefsNotes: false
        };

        let lastPartialObject: PartialRecipeData | null = null;

        try {
            for await (const partialObject of partialObjectStream) {
                lastPartialObject = partialObject;
                // Enhanced progress calculation
                let newProgress = 0.15;

                if (partialObject.recipeName) newProgress = Math.max(newProgress, 0.18);
                if (partialObject.description) {
                    newProgress = Math.max(newProgress, 0.22);
                    milestones.description = true;
                }

                if (partialObject.chefsNotes) {
                    newProgress = Math.max(newProgress, 0.3);
                    milestones.chefsNotes = true;
                }

                if (partialObject.toolsNeeded?.length) newProgress = Math.max(newProgress, 0.35);

                if (partialObject.ingredients?.length) {
                    const ingredientProgress = Math.min(partialObject.ingredients.length / 15, 1);
                    newProgress = Math.max(newProgress, 0.35 + (ingredientProgress * 0.25));

                    if (!milestones.ingredients && partialObject.ingredients.length > 5) {
                        milestones.ingredients = true;
                        sendStatusMessage(`Generated ${partialObject.ingredients.length} ingredients...`)
                    }
                }

                if (partialObject.steps?.length) {
                    const stepProgress = Math.min(partialObject.steps.length / 10, 1);
                    newProgress = Math.max(newProgress, 0.6 + (stepProgress * 0.25));

                    if (!milestones.steps && partialObject.steps.length > 3) {
                        milestones.steps = true;
                        sendStatusMessage(`Writing step-by-step instructions...`)
                    }
                }

                if (partialObject.tips?.length && !milestones.tips) {
                    milestones.tips = true;
                    newProgress = Math.max(newProgress, 0.9);
                    sendStatusMessage(`Adding chef's tips and techniques...`)
                }

                if (partialObject.nutritionEstimate && !milestones.nutrition) {
                    milestones.nutrition = true;
                    newProgress = Math.max(newProgress, 0.95);
                    sendStatusMessage(`Calculating nutrition information...`)
                }

                currentProgress = Math.min(currentProgress + 0.02, newProgress);

                // Filter and validate data
                const {
                    filteredIngredients,
                    filteredSteps,
                    filteredTips,
                    filteredTools,
                    nutritionEstimate
                } = filterAndValidateData(partialObject);

                await recipe.update({
                    title: partialObject.recipeName || config.recipeName,
                    description: partialObject.description || '',
                    prepTime: partialObject.prepTime || analysis.estimatedComplexity.prepTime,
                    cookTime: partialObject.cookTime || analysis.estimatedComplexity.cookTime,
                    chillTime: partialObject.chillTime,
                    servings: partialObject.servings || config.servings,
                    difficulty: partialObject.difficulty || (config.targetLevel === 'basic' ? 'easy' : config.targetLevel === 'advanced' ? 'hard' : 'medium'),
                    chefsNotes: partialObject.chefsNotes,
                    toolsNeeded: filteredTools,
                    ingredients: filteredIngredients,
                    steps: filteredSteps,
                    tips: filteredTips,
                    nutritionEstimate,
                    sources: sources.map(s => ({ title: s.title, url: s.url, source: s.source })),
                    status: 'streaming',
                    progress: currentProgress
                });
            }

            const finalRecipe = await object;
            const generationTime = Date.now() - generationStart;
            const totalToolTime = Date.now() - toolStartTime;
            console.log(`[CREATE_RECIPE]: ✅ Generation completed in ${generationTime}ms - ${finalRecipe.ingredients.length} ingredients, ${finalRecipe.steps.length} steps`)

            // Complete the recipe
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
                sources: sources.map(s => ({ title: s.title, url: s.url, source: s.source })),
                status: 'complete',
                progress: 1.0
            });

            // Generate completion summary
            const { completionMessage, totalTime, uniqueSources } = createCompletionSummary(finalRecipe, config, analysis, sources);

            console.log(`[CREATE_RECIPE]: ⏱️  Total execution time: ${totalToolTime}ms (Research: ${researchTime}ms, Generation: ${generationTime}ms)`)

            // Send final status message
            sendStatusMessage(`Recipe complete: ${finalRecipe.ingredients.length} ingredients, ${finalRecipe.steps.length} steps`)

            return {
                success: true,
                recipeName: finalRecipe.recipeName,
                analysis,
                researchSummary,
                sourcesUsed: sources.length,
                primarySources: uniqueSources.slice(0, 3),
                summary: `${completionMessage}\n\n⏱️ **Timing:** Total ${totalToolTime}ms (Research: ${researchTime}ms, Generation: ${generationTime}ms)`,
                stats: {
                    totalTime,
                    activeTime: analysis.estimatedComplexity.activeTime,
                    ingredientsCount: finalRecipe.ingredients.length,
                    stepsCount: finalRecipe.steps.length,
                    difficulty: finalRecipe.difficulty,
                    technicalLevel: config.targetLevel,
                    sourcesUsed: sources.length,
                    cuisineStyle: analysis.cuisineStyle
                },
                timing: {
                    total: totalToolTime,
                    research: researchTime,
                    generation: generationTime
                },
                topTips: finalRecipe.tips?.slice(0, 3) || [],
                nextSuggestions: [
                    `Scale "${finalRecipe.recipeName}" for different servings`,
                    'Modify ingredients or cooking techniques',
                    'Explain specific cooking techniques used',
                    'Plan a complete meal around this recipe',
                    'Adapt for dietary restrictions',
                    'Learn about the cuisine and cultural background'
                ]
            };
        } catch (error) {
            console.error('[CREATE_RECIPE]: Error during generation -', error);

            // If we have partial data, complete the recipe with what we have
            if (lastPartialObject) {
                const {
                    filteredIngredients,
                    filteredSteps,
                    filteredTips,
                    filteredTools,
                    nutritionEstimate
                } = filterAndValidateData(lastPartialObject);

                await recipe.complete({
                    title: lastPartialObject.recipeName || config.recipeName,
                    description: lastPartialObject.description || '',
                    prepTime: lastPartialObject.prepTime || analysis.estimatedComplexity.prepTime,
                    cookTime: lastPartialObject.cookTime || analysis.estimatedComplexity.cookTime,
                    chillTime: lastPartialObject.chillTime,
                    servings: lastPartialObject.servings || config.servings,
                    difficulty: lastPartialObject.difficulty || (config.targetLevel === 'basic' ? 'easy' : config.targetLevel === 'advanced' ? 'hard' : 'medium'),
                    chefsNotes: lastPartialObject.chefsNotes,
                    toolsNeeded: filteredTools,
                    ingredients: filteredIngredients,
                    steps: filteredSteps,
                    tips: filteredTips,
                    nutritionEstimate,
                    sources: sources.map(s => ({ title: s.title, url: s.url, source: s.source })),
                    status: 'complete',
                    progress: 1.0
                });
            }

            // Re-throw the error so the tool can handle it
            throw error;
        }
    }
});
