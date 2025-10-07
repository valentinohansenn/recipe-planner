"use client"

import dynamic from "next/dynamic"

// Dynamically import LeftPanel to prevent SSR issues with AI SDK hooks
const LeftPanel = dynamic(() => import("./left-panel").then(mod => ({ default: mod.LeftPanel })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="text-6xl">💬</div>
        <h3 className="text-xl font-medium text-muted-foreground">
          Loading chat...
        </h3>
      </div>
    </div>
  ),
})

export { LeftPanel }
