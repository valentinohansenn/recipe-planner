"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { ChevronDownIcon, ChefHatIcon, UserIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatMessageCardProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessageCard({
  role,
  content,
  isStreaming = false,
}: ChatMessageCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isUser = role === "user";

  // For user messages, show simple card
  if (isUser) {
    return (
      <Item
        variant="outline"
        className="rounded-2xl border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-right-4 duration-300"
      >
        <ItemMedia variant="icon" className="bg-primary/10 border-primary/20">
          <UserIcon className="size-4 text-primary" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-foreground">You</ItemTitle>
          <ItemDescription className="text-foreground/90 whitespace-pre-wrap line-clamp-none">
            {content}
          </ItemDescription>
        </ItemContent>
      </Item>
    );
  }

  // For assistant messages, show collapsible card
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="animate-in fade-in slide-in-from-left-4 duration-300"
    >
      <Item
        variant="muted"
        className="rounded-2xl border-border/50 transition-all"
      >
        <ItemMedia variant="icon" className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800">
          <ChefHatIcon className="size-4 text-orange-600 dark:text-orange-400" />
        </ItemMedia>

        <ItemContent className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <ItemTitle className="text-foreground flex items-center gap-2">
              Chef Auguste
              {isStreaming && (
                <Badge variant="secondary" className="gap-1 px-2 py-0.5 animate-pulse">
                  <SparklesIcon className="size-3" />
                  <span className="text-xs">Cooking up a response...</span>
                </Badge>
              )}
            </ItemTitle>

            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "p-1.5 hover:bg-muted rounded-lg transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20"
                )}
              >
                <ChevronDownIcon
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "transform rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-3">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {content}
              </p>
            </div>
          </CollapsibleContent>
        </ItemContent>
      </Item>
    </Collapsible>
  );
}



