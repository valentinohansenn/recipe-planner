"use client"

import { useChatSendMessage } from "@ai-sdk-tools/store"
import { AiInput } from "@/components/ai-input"
import { TextAnimate } from "@/components/ui/text-animate"

interface RecipeLandingProps {
	onStart: () => void
}

export function RecipeLanding({ onStart }: RecipeLandingProps) {
	const sendMessage = useChatSendMessage()

	const handleSubmit = (message: string) => {
		if (!message.trim()) return

		// Send message via AI SDK
		sendMessage({ text: message })

		// Trigger transition to active view
		onStart()
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-8">
			<div className="w-full max-w-3xl space-y-8 text-center">
				{/* Main Input */}
				<AiInput
					onSubmit={handleSubmit}
					title="What would you like to cook today?"
					className="animate-fade-in"
				/>

				{/* Subtle hint */}
				<p className="text-sm text-muted-foreground">
					Press{" "}
					<kbd className="px-2 py-1 text-xs bg-muted rounded border">Enter</kbd>{" "}
					to send,{" "}
					<kbd className="px-2 py-1 text-xs bg-muted rounded border ml-1">
						Shift + Enter
					</kbd>{" "}
					for new line
				</p>
			</div>
		</div>
	)
}
