"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MinusIcon, PlusIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecipeContext } from "@/contexts/recipe-context";

interface ServingSizeControlProps {
  className?: string;
}

export function ServingSizeControl({ className }: ServingSizeControlProps) {
  const { defaultServings, setDefaultServings } = useRecipeContext();
  const [isVisible, setIsVisible] = useState(false);

  // Show control with animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDecrease = () => {
    if (defaultServings > 1) {
      setDefaultServings(defaultServings - 1);
    }
  };

  const handleIncrease = () => {
    if (defaultServings < 20) {
      setDefaultServings(defaultServings + 1);
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2",
        className
      )}
    >
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800/50 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <UsersIcon className="size-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Default Servings
              </p>
              <p className="text-xs text-muted-foreground">
                Adjust for new recipes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all"
              onClick={handleDecrease}
              disabled={defaultServings <= 1}
            >
              <MinusIcon className="size-4" />
            </Button>

            <Badge
              variant="secondary"
              className="px-4 py-2 text-lg font-bold min-w-[4ch] justify-center bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800"
            >
              {defaultServings}
            </Badge>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all"
              onClick={handleIncrease}
              disabled={defaultServings >= 20}
            >
              <PlusIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-orange-200/50 dark:border-orange-800/50">
          <p className="text-xs text-center text-muted-foreground">
            This will be the default serving size for new recipes
          </p>
        </div>
      </div>
    </div>
  );
}

