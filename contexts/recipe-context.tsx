"use client"

import { createContext, useContext, useState, useRef, ReactNode } from "react"
import type { Recipe } from "@/lib/schema"

interface RecipeVersion {
	id: string
	title: string
	recipe: Recipe
	timestamp: Date
	messageId: string
}

interface RecipeContextType {
	defaultServings: number
	setDefaultServings: (servings: number) => void
	recipeVersions: RecipeVersion[]
	addRecipeVersion: (recipe: Recipe, messageId: string) => void
	loadRecipeVersion: (versionId: string) => Recipe | null
	currentVersionId: string | null
	setCurrentVersionId: (id: string | null) => void
	handleLoadVersionRef: { current: (versionId: string) => void }
	displayRecipe: Recipe | null
	setDisplayRecipe: (recipe: Recipe | null) => void
	isViewingVersion: boolean
	setIsViewingVersion: (viewing: boolean) => void
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

export function RecipeProvider({ children }: { children: ReactNode }) {
	const [defaultServings, setDefaultServings] = useState(4)
	const [recipeVersions, setRecipeVersions] = useState<RecipeVersion[]>([])
	const [currentVersionId, setCurrentVersionId] = useState<string | null>(null)
	const handleLoadVersionRef = useRef<(versionId: string) => void>(() => {})

	// Shared state for displaying recipes across all RecipeDisplay instances
	const [displayRecipe, setDisplayRecipe] = useState<Recipe | null>(null)
	const [isViewingVersion, setIsViewingVersion] = useState(false)

	const addRecipeVersion = (recipe: Recipe, messageId: string) => {
		// Check if this recipe already exists for this message to prevent duplicates
		setRecipeVersions((prev) => {
			const existingVersion = prev.find(
				(v) => v.messageId === messageId && v.title === recipe.title
			)

			if (existingVersion) {
				setCurrentVersionId(existingVersion.id)
				return prev
			}

			const versionId = `version-${Date.now()}-${Math.random()
				.toString(36)
				.substring(2, 11)}`
			const newVersion: RecipeVersion = {
				id: versionId,
				title: recipe.title,
				recipe,
				timestamp: new Date(),
				messageId,
			}

			console.log("[VERSION_HISTORY]: Added version -", recipe.title)
			setCurrentVersionId(versionId)
			return [...prev, newVersion]
		})
	}

	const loadRecipeVersion = (versionId: string): Recipe | null => {
		const version = recipeVersions.find((v) => v.id === versionId)
		if (version) {
			// Don't set currentVersionId here - let the caller handle it
			return version.recipe
		}
		return null
	}

	return (
		<RecipeContext.Provider
			value={{
				defaultServings,
				setDefaultServings,
				recipeVersions,
				addRecipeVersion,
				loadRecipeVersion,
				currentVersionId,
				setCurrentVersionId,
				handleLoadVersionRef,
				displayRecipe,
				setDisplayRecipe,
				isViewingVersion,
				setIsViewingVersion,
			}}
		>
			{children}
		</RecipeContext.Provider>
	)
}

export function useRecipeContext() {
	const context = useContext(RecipeContext)
	if (context === undefined) {
		throw new Error("useRecipeContext must be used within a RecipeProvider")
	}
	return context
}
