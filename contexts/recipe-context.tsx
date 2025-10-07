"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface RecipeContextType {
	defaultServings: number
	setDefaultServings: (servings: number) => void
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

export function RecipeProvider({ children }: { children: ReactNode }) {
	const [defaultServings, setDefaultServings] = useState(4)

	return (
		<RecipeContext.Provider value={{ defaultServings, setDefaultServings }}>
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


