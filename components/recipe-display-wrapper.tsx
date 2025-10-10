"use client"

import dynamic from "next/dynamic"

// Dynamically import RecipeDisplay to prevent SSR issues with AI SDK hooks
const RecipeDisplay = dynamic(() => import("./recipe-display").then(mod => ({ default: mod.RecipeDisplay })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="text-6xl">🍳</div>
        <h3 className="text-xl font-medium text-muted-foreground">
          Loading recipe display...
        </h3>
      </div>
    </div>
  ),
})

export { RecipeDisplay }
