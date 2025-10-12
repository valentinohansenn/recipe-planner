import { createTypedContext, BaseContext } from '@ai-sdk-tools/artifacts'

// Define context type for artifact writer
interface RecipeContext extends BaseContext {
    userId?: string;
}

// Create typed context helpers
export const { setContext: setArtifactContext, getContext: getArtifactContext } = createTypedContext<RecipeContext>()

// Helper function to send status messages to the UI
export function sendStatusMessage(message: string) {
    try {
        const context = getArtifactContext()
        if (context?.writer) {
            // Send custom data message that will be picked up by the frontend
            // Note: Custom data types MUST start with "data-" prefix
            // and use the "data" property for the payload
            context.writer.write({
                type: 'data-recipe-status',
                data: { message }
            })
        }
    } catch (error) {
        // Silently fail if context not available
        console.log('[STATUS]:', message)
    }
}

