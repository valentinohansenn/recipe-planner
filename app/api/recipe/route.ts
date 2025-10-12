import { convertToModelMessages } from 'ai'
import { mainAgent, recipeCreationAgent } from '@/lib/agents'
import { setArtifactContext } from '@/lib/artifact-context'

// ⚡ Fast-path patterns for direct recipe creation (bypass orchestrator)
const RECIPE_CREATION_PATTERNS = [
    /^(make|create|how to make|recipe for|cook|prepare|bake)/i,
    /^(i want to|i'd like to|can you|could you).*(make|create|cook|prepare|bake)/i,
    /(recipe|dish|meal|food).*(for|with)/i,
]

// Keywords that strongly suggest recipe creation
const RECIPE_KEYWORDS = [
    'recipe', 'make', 'create', 'cook', 'bake', 'prepare', 'dish', 'meal',
    'dessert', 'cake', 'bread', 'pasta', 'sauce', 'soup', 'salad',
    'tiramisu', 'matcha', 'chocolate', 'strawberry', 'chicken', 'beef',
    'vegan', 'vegetarian', 'gluten-free'
]

function shouldUseFastPath(lastMessage: string): boolean {
    const lowerMessage = lastMessage.toLowerCase().trim()

    // Check explicit patterns first
    if (RECIPE_CREATION_PATTERNS.some(pattern => pattern.test(lastMessage))) {
        return true
    }

    // Check if message contains recipe keywords and is short (likely a recipe name)
    // e.g., "matcha strawberry", "tiramisu", "Korean salt bread"
    const hasRecipeKeyword = RECIPE_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
    const isShortRequest = lowerMessage.split(' ').length <= 5

    if (hasRecipeKeyword && isShortRequest) {
        return true
    }

    return false
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        console.log('[AGENT_CALL]: Received request with', messages.length, 'messages')

        // Get the last user message
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()

        // Extract text content (handle both string and array formats)
        let lastMessageContent = ''
        if (lastUserMessage?.content) {
            if (typeof lastUserMessage.content === 'string') {
                lastMessageContent = lastUserMessage.content
            } else if (Array.isArray(lastUserMessage.content)) {
                // Handle array of content parts (e.g., [{type: 'text', text: '...'}])
                const textPart = lastUserMessage.content.find((part: any) => part.type === 'text')
                lastMessageContent = textPart?.text || ''
            }
        }

        console.log('[ROUTING]: Last message content:', lastMessageContent.substring(0, 100))

        // ⚡ FAST PATH: Direct recipe creation (skip orchestrator)
        // Check if the last message is a recipe request, regardless of conversation length
        const useFastPath = shouldUseFastPath(lastMessageContent)
        const selectedAgent = useFastPath ? recipeCreationAgent : mainAgent

        if (useFastPath) {
            console.log('[ROUTING]: ⚡ Fast-path to Recipe Creator (bypassing orchestrator)')
        } else {
            console.log('[ROUTING]: Using orchestrator for complex routing')
        }

        // Call the agent with artifact writer context
        return selectedAgent.toUIMessageStream({
            messages: convertToModelMessages(messages),
            maxRounds: useFastPath ? 2 : 5, // Fast path needs fewer rounds
            maxSteps: useFastPath ? 5 : 10, // Fast path needs fewer steps
            beforeStream: async ({ writer }) => {
                setArtifactContext({
                    writer,
                    userId: req.headers.get('user-id') || 'anonymous'
                })
                return true // Continue with streaming
            },
            onEvent: async (event) => {
                if (event.type === 'agent-handoff') {
                    console.log(`[HANDOFF]: ${event.from} → ${event.to}`)
                }
                if (event.type === 'agent-step') {
                    if (event.step.toolCalls && event.step.toolCalls.length > 0) {
                        event.step.toolCalls.forEach(call => {
                            console.log(`[TOOL CALL]: ${call.toolName}`)
                        })
                    }
                }
            },
        })
    } catch (error) {
        console.error('[AGENT_ERROR]:', error)
        return new Response(
            JSON.stringify({ error: 'Failed to process request' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}
