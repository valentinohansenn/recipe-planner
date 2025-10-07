"use client"

import { useState } from "react"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
	Item,
	ItemContent,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item"
import {
	CheckCircleIcon,
	CircleIcon,
	BrainIcon,
	ChevronDownIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/ai-elements/loader"
import { cn } from "@/lib/utils"
import type { ThoughtStep } from "@/lib/types"

interface ThoughtProcessModuleProps {
	steps: ThoughtStep[]
}

export function ThoughtProcessModule({ steps }: ThoughtProcessModuleProps) {
	const [isOpen, setIsOpen] = useState(true)

	if (steps.length === 0) return null

	const completedCount = steps.filter((s) => s.status === "completed").length

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="animate-in fade-in slide-in-from-left-4 duration-300"
		>
			<Item
				variant="muted"
				className="rounded-2xl border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20"
			>
				<ItemMedia
					variant="icon"
					className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-800"
				>
					<BrainIcon className="size-4 text-blue-600 dark:text-blue-400" />
				</ItemMedia>

				<ItemContent className="flex-1">
					<div className="flex items-center justify-between gap-2">
						<ItemTitle className="text-foreground flex items-center gap-2">
							Thought Process
							<Badge
								variant="secondary"
								className="gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
							>
								<span className="text-xs">
									{completedCount}/{steps.length}
								</span>
							</Badge>
						</ItemTitle>

						<CollapsibleTrigger asChild>
							<button
								className={cn(
									"p-1.5 hover:bg-muted rounded-lg transition-all",
									"focus:outline-none focus:ring-2 focus:ring-primary/20"
								)}
							>
								<ChevronDownIcon
									className={cn(
										"size-4 text-muted-foreground transition-transform duration-200",
										isOpen && "transform rotate-180"
									)}
								/>
							</button>
						</CollapsibleTrigger>
					</div>

					<CollapsibleContent className="mt-4">
						<div className="space-y-3">
							{steps.map((step) => (
								<div
									key={step.id}
									className="flex items-start gap-3 rounded-xl p-3 transition-all"
									style={{
										backgroundColor:
											step.status === "active"
												? "rgba(59, 130, 246, 0.05)"
												: "transparent",
									}}
								>
									<div className="mt-0.5 flex-shrink-0">
										{step.status === "completed" && (
											<div className="p-1 rounded-full bg-green-100 dark:bg-green-900">
												<CheckCircleIcon className="size-3.5 text-green-600 dark:text-green-400" />
											</div>
										)}
										{step.status === "active" && (
											<div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900">
												<Loader size={14} className="text-blue-600 dark:text-blue-400" />
											</div>
										)}
										{step.status === "pending" && (
											<div className="p-1 rounded-full bg-muted">
												<CircleIcon className="size-3.5 text-muted-foreground/40" />
											</div>
										)}
										{step.status === "error" && (
											<div className="p-1 rounded-full bg-red-100 dark:bg-red-900">
												<CircleIcon className="size-3.5 text-red-600 dark:text-red-400" />
											</div>
										)}
									</div>

									<div className="flex-1 min-w-0">
										<p
											className={cn(
												"text-sm font-medium leading-tight",
												step.status === "completed" &&
													"text-green-600 dark:text-green-400",
												step.status === "active" &&
													"text-blue-600 dark:text-blue-400",
												step.status === "pending" && "text-muted-foreground",
												step.status === "error" && "text-red-600 dark:text-red-400"
											)}
										>
											{step.title}
										</p>
										<p className="text-xs text-muted-foreground mt-1 leading-relaxed">
											{step.description}
										</p>
										{step.files && step.files.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-2">
												{step.files.map((file) => (
													<Badge
														key={file}
														variant="outline"
														className="text-xs px-2 py-0.5"
													>
														{file}
													</Badge>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</CollapsibleContent>
				</ItemContent>
			</Item>
		</Collapsible>
	)
}
