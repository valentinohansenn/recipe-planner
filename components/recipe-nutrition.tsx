"use client";

import { Item, ItemContent } from "@/components/ui/item";
import { TextAnimate } from "@/components/ui/text-animate";
import { ActivityIcon } from "lucide-react";
import type { Recipe } from "@/lib/types";

interface RecipeNutritionProps {
  nutrition: NonNullable<Recipe["nutritionEstimate"]>;
  servingMultiplier: number;
}

export function RecipeNutrition({ nutrition, servingMultiplier }: RecipeNutritionProps) {
  // Scale nutrition values
  const scaledCalories = Math.round(nutrition.calories * servingMultiplier);

  // Helper to scale string values like "14g"
  const scaleNutritionValue = (value: string): string => {
    const match = value.match(/^([\d.]+)(.*)$/);
    if (!match) return value;

    const [, num, unit] = match;
    const scaledNum = parseFloat(num) * servingMultiplier;
    return `${scaledNum.toFixed(1).replace(/\.0$/, '')}${unit}`;
  };

  const scaledProtein = scaleNutritionValue(nutrition.protein);
  const scaledCarbs = scaleNutritionValue(nutrition.carbs);
  const scaledFat = scaleNutritionValue(nutrition.fat);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <ActivityIcon className="size-7 text-primary" />
        <TextAnimate
          animation="slideUp"
          delay={0.05}
          by="word"
          once
        >
          Nutrition Facts
        </TextAnimate>
      </h2>

      <div className="bg-card border border-border rounded-xl p-8">
        <div className="space-y-6">
          {/* Calories - Highlighted */}
          <div className="pb-6 border-b-2 border-border">
            <div className="flex items-baseline justify-between">
              <TextAnimate
                animation="scaleUp"
                as="span"
                className="text-2xl font-bold"
                delay={0.1}
                by="word"
                once
              >
                Calories
              </TextAnimate>
              <span className="text-4xl font-bold text-primary">{scaledCalories}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">per serving</p>
          </div>

          {/* Macronutrients Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Item variant="outline" className="flex-col items-center p-6 gap-3">
              <ItemContent className="items-center text-center gap-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Protein
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {scaledProtein}
                </div>
              </ItemContent>
            </Item>

            <Item variant="outline" className="flex-col items-center p-6 gap-3">
              <ItemContent className="items-center text-center gap-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Carbs
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {scaledCarbs}
                </div>
              </ItemContent>
            </Item>

            <Item variant="outline" className="flex-col items-center p-6 gap-3">
              <ItemContent className="items-center text-center gap-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Fat
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {scaledFat}
                </div>
              </ItemContent>
            </Item>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              * Nutritional values are estimates and may vary based on specific ingredients used
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
