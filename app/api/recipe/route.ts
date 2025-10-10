import { system } from '@/lib/prompt'
import {
    generateRecipeTool,
    searchRecipesTool,
} from '@/lib/tools'
import { google } from '@ai-sdk/google'
import { streamText, createUIMessageStream, createUIMessageStreamResponse, convertToModelMessages, stepCountIs } from 'ai'
import { artifacts } from '@ai-sdk-tools/artifacts'

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        console.log('Received recipe request with', messages.length, 'messages')
        console.log('Latest message:', messages[messages.length - 1])

        // Log tool calls for debugging
        const lastMessage = messages[messages.length - 1]
        if (lastMessage?.parts) {
            const toolCalls = lastMessage.parts.filter((part: any) => part.type?.startsWith('tool'))
            console.log('Tool calls in last message:', toolCalls.length)
            toolCalls.forEach((call: any) => console.log('Tool call:', call.type, call))
        }

        // Create UI message stream with artifact context
        const stream = createUIMessageStream({
            execute: ({ writer }) => {
                // Set artifact context with writer
                artifacts.setContext({ writer })

                // Stream text with tools
                const result = streamText({
                    model: google('gemini-2.5-flash'),
                    system,
                    messages: convertToModelMessages(messages),
                    tools: {
                        generateRecipe: generateRecipeTool,
                        searchRecipes: searchRecipesTool,
                    },
                    toolChoice: 'auto',
                    temperature: 0.7, // Balanced creativity and consistency
                })

                // Merge the result stream into the writer
                writer.merge(result.toUIMessageStream())
            },
        })

        return createUIMessageStreamResponse({ stream })
    } catch (error) {
        console.error('Error in recipe API:', error)
        return new Response(JSON.stringify({ error: 'Failed to process recipe request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
