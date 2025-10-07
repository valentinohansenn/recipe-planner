"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { LightbulbIcon } from "lucide-react";

interface RecipeTipsProps {
  tips: string[];
}

export function RecipeTips({ tips }: RecipeTipsProps) {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <LightbulbIcon className="size-7 text-primary" />
        <h2 className="text-3xl font-bold">Tips & Tricks</h2>
      </div>

      <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-6">
        <AlertDescription className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="size-6 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    {index + 1}
                  </span>
                </div>
              </div>
              <p className="text-base text-foreground leading-relaxed flex-1">
                {tip}
              </p>
            </div>
          ))}
        </AlertDescription>
      </Alert>
    </div>
  );
}

