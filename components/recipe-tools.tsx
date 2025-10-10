"use client"

import { TextAnimate } from "@/components/ui/text-animate";

export function RecipeTools({ tools }: { tools: string[] }) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<div className="p-2 bg-blue-100 rounded-lg">
					<span className="text-2xl">🔧</span>
				</div>
				<TextAnimate
					animation="slideUp"
					as="h2"
					className="text-2xl font-bold text-gray-900"
					delay={0.05}
					by="word"
					once
				>
					Tools You'll Need
				</TextAnimate>
			</div>
			<div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
				<ul className="space-y-2">
					{tools.map((tool, index) => (
						<li key={index} className="flex items-start gap-3">
							<span className="text-blue-600 mt-1">•</span>
						<TextAnimate
							animation="fadeIn"
							as="span"
							className="text-gray-700 flex-1"
							delay={0.1 + index * 0.05}
							by="word"
							once
						>
								{tool || ""}
							</TextAnimate>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}


