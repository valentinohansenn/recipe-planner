import type { Recipe } from "./schema";

export interface ThoughtStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
  files?: string[];
}

export interface AppState {
  mode: "initial" | "active";
  recipe: Recipe | null;
  thoughtSteps: ThoughtStep[];
  isGenerating: boolean;
}

export type { Recipe };




