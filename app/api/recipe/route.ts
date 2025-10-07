import { system } from '@/lib/system-prompt'
import {
    generateRecipeTool,
    processScrapedRecipeTool,
    searchRecipesTool,
} from '@/lib/tools'
import { google } from '@ai-sdk/google'
import { streamText, createUIMessageStream, createUIMessageStreamResponse, convertToModelMessages } from 'ai'
import { artifacts } from '@ai-sdk-tools/artifacts'

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        console.log('Received recipe request with', messages.length, 'messages')
        console.log('Latest message:', messages[messages.length - 1])

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
                        processScrapedRecipe: processScrapedRecipeTool,
                    },
                    toolChoice: 'required',
                })

                // Merge the result stream into the writer
                writer.merge(result.toUIMessageStream())
            }
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
