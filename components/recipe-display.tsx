"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { flushSync } from "react-dom"
import { useArtifact } from "@ai-sdk-tools/artifacts/client"
import { useChatMessages } from "@ai-sdk-tools/store"
import { RecipeArtifact } from "@/lib/schema"
import { useRecipeContext } from "@/contexts/recipe-context"
import { RecipeLoadingState } from "./recipe-loading"
import { RecipeHeader } from "./recipe-header"
import { RecipeChefsNotes } from "./recipe-chefs-notes"
import { RecipeTools } from "./recipe-tools"
import { RecipeIngredients } from "./recipe-ingredients"
import { RecipeInstructions } from "./recipe-instructions"
import { RecipeTips } from "./recipe-tips"
import { RecipeNutrition } from "./recipe-nutrition"
import { RecipeSources } from "./recipe-sources"
import type { UnitSystem } from "@/lib/unit-conversion"

export function RecipeDisplay() {
	const [servingMultiplier, setServingMultiplier] = useState(1)
	const [unitSystem, setUnitSystem] = useState<UnitSystem>("us")

	const messages = useChatMessages()
	const {
		addRecipeVersion,
		loadRecipeVersion,
		currentVersionId,
		setCurrentVersionId,
		handleLoadVersionRef,
		displayRecipe,
		setDisplayRecipe,
		isViewingVersion,
		setIsViewingVersion,
	} = useRecipeContext()

	const {
		data: recipe,
		status,
		progress,
		error,
		isActive,
	} = useArtifact(RecipeArtifact, {
		onComplete: (finalData) => {
			console.log("[RECIPE_ARTIFACT]: Recipe complete -", finalData.title)
			// Reset serving multiplier when new recipe loads
			setServingMultiplier(1)

			// Save recipe version when complete
			const assistantMessages = messages.filter((m) => m.role === "assistant")
			const latestMessage = assistantMessages[assistantMessages.length - 1]
			if (latestMessage && finalData) {
				addRecipeVersion(finalData, latestMessage.id)
				// Clear displayRecipe to show the new live recipe data
				setDisplayRecipe(null)
				setIsViewingVersion(false)
			}
		},
		onError: (err) => {
			console.error("[RECIPE_ARTIFACT]: Generation failed -", err)
		},
	})

	// Track the last message ID we processed to avoid re-clearing on every render
	const lastProcessedMessageRef = useRef<string | null>(null)

	// Clear display recipe when new conversation starts or new recipe is requested
	useEffect(() => {
		const assistantMessages = messages.filter((m) => m.role === "assistant")
		if (assistantMessages.length > 0) {
			// Check if the latest assistant message contains a recipe generation
			const latestMessage = assistantMessages[assistantMessages.length - 1]

			// Only process if this is a new message we haven't seen before
			if (lastProcessedMessageRef.current !== latestMessage.id) {
				const hasRecipeGeneration = latestMessage.parts.some(
					(part) =>
						part.type === "tool-generateRecipe" ||
						part.type === "tool-call" ||
						(part.type.startsWith("tool-") &&
							part.type.includes("generateRecipe"))
				)

				if (hasRecipeGeneration) {
					console.log("[RECIPE_DISPLAY]: New recipe generation detected")
					// Use flushSync to ensure immediate state updates
					flushSync(() => {
						setDisplayRecipe(null)
						setCurrentVersionId(null)
						setIsViewingVersion(false)
					})
					lastProcessedMessageRef.current = latestMessage.id
				}
			}
		}
	}, [messages, setCurrentVersionId, setDisplayRecipe, setIsViewingVersion])

	// Handle version loading - use useCallback to prevent stale closures
	const handleLoadVersion = useCallback(
		(versionId: string) => {
			const loadedRecipe = loadRecipeVersion(versionId)
			if (loadedRecipe) {
				console.log("[VERSION_HISTORY]: Loading version -", loadedRecipe.title)
				// Use flushSync to force synchronous state updates
				flushSync(() => {
					// Create a new object reference to force React to re-render
					setDisplayRecipe({ ...loadedRecipe })
					setIsViewingVersion(true) // Mark that we're viewing a specific version
					setCurrentVersionId(versionId) // Ensure version ID is set
				})
			} else {
				console.error("[VERSION_HISTORY]: Failed to load version -", versionId)
			}
		},
		[
			loadRecipeVersion,
			setDisplayRecipe,
			setIsViewingVersion,
			setCurrentVersionId,
		]
	)

	// Register the handler with the context ref
	useEffect(() => {
		handleLoadVersionRef.current = handleLoadVersion
	}, [handleLoadVersion, handleLoadVersionRef])

	// Use displayRecipe if viewing a version, otherwise use the live artifact data
	// This prevents the live recipe from overwriting a manually loaded version
	const currentRecipe = isViewingVersion
		? displayRecipe
		: displayRecipe || recipe

	// Create a unique key to force re-render when switching between recipes
	const recipeKey = isViewingVersion
		? `version-${currentVersionId}-${displayRecipe?.title}`
		: `live-${recipe?.title}`

	// Map status to RecipeLoadingState status
	const loadingStatus =
		status === "idle"
			? "loading"
			: (status as "loading" | "streaming" | "complete" | "error")

	// Loading state - show when actively generating and no cached recipe to display
	// Don't show loading if we're viewing a specific version
	if (
		isActive &&
		status !== "complete" &&
		!displayRecipe &&
		!isViewingVersion
	) {
		return <RecipeLoadingState progress={progress} status={loadingStatus} />
	}

	// Error state
	if (error && !displayRecipe) {
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
	if (!currentRecipe) {
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
		<div className="h-full overflow-y-auto" key={recipeKey}>
			<div className="p-12 space-y-16 max-w-5xl mx-auto">
				<RecipeHeader
					recipe={currentRecipe}
					servingMultiplier={servingMultiplier}
					onServingChange={setServingMultiplier}
					unitSystem={unitSystem}
					onUnitSystemChange={setUnitSystem}
				/>

				{currentRecipe.chefsNotes && (
					<RecipeChefsNotes notes={currentRecipe.chefsNotes} />
				)}

				{currentRecipe.toolsNeeded && currentRecipe.toolsNeeded.length > 0 && (
					<RecipeTools tools={currentRecipe.toolsNeeded} />
				)}

				{currentRecipe.ingredients && currentRecipe.ingredients.length > 0 && (
					<RecipeIngredients
						ingredients={currentRecipe.ingredients}
						servingMultiplier={servingMultiplier}
						unitSystem={unitSystem}
					/>
				)}

				{currentRecipe.steps && currentRecipe.steps.length > 0 && (
					<RecipeInstructions steps={currentRecipe.steps} />
				)}

				{currentRecipe.tips && currentRecipe.tips.length > 0 && (
					<RecipeTips tips={currentRecipe.tips} />
				)}

				{currentRecipe.nutritionEstimate && (
					<RecipeNutrition
						nutrition={currentRecipe.nutritionEstimate}
						servingMultiplier={servingMultiplier}
					/>
				)}

				{currentRecipe.sources && currentRecipe.sources.length > 0 && (
					<RecipeSources sources={currentRecipe.sources} />
				)}
			</div>
		</div>
	)
}
