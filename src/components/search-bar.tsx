"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategorySelect,
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className={cn(
                "cursor-pointer transition-colors",
                selectedCategory === category
                  ? "hover:bg-primary/80"
                  : "hover:bg-secondary/80"
              )}
              onClick={() => onCategorySelect(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
