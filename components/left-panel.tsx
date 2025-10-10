"use client"

import { useState, useEffect } from "react"
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
import { ThoughtProcessModule } from "./thought-process"
import { useRecipeContext } from "@/contexts/recipe-context"
import type { ThoughtStep } from "@/lib/types"

export function LeftPanel() {
	const messages = useChatMessages()
	const sendMessage = useChatSendMessage()
	const status = useChatStatus()
	const { recipeVersions } = useRecipeContext()

	const [thoughtSteps, setThoughtSteps] = useState<ThoughtStep[]>([])

	const isLoading = status === "submitted" || status === "streaming"

	// Simulate thought process when streaming starts
	useEffect(() => {
		if (status === "submitted" && thoughtSteps.length === 0) {
			simulateThoughtProcess()
		} else if (status === "ready" && thoughtSteps.length > 0) {
			// Complete all steps when done
			setThoughtSteps((prev) =>
				prev.map((step) => ({ ...step, status: "completed" as const }))
			)
		}
	}, [status, thoughtSteps.length])

	const simulateThoughtProcess = () => {
		const steps: ThoughtStep[] = [
			{
				id: "1",
				title: "Understanding your request",
				description: "Analyzing key requirements and preferences",
				status: "active",
			},
			{
				id: "2",
				title: "Identifying constraints",
				description: "Determining dietary restrictions, time, and skill level",
				status: "pending",
			},
			{
				id: "3",
				title: "Searching recipe database",
				description: "Finding suitable recipes that match your criteria",
				status: "pending",
			},
			{
				id: "4",
				title: "Generating recipe details",
				description: "Creating ingredient list and step-by-step instructions",
				status: "pending",
			},
			{
				id: "5",
				title: "Adding helpful tips",
				description: "Including chef's tips and nutrition information",
				status: "pending",
			},
		]

		setThoughtSteps(steps)

		// Animate through steps
		let currentStep = 0
		const interval = setInterval(() => {
			currentStep++
			if (currentStep >= steps.length) {
				clearInterval(interval)
				return
			}
			setThoughtSteps((prev) =>
				prev.map((step, index) => ({
					...step,
					status:
						index < currentStep
							? "completed"
							: index === currentStep
							? "active"
							: "pending",
				}))
			)
		}, 1200)
	}

	const handleSubmit = (message: PromptInputMessage) => {
		if (!message.text?.trim()) return
		sendMessage({ text: message.text })
	}

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

						return (
							<div key={`${message.id}-${recipeVersions.length}`} className="space-y-4">
								<ChatMessageCard
									role={message.role}
									content={content}
									messageId={message.id}
									isStreaming={
										index === messages.length - 1 &&
										message.role === "assistant" &&
										isLoading
									}
								/>

								{/* Show Thought Process after first user message */}
								{message.role === "user" &&
									index === 0 &&
									thoughtSteps.length > 0 && (
										<ThoughtProcessModule steps={thoughtSteps} />
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
