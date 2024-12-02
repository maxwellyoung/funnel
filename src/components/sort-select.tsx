"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function SortSelect({ value, onValueChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date-desc">Newest first</SelectItem>
        <SelectItem value="date-asc">Oldest first</SelectItem>
        <SelectItem value="title">Title</SelectItem>
        <SelectItem value="progress">Progress</SelectItem>
      </SelectContent>
    </Select>
  );
}
