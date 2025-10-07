"use client"

import { useState } from "react"
import { useArtifact } from "@ai-sdk-tools/artifacts/client"
import { RecipeArtifact } from "@/lib/schema"
import { RecipeLoadingState } from "./recipe-loading"
import { RecipeHeader } from "./recipe-header"
import { RecipeIngredients } from "./recipe-ingredients"
import { RecipeInstructions } from "./recipe-instructions"
import { RecipeTips } from "./recipe-tips"
import { RecipeNutrition } from "./recipe-nutrition"
import { RecipeSources } from "./recipe-sources"
import type { UnitSystem } from "@/lib/unit-conversion"

export function RecipeDisplay() {
	const [servingMultiplier, setServingMultiplier] = useState(1)
	const [unitSystem, setUnitSystem] = useState<UnitSystem>('us')

	const {
		data: recipe,
		status,
		progress,
		error,
		isActive,
	} = useArtifact(RecipeArtifact, {
		onUpdate: (newData) => {
			console.log("Recipe updated:", newData)
		},
		onComplete: (finalData) => {
			console.log("Recipe complete!", finalData)
			// Reset serving multiplier when new recipe loads
			setServingMultiplier(1)
		},
		onError: (err) => {
			console.error("Recipe generation failed:", err)
		},
		onProgress: (prog) => {
			console.log("Progress:", Math.round(prog * 100) + "%")
		},
		onStatusChange: (newStatus, prevStatus) => {
			console.log("Status:", prevStatus, "→", newStatus)
		},
	})

	// Map status to RecipeLoadingState status
	const loadingStatus =
		status === "idle"
			? "loading"
			: (status as "loading" | "streaming" | "complete" | "error")

	// Loading state - show when actively generating
	if (isActive && status !== "complete") {
		return <RecipeLoadingState progress={progress} status={loadingStatus} />
	}

	// Error state
	if (error) {
		const errorMessage = String(error)
		return (
			<div className="flex h-full items-center justify-center p-8">
				<div className="text-center space-y-3 max-w-md">
					<div className="text-6xl">⚠️</div>
					<h3 className="text-xl font-medium text-destructive">
						Something went wrong
					</h3>
					<p className="text-sm text-muted-foreground">{errorMessage}</p>
				</div>
			</div>
		)
	}

	// No recipe yet
	if (!recipe) {
		return (
			<div className="flex h-full items-center justify-center p-8">
				<div className="text-center space-y-3">
					<div className="text-6xl">🍳</div>
					<h3 className="text-xl font-medium text-muted-foreground">
						Your recipe will appear here
					</h3>
					<p className="text-sm text-muted-foreground">
						Start by telling me what you&apos;d like to cook
					</p>
				</div>
			</div>
		)
	}

	// Display recipe - streaming is handled by useArtifact hook updating recipe data progressively
	return (
		<div className="h-full overflow-y-auto">
			<div className="p-12 space-y-16 max-w-5xl mx-auto">
				<div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
					<RecipeHeader
						recipe={recipe}
						servingMultiplier={servingMultiplier}
						onServingChange={setServingMultiplier}
						unitSystem={unitSystem}
						onUnitSystemChange={setUnitSystem}
					/>
				</div>

				{recipe.ingredients && recipe.ingredients.length > 0 && (
					<div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
						<RecipeIngredients
							ingredients={recipe.ingredients}
							servingMultiplier={servingMultiplier}
							unitSystem={unitSystem}
						/>
					</div>
				)}

				{recipe.steps && recipe.steps.length > 0 && (
					<div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
						<RecipeInstructions steps={recipe.steps} />
					</div>
				)}

				{recipe.tips && (
					<div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
						<RecipeTips tips={recipe.tips} />
					</div>
				)}

				{recipe.nutritionEstimate && (
					<div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
						<RecipeNutrition
							nutrition={recipe.nutritionEstimate}
							servingMultiplier={servingMultiplier}
						/>
					</div>
				)}

				{recipe.sources && recipe.sources.length > 0 && (
					<div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
						<RecipeSources sources={recipe.sources} />
					</div>
				)}
			</div>
		</div>
	)
}
