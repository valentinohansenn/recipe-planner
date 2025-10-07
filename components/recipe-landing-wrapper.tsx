"use client"

import dynamic from "next/dynamic"

// Dynamically import RecipeLanding to prevent SSR issues with AI SDK hooks
const RecipeLanding = dynamic(() => import("./recipe-landing").then(mod => ({ default: mod.RecipeLanding })), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="text-center space-y-3">
        <div className="text-6xl">🍳</div>
        <h3 className="text-xl font-medium text-muted-foreground">
          Loading Recipe Planner...
        </h3>
      </div>
    </div>
  ),
})

export { RecipeLanding }
