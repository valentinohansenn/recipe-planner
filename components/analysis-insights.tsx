"use client"

import { Badge } from "@/components/ui/badge"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import { 
	ClockIcon, 
	ChefHatIcon, 
	LightbulbIcon, 
	AlertCircleIcon,
	HelpCircleIcon,
	SparklesIcon,
	TrendingUpIcon
} from "lucide-react"
import { TextAnimate } from "@/components/ui/text-animate"

interface AnalysisInsightsProps {
	analysis: {
		queryType?: string
		recipeName?: string
		technicalLevel?: string
		cuisineStyle?: string
		userIntent?: string
		recommendedApproach?: string
		estimatedComplexity?: {
			prepTime: number
			cookTime: number
			activeTime: number
			skillLevel: string
		}
		successTips?: string[]
		potentialChallenges?: string[]
		alternativeOptions?: string[]
		followUpQuestions?: string[]
		confidence?: number
	}
	researchSummary?: string
}

export function AnalysisInsights({ analysis, researchSummary }: AnalysisInsightsProps) {
	const totalTime = (analysis.estimatedComplexity?.prepTime || 0) + (analysis.estimatedComplexity?.cookTime || 0)

	return (
		<div className="space-y-6 p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="p-2 bg-blue-500 rounded-lg">
					<SparklesIcon className="size-5 text-white" />
				</div>
				<div className="flex-1">
					<TextAnimate animation="slideUp" as="h3" className="text-xl font-bold" delay={0.1} once>
						Recipe Analysis
					</TextAnimate>
					{researchSummary && (
						<TextAnimate animation="fadeIn" as="p" className="text-sm text-muted-foreground" delay={0.15} once>
							{researchSummary}
						</TextAnimate>
					)}
				</div>
				{analysis.confidence !== undefined && (
					<Badge variant={analysis.confidence > 0.8 ? "default" : "secondary"} className="gap-1.5">
						<TrendingUpIcon className="size-3" />
						{Math.round(analysis.confidence * 100)}% confident
					</Badge>
				)}
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{analysis.technicalLevel && (
					<Item variant="muted" size="sm" className="flex-col items-start gap-1 p-3">
						<div className="flex items-center gap-2 text-muted-foreground">
							<ChefHatIcon className="size-4" />
							<span className="text-xs font-medium">Level</span>
						</div>
						<span className="text-sm font-semibold capitalize">{analysis.technicalLevel}</span>
					</Item>
				)}

				{totalTime > 0 && (
					<Item variant="muted" size="sm" className="flex-col items-start gap-1 p-3">
						<div className="flex items-center gap-2 text-muted-foreground">
							<ClockIcon className="size-4" />
							<span className="text-xs font-medium">Time</span>
						</div>
						<span className="text-sm font-semibold">~{totalTime}min</span>
					</Item>
				)}

				{analysis.cuisineStyle && (
					<Item variant="muted" size="sm" className="flex-col items-start gap-1 p-3">
						<div className="flex items-center gap-2 text-muted-foreground">
							<span className="text-xs font-medium">Cuisine</span>
						</div>
						<span className="text-sm font-semibold">{analysis.cuisineStyle}</span>
					</Item>
				)}

				{analysis.estimatedComplexity?.skillLevel && (
					<Item variant="muted" size="sm" className="flex-col items-start gap-1 p-3">
						<div className="flex items-center gap-2 text-muted-foreground">
							<span className="text-xs font-medium">Skills</span>
						</div>
						<span className="text-sm font-semibold">{analysis.estimatedComplexity.skillLevel}</span>
					</Item>
				)}
			</div>

			{/* Recommended Approach */}
			{analysis.recommendedApproach && (
				<Item variant="default" className="p-4">
					<ItemTitle className="text-sm font-semibold text-primary flex items-center gap-2">
						<LightbulbIcon className="size-4" />
						Recommended Approach
					</ItemTitle>
					<ItemContent>
						<p className="text-sm text-foreground/90 leading-relaxed">
							{analysis.recommendedApproach}
						</p>
					</ItemContent>
				</Item>
			)}

			{/* Success Tips */}
			{analysis.successTips && analysis.successTips.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
						<SparklesIcon className="size-4 text-green-600 dark:text-green-400" />
						Success Tips
					</h4>
					<div className="space-y-2">
						{analysis.successTips.slice(0, 3).map((tip, i) => (
							<Item key={i} variant="muted" size="sm" className="p-3">
								<ItemContent>
									<p className="text-sm text-foreground/80">{tip}</p>
								</ItemContent>
							</Item>
						))}
					</div>
				</div>
			)}

			{/* Potential Challenges */}
			{analysis.potentialChallenges && analysis.potentialChallenges.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
						<AlertCircleIcon className="size-4 text-amber-600 dark:text-amber-400" />
						Watch Out For
					</h4>
					<div className="space-y-2">
						{analysis.potentialChallenges.slice(0, 3).map((challenge, i) => (
							<Item key={i} variant="muted" size="sm" className="p-3">
								<ItemContent>
									<p className="text-sm text-foreground/80">{challenge}</p>
								</ItemContent>
							</Item>
						))}
					</div>
				</div>
			)}

			{/* Alternative Options */}
			{analysis.alternativeOptions && analysis.alternativeOptions.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
						<TrendingUpIcon className="size-4 text-blue-600 dark:text-blue-400" />
						Alternative Approaches
					</h4>
					<div className="flex flex-wrap gap-2">
						{analysis.alternativeOptions.map((option, i) => (
							<Badge key={i} variant="outline" className="text-xs">
								{option}
							</Badge>
						))}
					</div>
				</div>
			)}

			{/* Follow-up Questions */}
			{analysis.followUpQuestions && analysis.followUpQuestions.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
						<HelpCircleIcon className="size-4 text-purple-600 dark:text-purple-400" />
						Questions to Consider
					</h4>
					<div className="space-y-2">
						{analysis.followUpQuestions.map((question, i) => (
							<Item key={i} variant="muted" size="sm" className="p-3">
								<ItemContent>
									<p className="text-sm text-foreground/80 italic">{question}</p>
								</ItemContent>
							</Item>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

