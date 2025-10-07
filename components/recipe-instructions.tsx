"use client";

import { useState } from "react";
import { ClockIcon, ChefHatIcon, CheckCircle2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { Recipe } from "@/lib/types";

interface RecipeInstructionsProps {
  steps: Recipe["steps"];
}

export function RecipeInstructions({ steps }: RecipeInstructionsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepToggle = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    if (completedSteps.has(stepNumber)) {
      newCompleted.delete(stepNumber);
    } else {
      newCompleted.add(stepNumber);
    }
    setCompletedSteps(newCompleted);
  };

  // Check if steps have sections
  const hasSections = steps.some(step => step.section);

  // Group steps by section if sections exist
  const groupedSteps = hasSections
    ? steps.reduce((acc, step) => {
        const section = step.section || "Other";
        if (!acc[section]) acc[section] = [];
        acc[section].push(step);
        return acc;
      }, {} as Record<string, Recipe["steps"]>)
    : { "All Steps": steps };

  // Calculate total cooking time
  const totalTime = steps.reduce((sum, step) => sum + (step.duration || 0), 0);
  const completedCount = completedSteps.size;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <ChefHatIcon className="size-7 text-primary" />
          Instructions
        </h2>
        {completedCount > 0 && (
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
            <CheckCircle2Icon className="size-4" />
            <span className="text-sm">{completedCount} of {steps.length} completed</span>
          </Badge>
        )}
      </div>

      {totalTime > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <ClockIcon className="size-5 text-amber-700 dark:text-amber-300" />
          </div>
          <span className="text-base text-amber-900 dark:text-amber-100">
            Total time: <strong className="font-semibold">{totalTime} minutes</strong>
          </span>
        </div>
      )}

      <div className="space-y-10">
        {Object.entries(groupedSteps).map(([section, sectionSteps]) => (
          <div key={section} className="space-y-5">
            {hasSections && (
              <h3 className="text-xl font-bold text-foreground pb-2 border-b border-border/50">
                {section}
              </h3>
            )}
            <div className="space-y-5">
              {sectionSteps.map((step, index) => {
                const isCompleted = completedSteps.has(step.stepNumber);
                const isNext = index === 0 || completedSteps.has(sectionSteps[index - 1].stepNumber);

                return (
                  <div
                    key={step.stepNumber}
                    className={`relative border rounded-xl p-6 transition-all ${
                      isCompleted
                        ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800/50"
                        : isNext
                          ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50"
                          : "bg-card border-border/50"
                    }`}
                  >
              <div className="flex gap-6">
                <div className="flex-shrink-0 flex flex-col items-center gap-4">
                  <div className={`flex size-14 items-center justify-center rounded-2xl font-bold text-xl transition-all ${
                    isCompleted
                      ? "bg-green-500 text-white shadow-md"
                      : isNext
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {isCompleted ? <CheckCircle2Icon className="size-7" /> : step.stepNumber}
                  </div>
                  <Checkbox
                    id={`step-${step.stepNumber}`}
                    checked={isCompleted}
                    onCheckedChange={() => handleStepToggle(step.stepNumber)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className={`text-lg leading-relaxed transition-all ${
                        isCompleted
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}>
                        {step.instruction}
                      </p>
                    </div>
                    {isNext && !isCompleted && (
                      <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 shrink-0 px-3 py-1">
                        <span className="text-sm">Up Next</span>
                      </Badge>
                    )}
                  </div>

                  {step.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                      <ClockIcon className="size-4" />
                      <span>{step.duration} minutes</span>
                    </div>
                  )}
                </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ))}
      </div>

      {completedCount === steps.length && steps.length > 0 && (
        <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center space-y-3">
          <div className="text-5xl mb-2">🎉</div>
          <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
            All Done!
          </h3>
          <p className="text-base text-green-700 dark:text-green-300 max-w-md mx-auto">
            Time to enjoy your delicious creation!
          </p>
        </div>
      )}
    </div>
  );
}

