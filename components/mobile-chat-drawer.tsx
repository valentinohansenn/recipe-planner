"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquareIcon, ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeftPanel } from "./left-panel"
import { cn } from "@/lib/utils"
import { useChatStatus } from "@ai-sdk-tools/store"

export function MobileChatDrawer() {
	const [isOpen, setIsOpen] = useState(false)
	const [hasAutoOpened, setHasAutoOpened] = useState(false)
	const status = useChatStatus()
	const previousStatusRef = useRef<string>("ready")

	// Auto-open drawer when user submits a query (only on first generation)
	useEffect(() => {
		// Only auto-open if transitioning from ready to submitted/streaming
		if (
			(status === "submitted" || status === "streaming") &&
			previousStatusRef.current === "ready" &&
			!hasAutoOpened
		) {
			setIsOpen(true)
			setHasAutoOpened(true)
		}

		previousStatusRef.current = status
	}, [status, hasAutoOpened])

	// Auto-close drawer when recipe generation is complete (only if it was auto-opened)
	useEffect(() => {
		if (status === "ready" && isOpen && hasAutoOpened) {
			// Add a small delay before closing for better UX
			const timer = setTimeout(() => {
				setIsOpen(false)
				setHasAutoOpened(false) // Reset for next generation
			}, 500)
			return () => clearTimeout(timer)
		}
	}, [status, isOpen, hasAutoOpened])

	// Manual open/close handlers
	const handleOpen = () => {
		setIsOpen(true)
		setHasAutoOpened(false) // Prevent auto-close when manually opened
	}

	const handleClose = () => {
		setIsOpen(false)
		setHasAutoOpened(false) // Reset auto-open state
	}

	return (
		<>
			{/* Floating Chat Button */}
			<Button
				onClick={handleOpen}
				size="lg"
				className="fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg"
			>
				<MessageSquareIcon className="size-6" />
			</Button>

			{/* Drawer Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
					onClick={handleClose}
				/>
			)}

			{/* Drawer - Slides from bottom */}
			<div
				className={cn(
					"fixed inset-x-0 bottom-0 h-[85vh] bg-background z-50 rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out",
					isOpen ? "translate-y-0" : "translate-y-full"
				)}
			>
				<div className="flex flex-col h-full">
					{/* Drag Handle */}
					<div className="flex justify-center pt-3 pb-2">
						<div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
					</div>

					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b">
						<h2 className="text-lg font-semibold">Chat with Chef Shanice</h2>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClose}
							className="rounded-full"
						>
							<ChevronDownIcon className="size-5" />
						</Button>
					</div>

					{/* Chat Content */}
					<div className="flex-1 overflow-hidden">
						<LeftPanel />
					</div>
				</div>
			</div>
		</>
	)
}
