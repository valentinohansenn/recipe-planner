"use client"

import { Loader } from "@/components/ai-elements/loader"
import { Progress } from "@/components/ui/progress"

interface RecipeLoadingStateProps {
	progress?: number
	status?: "loading" | "streaming" | "complete" | "error"
}

const statusMessages = {
	loading: "Initializing recipe...",
	streaming: "Crafting your recipe...",
	complete: "Recipe ready!",
	error: "Something went wrong",
}

export function RecipeLoadingState({
	progress,
	status = "loading",
}: RecipeLoadingStateProps) {
	const message = statusMessages[status] || "Crafting your recipe..."
	const progressPercent = progress ? Math.round(progress * 100) : 0

	return (
		<div className="flex h-full items-center justify-center p-8">
			<div className="w-full max-w-md space-y-6 text-center">
				<Loader size={48} className="text-primary mx-auto" />
				<div className="space-y-2">
					<h3 className="text-xl font-medium">{message}</h3>
					<p className="text-muted-foreground">
						This won&apos;t take long
					</p>
					{progress !== undefined && progress > 0 && (
						<p className="text-sm text-primary font-medium">
							{progressPercent}% complete
						</p>
					)}
				</div>
				{progress !== undefined && (
					<div className="space-y-2">
						<Progress value={progressPercent} className="h-2" />
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Starting</span>
							<span>
								{progress < 0.3
									? "Preparing..."
									: progress < 0.6
										? "Adding ingredients..."
										: progress < 1
											? "Finalizing..."
											: "Complete!"}
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}