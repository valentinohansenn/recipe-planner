"use client"

import { TextAnimate } from "@/components/ui/text-animate"
import { WrenchIcon } from "lucide-react"

export function RecipeTools({ tools }: { tools: string[] }) {
	return (
		<div className="space-y-6">
			<h2 className="text-3xl font-bold flex items-center gap-3">
				<WrenchIcon className="size-7 text-blue-600" />
				<TextAnimate animation="slideUp" delay={0.05} by="word" once>
					Tools You&apos;ll Need
				</TextAnimate>
			</h2>
			<div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
				<ul className="space-y-3">
					{tools.map((tool, index) => (
						<li key={index} className="flex items-start gap-3">
							<span className="text-blue-600 dark:text-blue-400 text-lg leading-none mt-0.5">
								•
							</span>
							<TextAnimate
								animation="fadeIn"
								as="span"
								className="text-foreground/90 flex-1 leading-relaxed"
								delay={0.1 + index * 0.05}
								by="word"
								once
							>
								{tool}
							</TextAnimate>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
