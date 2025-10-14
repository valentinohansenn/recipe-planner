"use client"

import {
	useChatMessages,
	useChatSendMessage,
	useChatStatus,
} from "@ai-sdk-tools/store"
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
	PromptInput,
	PromptInputBody,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
	PromptInputSubmit,
	type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import { ChatMessageCard } from "./chat-message-card"
import { useRecipeContext } from "@/contexts/recipe-context"

export function LeftPanel() {
	const messages = useChatMessages()
	const sendMessage = useChatSendMessage()
	const status = useChatStatus()
	const { recipeVersions } = useRecipeContext()

	const isLoading = status === "submitted" || status === "streaming"

	const handleSubmit = (message: PromptInputMessage) => {
		if (!message.text?.trim()) return
		sendMessage({ text: message.text })
	}

	// Extract all status messages from all messages for real-time display
	const allStatusMessages = messages.flatMap((message) =>
		message.parts
			.filter((part) => part.type === "data-recipe-status")
			.map((part) => {
				const dataPart = part as { type: string; data?: { message?: string } }
				return dataPart.data?.message
			})
			.filter(Boolean)
	)

	return (
		<div className="flex flex-col h-full">
			{/* Chat History */}
			<Conversation className="flex-1">
				<ConversationContent className="space-y-4 p-4">
					{messages.map((message, index) => {
						const content = message.parts
							.filter((part) => part.type === "text")
							.map((part) => part.text)
							.join("")

						// Extract status messages from this message
						const statusMessages = message.parts
							.filter((part) => part.type === "data-recipe-status")
							.map((part) => {
								const dataPart = part as { type: string; data?: { message?: string } }
								return dataPart.data?.message
							})
							.filter(Boolean)

						// For the last streaming message, show all accumulated status messages
						const displayStatusMessages: string[] =
							index === messages.length - 1 && isLoading
								? allStatusMessages.filter((msg): msg is string => typeof msg === 'string')
								: statusMessages.filter((msg): msg is string => typeof msg === 'string')

						// Show message if it has content OR if it's streaming with status messages
						const shouldShow =
							content.length > 0 ||
							(index === messages.length - 1 &&
								isLoading &&
								displayStatusMessages.length > 0)

						return (
							<div
								key={`${message.id}-${recipeVersions.length}`}
								className="space-y-4"
							>
								{shouldShow && (
									<ChatMessageCard
										role={message.role}
										content={content || ""}
										messageId={message.id}
										isStreaming={
											index === messages.length - 1 &&
											message.role === "assistant" &&
											isLoading
										}
										statusMessages={displayStatusMessages}
									/>
								)}
							</div>
						)
					})}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			{/* Fixed Bottom Input with Floating Serving Control */}
			<div className="border-t bg-background">
				{/* Input Area */}
				<div className="p-4">
					<PromptInput className="shadow-sm" onSubmit={handleSubmit}>
						<PromptInputBody>
							<PromptInputTextarea
								placeholder="Ask for a recipe or request changes..."
								className="min-h-[60px] resize-none"
								disabled={isLoading}
							/>
							<PromptInputToolbar>
								<PromptInputTools />
								<PromptInputSubmit
									size="icon"
									status={isLoading ? "submitted" : undefined}
									disabled={isLoading}
								/>
							</PromptInputToolbar>
						</PromptInputBody>
					</PromptInput>
				</div>
			</div>
		</div>
	)
}
