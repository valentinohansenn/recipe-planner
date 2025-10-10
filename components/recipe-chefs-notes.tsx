"use client"

import { TextAnimate } from "@/components/ui/text-animate";

export function RecipeChefsNotes({ notes }: { notes: string }) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<div className="p-2 bg-amber-100 rounded-lg">
					<span className="text-2xl">👨‍🍳</span>
				</div>
				<TextAnimate
					animation="slideUp"
					as="h2"
					className="text-2xl font-bold text-gray-900"
					delay={0.05}
					by="word"
					once
				>
					Chef Shanice's Notes
				</TextAnimate>
			</div>
			<div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
			<TextAnimate
				animation="fadeIn"
				as="p"
				className="text-gray-700 whitespace-pre-wrap leading-relaxed"
				delay={0.1}
				by="word"
				once
			>
					{notes || ""}
				</TextAnimate>
			</div>
		</div>
	)
}


