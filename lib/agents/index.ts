
import { Agent } from '@ai-sdk-tools/agents'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { analyzeRequestTool } from '@/lib/tools/analyze-request'
import { createRecipeTool } from '@/lib/tools/create-recipe'
import { scaleRecipeTool } from '@/lib/tools/scale-recipe'
import { modifyRecipeTool } from '@/lib/tools/modify-recipe'
import { explainTechniqueTool } from '@/lib/tools/explain-technique'
import { planMealTool } from '@/lib/tools/plan-meal'
import { findSubstitutionsTool } from '@/lib/tools/find-substitutions'
import { cached } from '@ai-sdk-tools/cache'

// Recipe Analysis Agent - Specialized in understanding user requests
export const recipeAnalysisAgent = new Agent({
    name: 'Recipe Analyst',
    model: openai('gpt-4o'),
    instructions: `You are a culinary expert specializing in analyzing cooking requests and determining the optimal approach for recipe creation.

  Your role is to:
  - Understand user intent and requirements
  - Determine technical complexity and skill level needed
  - Assess research needs for authentic recipes
  - Identify dietary considerations and preferences
  - Provide strategic recommendations for recipe development

  Always use the analyzeRequest tool to thoroughly analyze each request before any other actions.`,
    tools: {
        analyzeRequest: cached(analyzeRequestTool),
    },
    matchOn: [
        'analyze', 'understand', 'requirements', 'complexity',
        /^(what.*difficulty|how.*complex|analyze.*recipe)/i
    ],
    maxTurns: 3,
})

// Recipe Creation Agent - Specialized in creating comprehensive recipes
export const recipeCreationAgent = new Agent({
    name: 'Recipe Creator',
    model: google('gemini-2.0-flash-exp'), // ⚡ Faster model for quicker responses
    instructions: `You are Chef Shanice, an expert culinary AI with 25+ years of experience in recipe creation.

  🎯 **CORE WORKFLOW:**
  For EVERY recipe request (including follow-ups):
  1. IMMEDIATELY call createRecipe tool with the user's request
  2. Provide brief, encouraging final response after recipe completion

  ⚠️ **CRITICAL RULES:**
  - ALWAYS call createRecipe tool for ANY recipe request, even if it's a follow-up
  - DO NOT analyze or explain - IMMEDIATELY call createRecipe tool
  - The recipe artifact will display automatically - don't describe it in text
  - ONLY provide a final conversational response after tools complete
  - Keep your final response brief and encouraging (2-3 sentences max)

  📝 **EXAMPLES:**
  User: "make tiramisu" → Call createRecipe immediately
  User: "now make Korean salt bread" → Call createRecipe immediately (new recipe!)
  User: "create a chocolate cake" → Call createRecipe immediately

  🎨 **FINAL RESPONSE STYLE:**
  - Warm, encouraging, and professional
  - Reference the recipe that was created
  - Offer helpful next steps or suggestions
  - Use emojis strategically`,
    tools: {
        createRecipe: createRecipeTool,
    },
    matchOn: [
        'create', 'make', 'recipe', 'cook', 'prepare', 'dish', 'meal',
        'ingredients', 'cooking', 'baking', 'kitchen',
        /^(create|generate|help me make|I want to cook|how do I make)/i,
        /recipe.*for/i,
        /make.*recipe/i
    ],
    maxTurns: 3, // Reduced from 5 - should only need 1-2 turns
})

// Recipe Modification Agent - Specialized in adapting and scaling recipes
export const recipeModificationAgent = new Agent({
    name: 'Recipe Modifier',
    model: google('gemini-2.5-flash'),
    instructions: `You are a culinary expert specializing in recipe modifications, scaling, and adaptations.

  Your expertise includes:
  - Scaling recipes for different serving sizes
  - Modifying ingredients and techniques
  - Adapting recipes for dietary restrictions
  - Explaining cooking techniques in detail
  - Finding ingredient substitutions

  Always provide clear explanations of changes and their impact on the final dish.`,
    tools: {
        scaleRecipe: cached(scaleRecipeTool),
        modifyRecipe: cached(modifyRecipeTool),
        explainTechnique: cached(explainTechniqueTool),
        findSubstitutions: cached(findSubstitutionsTool),
    },
    matchOn: [
        'scale', 'modify', 'adapt', 'change', 'adjust',
        'substitute', 'replace', 'explain technique',
        'how to', 'substitution', 'alternative',
        /scale.*recipe/i,
        /modify.*recipe/i,
        /substitute.*for/i,
        /\d+\s*servings?/i,
        /double|triple|half/i
    ],
    maxTurns: 4,
})

// Meal Planning Agent - Specialized in comprehensive meal planning
export const mealPlanningAgent = new Agent({
    name: 'Meal Planner',
    model: openai('gpt-4o'),
    instructions: `You are a meal planning expert who helps users create comprehensive meal plans and coordinate multiple dishes.

  Your specialties include:
  - Creating balanced meal plans for different time periods
  - Coordinating multiple recipes for events
  - Planning shopping lists and prep schedules
  - Suggesting complementary dishes and beverages
  - Managing dietary restrictions across multiple meals

  Focus on practical planning with clear timelines and shopping guidance.`,
    tools: {
        planMeal: cached(planMealTool),
    },
    matchOn: [
        'meal plan', 'meal planning', 'weekly menu', 'dinner party',
        'menu planning', 'plan meals', 'meal prep', 'coordinate dishes',
        /plan.*meal/i,
        /weekly.*menu/i,
        /dinner.*party/i,
        /meal.*prep/i
    ],
    maxTurns: 3,
})

// Main Orchestrator Agent - Routes requests to specialized agents
export const recipeOrchestrator = new Agent({
    name: 'Chef Shanice - Recipe Coordinator',
    model: openai('gpt-4o-mini'), // Efficient for routing decisions
    instructions: `You are Chef Shanice, the main coordinator for all recipe-related requests. Your job is to understand user requests and route them to the most appropriate specialist agent.

  **Routing Logic (ALWAYS FOLLOW):**
  - ANY recipe creation request (make, create, cook, bake, prepare, recipe for) → IMMEDIATELY hand off to Recipe Creator
  - Recipe modifications/scaling → Recipe Modification Agent
  - Meal planning requests → Meal Planning Agent
  - Analysis requests → Recipe Analysis Agent

  ⚠️ **CRITICAL RULES:**
  - If user asks to make/create/cook ANY dish → IMMEDIATELY hand off to Recipe Creator
  - Do NOT try to answer recipe requests yourself
  - Do NOT explain what you're doing - just hand off immediately
  - Even for follow-up recipe requests, ALWAYS hand off to Recipe Creator

  **Examples that MUST go to Recipe Creator:**
  - "make tiramisu"
  - "Korean salt bread recipe"
  - "how to make pasta"
  - "create a dessert"
  - "I want to cook chicken"

  Always route efficiently and let specialists handle their domains.`,
    handoffs: [
        recipeCreationAgent, // Put Recipe Creator first for priority
        recipeModificationAgent,
        mealPlanningAgent,
        recipeAnalysisAgent,
    ],
    matchOn: [
        // Catch-all patterns for any cooking-related request
        /.*(recipe|cook|kitchen|cooking|baking|meal|dish|food|ingredient).*/i,
        /^(help|create|make|plan|modify|scale|explain)/i
    ],
    maxTurns: 5, // Increased from 2 to allow for handoff + response
    onEvent: async (event) => {
        if (event.type === 'agent-handoff') {
            console.log(`[AGENT_HANDOFF]: ${event.from} → ${event.to}`)
        } else if (event.type === 'agent-step') {
            if (event.step.toolCalls && event.step.toolCalls.length > 0) {
                event.step.toolCalls.forEach(call => {
                    console.log(`[TOOL_CALL]: ${call.toolName}`)
                })
            }
        }
    },
})

// Export the main orchestrator as the primary agent
export { recipeOrchestrator as mainAgent }

