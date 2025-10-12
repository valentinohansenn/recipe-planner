"use client"

import { useState, useEffect } from "react"
import { useChat, useChatMessageCount } from "@ai-sdk-tools/store"
import { DefaultChatTransport } from "ai"
import { RecipeLanding } from "@/components/recipe-landing-wrapper"
import { LeftPanel } from "@/components/left-panel-wrapper"
import { RecipeDisplay } from "@/components/recipe-display-wrapper"
import { RecipeProvider } from "@/contexts/recipe-context"
import { AIDevtools } from "@ai-sdk-tools/devtools"
import { MobileChatDrawer } from "@/components/mobile-chat-drawer"

// Disable static generation for this page since it uses client-side hooks
export const dynamic = "force-dynamic"

export default function Home() {
	const [isClient, setIsClient] = useState(false)
	const [hasStarted, setHasStarted] = useState(false)

	// Ensure this only runs on the client to prevent SSR issues
	useEffect(() => {
		setIsClient(true)
	}, [])

	// Initialize useChat - accessed by components via hooks
	useChat({
		transport: new DefaultChatTransport({
			api: "/api/recipe",
		}),
	})

	const messageCount = useChatMessageCount()

	// Switch to active mode when first message is sent or if messages exist
	const showActiveView = hasStarted || messageCount > 0

	const handleStart = () => {
		setHasStarted(true)
	}

	// Prevent SSR rendering issues
	if (!isClient) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center space-y-3">
					<div className="text-6xl">🍳</div>
					<h3 className="text-xl font-medium text-muted-foreground">
						Loading Recipe Planner...
					</h3>
				</div>
			</div>
		)
	}

	// Show landing page in initial mode
	if (!showActiveView) {
		return <RecipeLanding onStart={handleStart} />
	}

	// Show active two-panel layout
	return (
		<RecipeProvider>
			<div className="flex h-screen bg-background">
				{/* Desktop: Left Panel - 40% */}
				<div className="hidden lg:flex lg:w-[40%] flex-col border-r animate-slide-in-left">
					<LeftPanel />
				</div>

				{/* Desktop & Mobile: Recipe Display - 60% on desktop, 100% on mobile */}
				<div className="flex-1 overflow-hidden animate-slide-in-right">
					<RecipeDisplay />
				</div>

				{/* Mobile: Chat Drawer */}
				<div className="lg:hidden">
					<MobileChatDrawer />
				</div>

				<AIDevtools />
			</div>
		</RecipeProvider>
	)
}
