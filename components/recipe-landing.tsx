"use client"

import { useChatSendMessage } from "@ai-sdk-tools/store"
import {
	PromptInput,
	PromptInputBody,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
	PromptInputSubmit,
	type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"

interface RecipeLandingProps {
	onStart: () => void
}

export function RecipeLanding({ onStart }: RecipeLandingProps) {
	const sendMessage = useChatSendMessage()

	const handleSubmit = (message: PromptInputMessage) => {
		if (!message.text?.trim()) return

		// Send message via AI SDK
		sendMessage({ text: message.text })

		// Trigger transition to active view
		onStart()
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-8">
			<div className="w-full max-w-3xl space-y-6 text-center animate-fade-in">
				{/* Branding */}
				<div className="space-y-3">
					<h1 className="text-5xl font-bold text-foreground tracking-tight">
						Recipe Planner
					</h1>
					<p className="text-lg text-muted-foreground">
						Let AI craft your perfect recipe
					</p>
				</div>

				{/* Main Input */}
				<PromptInput
					className="shadow-xl transition-all hover:shadow-2xl border-border/50"
					onSubmit={handleSubmit}
				>
					<PromptInputBody>
						<PromptInputTextarea
							placeholder="What recipe are you looking for today? e.g., 'a quick vegan pasta for two'"
							className="min-h-[140px] text-lg leading-relaxed"
						/>
						<PromptInputToolbar>
							<PromptInputTools />
							<PromptInputSubmit
								className="rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105"
								size="icon"
							/>
						</PromptInputToolbar>
					</PromptInputBody>
				</PromptInput>

				{/* Subtle hint */}
				<p className="text-sm text-muted-foreground">
					Press{" "}
					<kbd className="px-2 py-1 text-xs bg-muted rounded border">
						Enter
					</kbd>{" "}
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