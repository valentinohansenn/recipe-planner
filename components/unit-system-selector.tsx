"use client";

import { Check, RulerIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { UnitSystem } from "@/lib/unit-conversion";

interface UnitSystemSelectorProps {
  value: UnitSystem;
  onChange: (system: UnitSystem) => void;
}

export function UnitSystemSelector({ value, onChange }: UnitSystemSelectorProps) {
  const systems = [
    { value: 'us' as const, label: 'US (cups, oz, lbs)', icon: '🇺🇸' },
    { value: 'metric' as const, label: 'Metric (ml, g, kg)', icon: '🌍' },
  ];

  const currentSystem = systems.find(s => s.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-medium"
        >
          <RulerIcon className="size-4" />
          <span className="hidden sm:inline">{currentSystem?.icon} {currentSystem?.label.split(' ')[0]}</span>
          <span className="sm:hidden">{currentSystem?.icon}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {systems.map((system) => (
          <DropdownMenuItem
            key={system.value}
            onClick={() => onChange(system.value)}
            className="cursor-pointer gap-3"
          >
            <span className="text-lg">{system.icon}</span>
            <span className="flex-1">{system.label}</span>
            {value === system.value && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

