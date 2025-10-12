"use client"

import { useState, useMemo } from "react"
import { Item, ItemContent } from "@/components/ui/item"
import { Checkbox } from "@/components/ui/checkbox"
import { TextAnimate } from "@/components/ui/text-animate"
import { ShoppingCartIcon } from "lucide-react"
import {
	convertAmount,
	containsUSUnits,
	containsMetricUnits,
	scaleNumber,
	formatScaledNumber,
	type UnitSystem,
} from "@/lib/unit-conversion"
import type { Recipe } from "@/lib/types"

interface RecipeIngredientsProps {
	ingredients: Recipe["ingredients"]
	servingMultiplier: number
	unitSystem: UnitSystem
}

/**
 * Scale ingredient amount safely
 */
function scaleIngredientAmount(amount: string, multiplier: number): string {
	if (!amount || multiplier === 1) return amount

	// Extract number part and unit part
	const match = amount.match(/^([\d./\s\-¼½¾⅓⅔⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚]+)\s*(.*)$/)
	if (!match) return amount

	const [, numPart, restOfAmount] = match

	// Use the utility function to scale
	const scaledValue = scaleNumber(numPart, multiplier)
	if (scaledValue === null) return amount

	// Format the scaled value
	const formattedValue = formatScaledNumber(scaledValue)

	// Reconstruct the amount
	return restOfAmount ? `${formattedValue} ${restOfAmount}` : formattedValue
}

export function RecipeIngredients({
	ingredients,
	servingMultiplier,
	unitSystem,
}: RecipeIngredientsProps) {
	const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

	// Scale ingredients based on serving multiplier AND convert units
	const scaledIngredients = useMemo(() => {
		return ingredients.map((ing) => {
			try {
				// First, scale the amount
				const scaledAmount = scaleIngredientAmount(
					ing.amount,
					servingMultiplier
				)

				// Then, determine the source unit system and convert if needed
				const hasUSUnits = containsUSUnits(scaledAmount)
				const hasMetricUnits = containsMetricUnits(scaledAmount)

				let convertedAmount = scaledAmount

				if (hasUSUnits && unitSystem === "metric") {
					// Convert from US to Metric
					convertedAmount = convertAmount(scaledAmount, "us", "metric")
				} else if (hasMetricUnits && unitSystem === "us") {
					// Convert from Metric to US
					convertedAmount = convertAmount(scaledAmount, "metric", "us")
				}

				return {
					...ing,
					amount: convertedAmount,
				}
			} catch (error) {
				// If any error occurs, return original ingredient
				console.error("Error converting ingredient:", ing, error)
				return ing
			}
		})
	}, [ingredients, servingMultiplier, unitSystem])

	// Group ingredients by section first, then by category if no sections
	const hasSections = scaledIngredients.some((ing) => ing.section)

	const grouped = scaledIngredients.reduce((acc, ing, index) => {
		const groupKey = hasSections
			? ing.section || "Other"
			: ing.category || "other"
		if (!acc[groupKey]) acc[groupKey] = []
		acc[groupKey].push({ ...ing, originalIndex: index })
		return acc
	}, {} as Record<string, Array<Recipe["ingredients"][0] & { originalIndex: number }>>)

	const handleCheckChange = (index: number, checked: boolean) => {
		const newChecked = new Set(checkedItems)
		if (checked) {
			newChecked.add(index)
		} else {
			newChecked.delete(index)
		}
		setCheckedItems(newChecked)
	}

	const categoryLabels: Record<string, string> = {
		protein: "🥩 Protein",
		vegetable: "🥬 Vegetables",
		grain: "🌾 Grains & Pasta",
		dairy: "🧈 Dairy",
		spice: "🧂 Spices & Seasonings",
		other: "📦 Other",
	}

	const checkedCount = checkedItems.size
	const totalCount = scaledIngredients.length

	return (
		<div className="space-y-6 md:space-y-8">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
					<ShoppingCartIcon className="size-5 md:size-7 text-primary" />
					<TextAnimate animation="slideUp" delay={0.05} by="word" once>
						Ingredients
					</TextAnimate>
				</h2>
				{checkedCount > 0 && (
					<TextAnimate
						animation="fadeIn"
						className="text-sm md:text-base text-muted-foreground font-medium"
						delay={0.1}
						once
					>
						{`${checkedCount} of ${totalCount} gathered`}
					</TextAnimate>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{Object.entries(grouped).map(([groupKey, items], groupIndex) => (
					<div key={groupKey} className="space-y-4">
						<TextAnimate
							animation="blurIn"
							as="h3"
							className={`font-semibold uppercase tracking-wider flex items-center gap-2 pb-2 border-b ${
								hasSections
									? "text-lg text-foreground border-border"
									: "text-base text-muted-foreground border-border/50"
							}`}
							delay={0.1 + groupIndex * 0.05}
							by="word"
							once
						>
							{String(
								hasSections ? groupKey : categoryLabels[groupKey] || groupKey
							)}
						</TextAnimate>
						<div className="space-y-3">
							{items.map((ingredient) => {
								const isChecked = checkedItems.has(ingredient.originalIndex)
								return (
									<Item
										key={ingredient.originalIndex}
										variant="muted"
										size="sm"
										className="items-start py-3 px-4"
									>
										<Checkbox
											id={`ingredient-${groupKey}-${ingredient.originalIndex}`}
											className="mt-1.5"
											checked={isChecked}
											onCheckedChange={(checked) =>
												handleCheckChange(
													ingredient.originalIndex,
													checked as boolean
												)
											}
										/>
										<ItemContent>
											<label
												htmlFor={`ingredient-${groupKey}-${ingredient.originalIndex}`}
												className={`text-base cursor-pointer transition-all leading-relaxed ${
													isChecked
														? "line-through text-muted-foreground"
														: "text-foreground"
												}`}
											>
												<span className="font-semibold">
													{ingredient.amount}
												</span>{" "}
												<span>{ingredient.item}</span>
											</label>
										</ItemContent>
									</Item>
								)
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
