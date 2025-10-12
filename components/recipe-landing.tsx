"use client"

import { useChatSendMessage } from "@ai-sdk-tools/store"
import { AiInput } from "@/components/ai-input"
import {
	ChefHatIcon,
	SparklesIcon,
	BookOpenIcon,
	ClockIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "motion/react"

interface RecipeLandingProps {
	onStart: () => void
}

const EXAMPLE_RECIPES = [
	"Classic Italian Tiramisu",
	"Korean Salt Bread",
	"Matcha Strawberry Cake",
	"Homemade Ramen",
]

const FEATURES = [
	{
		icon: SparklesIcon,
		label: "AI-Powered",
		description: "Smart recipe generation",
	},
	{
		icon: BookOpenIcon,
		label: "Expert Sources",
		description: "Research-backed recipes",
	},
	{
		icon: ClockIcon,
		label: "Instant Results",
		description: "Quick and efficient",
	},
]

export function RecipeLanding({ onStart }: RecipeLandingProps) {
	const sendMessage = useChatSendMessage()

	const handleSubmit = (message: string) => {
		if (!message.trim()) return

		sendMessage({ text: message })
		onStart()
	}

	const handleExampleClick = (recipe: string) => {
		handleSubmit(`make ${recipe}`)
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
				<div className="w-full max-w-4xl space-y-8 sm:space-y-12">
					{/* Header Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center space-y-6"
					>
						{/* Logo */}
						<div className="flex justify-center">
							<div className="relative">
								<div className="flex size-16 sm:size-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
									<ChefHatIcon className="size-8 sm:size-10 text-primary" />
								</div>
							</div>
						</div>

						{/* Title */}
						<div className="space-y-3">
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
								AI Recipe Planner
							</h1>
							<p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
								Your personal chef powered by AI. Create perfect recipes with
								expert guidance.
							</p>
						</div>

						{/* Features */}
						<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
							{FEATURES.map((feature) => (
								<Badge
									key={feature.label}
									variant="secondary"
									className="gap-2 px-3 py-2 text-sm border shadow-sm"
								>
									<feature.icon className="size-4" />
									<span className="hidden sm:inline">{feature.label}</span>
									<span className="sm:hidden">{feature.description}</span>
								</Badge>
							))}
						</div>
					</motion.div>

					{/* Main Input Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="space-y-6"
					>
						<AiInput
							onSubmit={handleSubmit}
							title="What would you like to cook today?"
							className="animate-fade-in"
						/>

						{/* Keyboard hint */}
						<p className="text-xs sm:text-sm text-muted-foreground text-center">
							Press{" "}
							<kbd className="px-2 py-1 text-xs bg-muted rounded border">
								Enter
							</kbd>{" "}
							to send,
							<kbd className="px-2 py-1 text-xs bg-muted rounded border ml-1">
								Shift + Enter
							</kbd>{" "}
							for new line
						</p>
					</motion.div>

					{/* Example Recipes */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="space-y-4"
					>
						<p className="text-sm sm:text-base text-muted-foreground font-medium text-center">
							Try these popular recipes:
						</p>
						<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
							{EXAMPLE_RECIPES.map((recipe) => (
								<button
									key={recipe}
									onClick={() => handleExampleClick(recipe)}
									className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-full bg-muted/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
								>
									{recipe}
								</button>
							))}
						</div>
					</motion.div>

					{/* Footer */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className="pt-4 sm:pt-6 text-xs sm:text-sm text-muted-foreground/60 text-center"
					>
						Powered by AI • Research-backed recipes • Personalized for you
					</motion.div>
				</div>
			</div>
		</div>
	)
}
