"use client"

import { Item, ItemMedia, ItemContent } from "@/components/ui/item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	ClockIcon,
	FlameIcon,
	UsersIcon,
	MinusIcon,
	PlusIcon,
	SnowflakeIcon,
} from "lucide-react"
import { UnitSystemSelector } from "@/components/unit-system-selector"
import { formatTime } from "@/lib/time-format"
import type { Recipe } from "@/lib/types"
import type { UnitSystem } from "@/lib/unit-conversion"
import BlurText from "@/components/BlurText"

interface RecipeHeaderProps {
	recipe: Pick<
		Recipe,
		| "title"
		| "description"
		| "prepTime"
		| "cookTime"
		| "chillTime"
		| "servings"
		| "difficulty"
	>
	servingMultiplier: number
	onServingChange: (multiplier: number) => void
	unitSystem: UnitSystem
	onUnitSystemChange: (system: UnitSystem) => void
}

export function RecipeHeader({
	recipe,
	servingMultiplier,
	onServingChange,
	unitSystem,
	onUnitSystemChange,
}: RecipeHeaderProps) {
	const adjustedServings = Math.round(recipe.servings * servingMultiplier)

	const handleDecrease = () => {
		if (servingMultiplier > 0.5) {
			onServingChange(Math.max(0.5, servingMultiplier - 0.5))
		}
	}

	const handleIncrease = () => {
		if (servingMultiplier < 10) {
			onServingChange(Math.min(10, servingMultiplier + 0.5))
		}
	}

	return (
		<div className="space-y-6 md:space-y-8">
			{/* Title and Unit Selector */}
			<div className="flex items-start justify-between gap-4 flex-wrap">
				<h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground tracking-tight flex-1">
					<BlurText
						text={recipe.title || ""}
						animateBy="words"
						delay={50}
						direction="top"
						className="text-3xl md:text-5xl font-bold leading-tight text-foreground tracking-tight"
					/>
				</h1>
				<UnitSystemSelector value={unitSystem} onChange={onUnitSystemChange} />
			</div>

			{/* Description */}
			<BlurText
				text={recipe.description || ""}
				animateBy="words"
				delay={80}
				direction="bottom"
				className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-3xl block"
			/>

			{/* Info Bar */}
			<div
				className={`grid grid-cols-2 ${
					recipe.chillTime ? "md:grid-cols-5" : "md:grid-cols-4"
				} gap-3 md:gap-5`}
			>
				<Item
					variant="outline"
					className="flex-col items-center p-4 md:p-6 gap-2 md:gap-3"
				>
					<ItemMedia
						variant="icon"
						className="bg-primary/10 border-primary/20 size-10 md:size-12"
					>
						<ClockIcon className="size-4 md:size-5 text-primary" />
					</ItemMedia>
					<ItemContent className="items-center text-center gap-1">
						<div className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground font-medium">
							Prep
						</div>
						<div className="text-base md:text-xl font-bold">
							{formatTime(recipe.prepTime)}
						</div>
					</ItemContent>
				</Item>

				<Item
					variant="outline"
					className="flex-col items-center p-4 md:p-6 gap-2 md:gap-3"
				>
					<ItemMedia
						variant="icon"
						className="bg-primary/10 border-primary/20 size-10 md:size-12"
					>
						<FlameIcon className="size-4 md:size-5 text-primary" />
					</ItemMedia>
					<ItemContent className="items-center text-center gap-1">
						<div className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground font-medium">
							Cook
						</div>
						<div className="text-base md:text-xl font-bold">
							{formatTime(recipe.cookTime)}
						</div>
					</ItemContent>
				</Item>

				{recipe.chillTime !== undefined && recipe.chillTime > 0 && (
					<Item
						variant="outline"
						className="flex-col items-center p-4 md:p-6 gap-2 md:gap-3"
					>
						<ItemMedia
							variant="icon"
							className="bg-cyan-100 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800 size-10 md:size-12"
						>
							<SnowflakeIcon className="size-4 md:size-5 text-cyan-600 dark:text-cyan-400" />
						</ItemMedia>
						<ItemContent className="items-center text-center gap-1">
							<div className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground font-medium">
								Chill
							</div>
							<div className="text-base md:text-xl font-bold">
								{formatTime(recipe.chillTime)}
							</div>
						</ItemContent>
					</Item>
				)}

				<Item
					variant="outline"
					className="flex-col items-center p-4 md:p-6 gap-2 md:gap-3"
				>
					<ItemMedia
						variant="icon"
						className="bg-primary/10 border-primary/20 size-10 md:size-12"
					>
						<UsersIcon className="size-4 md:size-5 text-primary" />
					</ItemMedia>
					<ItemContent className="items-center text-center gap-2">
						<div className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground font-medium">
							Servings
						</div>
						<div className="flex items-center gap-1 md:gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 md:h-8 md:w-8 hover:bg-primary/10"
								onClick={handleDecrease}
								disabled={servingMultiplier <= 0.5}
							>
								<MinusIcon className="size-3 md:size-4" />
							</Button>
							<div className="text-base md:text-xl font-bold min-w-[3ch] text-center">
								{adjustedServings}
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 md:h-8 md:w-8 hover:bg-primary/10"
								onClick={handleIncrease}
								disabled={servingMultiplier >= 10}
							>
								<PlusIcon className="size-3 md:size-4" />
							</Button>
						</div>
					</ItemContent>
				</Item>

				<Item
					variant="outline"
					className="flex-col items-center p-4 md:p-6 gap-2 md:gap-3 justify-center"
				>
					<div className="text-center space-y-2 md:space-y-3">
						<div className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground font-medium">
							Level
						</div>
						<Badge
							variant={
								recipe.difficulty === "easy"
									? "default"
									: recipe.difficulty === "medium"
									? "secondary"
									: "destructive"
							}
							className={`text-xs md:text-sm px-3 md:px-4 py-1 md:py-1.5 ${
								recipe.difficulty === "easy"
									? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
									: recipe.difficulty === "medium"
									? "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-100"
									: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
							}`}
						>
							{recipe.difficulty.charAt(0).toUpperCase() +
								recipe.difficulty.slice(1)}
						</Badge>
					</div>
				</Item>
			</div>

			{servingMultiplier !== 1 && (
				<div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
					<p className="text-base text-blue-900 dark:text-blue-100 text-center">
						📊 Scaled for{" "}
						<strong className="font-semibold">
							{adjustedServings} serving{adjustedServings !== 1 ? "s" : ""}
						</strong>{" "}
						(×{servingMultiplier})
					</p>
				</div>
			)}
		</div>
	)
}
