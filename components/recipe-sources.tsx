"use client";

import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";
import { TextAnimate } from "@/components/ui/text-animate";
import { BookOpenIcon } from "lucide-react";

interface RecipeSource {
  title: string;
  url: string;
  source?: string;
}

interface RecipeSourcesProps {
  sources: RecipeSource[];
}

export function RecipeSources({ sources }: RecipeSourcesProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BookOpenIcon className="size-7 text-primary" />
        <TextAnimate
          animation="slideUp"
          as="h2"
          className="text-3xl font-bold"
          delay={0.05}
          by="word"
          once
        >
          Sources
        </TextAnimate>
      </div>

      <Sources className="text-base">
        <SourcesTrigger count={sources.length} className="text-primary hover:text-primary/80 transition-colors">
          <p className="font-semibold text-lg">View {sources.length} source{sources.length !== 1 ? 's' : ''} used</p>
          <svg className="h-5 w-5 transition-transform ui-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </SourcesTrigger>
        <SourcesContent className="space-y-3 pt-4">
          {sources.map((source, index) => (
            <Source
              key={index}
              href={source.url}
              title={source.title}
              className="group hover:text-primary transition-colors text-base flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50"
            >
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <BookOpenIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-semibold text-foreground group-hover:text-primary transition-colors">
                  {source.title}
                </span>
                {source.source && (
                  <span className="block text-sm text-muted-foreground mt-1">
                    {source.source}
                  </span>
                )}
              </div>
            </Source>
          ))}
        </SourcesContent>
      </Sources>
    </div>
  );
}



