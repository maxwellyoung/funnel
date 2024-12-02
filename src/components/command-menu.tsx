"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  GitBranch,
  Plus,
  SortAsc,
  SortDesc,
  Filter,
} from "lucide-react";

interface CommandMenuProps {
  onViewChange: (view: "grid" | "roadmap") => void;
  onSort: (sort: string) => void;
  onAddResource: () => void;
}

export function CommandMenu({
  onViewChange,
  onSort,
  onAddResource,
}: CommandMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={onAddResource}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </CommandItem>
          <CommandItem onSelect={() => onViewChange("grid")}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Grid View
          </CommandItem>
          <CommandItem onSelect={() => onViewChange("roadmap")}>
            <GitBranch className="mr-2 h-4 w-4" />
            Roadmap View
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Sort">
          <CommandItem onSelect={() => onSort("date-desc")}>
            <SortDesc className="mr-2 h-4 w-4" />
            Newest First
          </CommandItem>
          <CommandItem onSelect={() => onSort("date-asc")}>
            <SortAsc className="mr-2 h-4 w-4" />
            Oldest First
          </CommandItem>
          <CommandItem onSelect={() => onSort("title")}>
            <Filter className="mr-2 h-4 w-4" />
            By Title
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
