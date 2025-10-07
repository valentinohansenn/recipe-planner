"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import {
	useChatMessages,
	useChatSendMessage,
	useChatStatus,
} from "@ai-sdk-tools/store"

export default function RecipeChat() {
	const messages = useChatMessages()
	const sendMessage = useChatSendMessage()
	const status = useChatStatus()

	console.log("🍳 messages:", messages)
	console.log("🍳 status:", status)
	console.log(
		"🍳 tool calls:",
		messages.map((message) =>
			message.parts.map((part) =>
				part.type.startsWith("tool") ? part.type : null
			)
		)
	)

	const [input, setInput] = useState("")
	const [isPending, startTransition] = useTransition()

	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		startTransition(() => {
			sendMessage({ text: input })
			setInput("")
		})
	}

	return (
		<div className="bg-white rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
			{/* Chat Header */}
			<div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 flex items-center gap-3">
				<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
					👨‍🍳
				</div>
				<div>
					<h2 className="font-bold text-lg">Chef AI</h2>
					<p className="text-sm text-white/80">
						Your personal cooking assistant
					</p>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center p-8">
						<div className="text-6xl mb-4">👋</div>
						<h3 className="text-xl font-semibold text-gray-700 mb-2">
							Welcome to Recipe Chef!
						</h3>
						<p className="text-gray-500 mb-6 max-w-md">
							Ask me to create a recipe, and I&apos;ll generate it for you. You
							can also ask me to modify it!
						</p>
						<div className="space-y-2 w-full max-w-md">
							<p className="text-sm font-medium text-gray-600 mb-2">
								Try asking:
							</p>
							{[
								"Create a spicy Thai curry recipe",
								"Make it vegetarian",
								"Add more vegetables",
								"Reduce the cooking time",
							].map((suggestion, idx) => (
								<button
									key={idx}
									onClick={() => setInput(suggestion)}
									className="w-full text-left text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 rounded-lg transition-colors"
								>
									💬 {suggestion}
								</button>
							))}
						</div>
					</div>
				) : (
					<>
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${
									message.role === "user" ? "justify-end" : "justify-start"
								}`}
							>
								<div
									className={`max-w-[80%] rounded-2xl px-4 py-3 ${
										message.role === "user"
											? "bg-orange-500 text-white rounded-br-none"
											: "bg-gray-100 text-gray-800 rounded-bl-none"
									}`}
								>
									{message.role === "assistant" && (
										<div className="flex items-center gap-2 mb-1">
											<span className="text-lg">👨‍🍳</span>
											<span className="text-xs font-semibold text-gray-600">
												Chef AI
											</span>
										</div>
									)}
									<p className="whitespace-pre-wrap">
										{message.parts
											.filter((part) => part.type === "text")
											.map((part) => part.text)
											.join("")}
									</p>

									{/* Show tool calls (optional debug info) */}
									{status === "streaming" && (
										<div className="mt-2 pt-2 border-t border-gray-200">
											<p className="text-xs text-gray-500 italic">
												🔧 Generating recipe artifact...
											</p>
										</div>
									)}
								</div>
							</div>
						))}

						{/* Loading indicator */}
						{isPending && (
							<div className="flex justify-start">
								<div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
									<div className="flex items-center gap-2">
										<div className="flex gap-1">
											<div
												className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
												style={{ animationDelay: "0ms" }}
											></div>
											<div
												className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
												style={{ animationDelay: "150ms" }}
											></div>
											<div
												className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
												style={{ animationDelay: "300ms" }}
											></div>
										</div>
										<span className="text-xs text-gray-500">
											Chef is thinking...
										</span>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</>
				)}
			</div>

			{/* Input Area */}
			<div className="border-t border-gray-200 p-4 bg-gray-50">
				<form onSubmit={handleSubmit} className="flex gap-2">
					<input
						value={input}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setInput(e.target.value)
						}
						placeholder="Ask for a recipe or request changes..."
						className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
						disabled={isPending}
					/>
					<button
						type="submit"
						disabled={isPending || !input.trim()}
						className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors"
					>
						{isPending ? (
							<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
									fill="none"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						) : (
							<span>Send</span>
						)}
					</button>
				</form>

				{/* Quick Actions */}
				<div className="flex gap-2 mt-2">
					{["Make it spicy", "Add protein", "Reduce time"].map((quick) => (
						<button
							key={quick}
							onClick={() => setInput(quick)}
							disabled={isPending}
							className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 transition-colors disabled:opacity-50"
						>
							{quick}
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
