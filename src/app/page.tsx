"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResourceInput } from "@/components/resource-input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Trash2, Github, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearningRoadmap } from "@/components/learning-roadmap";
import { LayoutGrid, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useResources } from "@/lib/hooks/use-resources";
import { type Resource } from "@/lib/hooks/use-resources";
import { SearchBar } from "@/components/search-bar";
import { SortSelect } from "@/components/sort-select";
import { ResourceSkeleton } from "@/components/resource-skeleton";
import { ResourceDialog } from "@/components/resource-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { User } from "@supabase/supabase-js";
import { UserMenu } from "@/components/user-menu";

type SortOption = "date-desc" | "date-asc" | "title" | "progress";

const LayoutSwitcher = ({
  view,
  onViewChange,
}: {
  view: "grid" | "roadmap";
  onViewChange: (view: "grid" | "roadmap") => void;
}) => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onViewChange("grid");
      }
      if (e.key === "2" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onViewChange("roadmap");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onViewChange]);

  return (
    <div className="relative flex items-center p-1 bg-muted/30 backdrop-blur-sm rounded-lg border border-border">
      <motion.div
        className="absolute inset-y-1 rounded-md bg-background shadow-sm ring-1 ring-border/50"
        initial={false}
        animate={{
          x: view === "grid" ? "0%" : "100%",
        }}
        transition={{
          type: "spring",
          bounce: 0.15,
          duration: 0.5,
        }}
        style={{
          width: "calc(50% - 4px)",
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("grid")}
        className={cn(
          "relative z-10 flex-1 px-3 py-1.5 flex items-center justify-between transition-all duration-200",
          view === "grid"
            ? "text-foreground font-medium"
            : "text-muted-foreground/70 hover:text-muted-foreground"
        )}
      >
        <motion.div
          className="flex items-center"
          animate={{ scale: view === "grid" ? 1 : 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Grid
        </motion.div>
        <kbd className="hidden sm:inline-flex items-center text-[10px] text-muted-foreground/50">
          <span>{isMac ? "⌘" : "Ctrl"}</span>
          <span className="ml-1">1</span>
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("roadmap")}
        className={cn(
          "relative z-10 flex-1 px-3 py-1.5 flex items-center justify-between transition-all duration-200",
          view === "roadmap"
            ? "text-foreground font-medium"
            : "text-muted-foreground/70 hover:text-muted-foreground"
        )}
      >
        <motion.div
          className="flex items-center"
          animate={{ scale: view === "roadmap" ? 1 : 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <Route className="h-4 w-4 mr-2" />
          Map
        </motion.div>
        <kbd className="hidden sm:inline-flex items-center text-[10px] text-muted-foreground/50">
          <span>{isMac ? "⌘" : "Ctrl"}</span>
          <span className="ml-1">2</span>
        </kbd>
      </Button>
    </div>
  );
};

const getFirstName = (user: User) => {
  if (!user) return "";
  // Try to get first name from display name
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name.split(" ")[0];
  }
  // Fallback to username
  if (user.user_metadata?.user_name) {
    return user.user_metadata.user_name;
  }
  // Final fallback
  return "there";
};

export default function Home() {
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const {
    resources,
    loading: resourcesLoading,
    addResource,
    updateResource,
    deleteResource,
  } = useResources();
  const [view, setView] = useState<"grid" | "roadmap">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(
    null
  );
  const [showAddResource, setShowAddResource] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Knowledge Funnel
          </h1>
          <p className="text-base text-muted-foreground">
            Sign in to start organizing your learning resources
          </p>
          <Button onClick={signIn} className="mt-4">
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateResource = async (
    id: string,
    updates: Partial<Resource>
  ) => {
    await updateResource(id, {
      ...updates,
    });
  };

  const uniqueCategories = Array.from(
    new Set(resources.flatMap((r) => r.categories))
  );

  const filteredAndSortedResources = resources
    .filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || resource.categories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "date-asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "progress":
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

  const handleDeleteClick = (e: React.MouseEvent, resource: Resource) => {
    e.stopPropagation();
    setResourceToDelete(resource);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative space-y-2 text-left"
      >
        <div className="absolute right-0 top-0">
          <UserMenu user={user} onSignOut={signOut} />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Knowledge Funnel
          </h1>
        </div>
        <p className="text-base text-muted-foreground">
          Collect and organize your learning resources
        </p>
      </motion.div>

      <div className="mt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <div className="flex-1">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categories={uniqueCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={(category) =>
                setSelectedCategory(
                  selectedCategory === category ? null : category
                )
              }
            />
          </div>
          <div className="flex items-center gap-4">
            <SortSelect
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            />
            <LayoutSwitcher view={view} onViewChange={setView} />
          </div>
        </div>
        <ResourceInput
          open={showAddResource}
          onOpenChange={setShowAddResource}
          onAdd={addResource}
        />

        {resourcesLoading ? (
          <ResourceSkeleton />
        ) : filteredAndSortedResources.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => setShowAddResource(true)}
            >
              <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">
                {resources.length === 0
                  ? "No resources yet"
                  : "No matches found"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {resources.length === 0 ? (
                  <button
                    onClick={() => setShowAddResource(true)}
                    className="hover:underline text-primary"
                  >
                    Add your first resource
                  </button>
                ) : (
                  "Try adjusting your search or filters"
                )}
              </p>
            </div>
          </div>
        ) : (
          <>
            {view === "grid" ? (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence>
                  {filteredAndSortedResources.map((resource) => (
                    <motion.div
                      key={resource.url + resource.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Card
                        className="group relative overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm transition-all hover:shadow-lg dark:shadow-none cursor-pointer"
                        onClick={() => setSelectedResource(resource)}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium leading-none truncate">
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline decoration-2 underline-offset-2"
                                >
                                  {resource.title}
                                </a>
                              </h3>
                              {resource.notes && (
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                  {resource.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateResource(resource.id, {
                                    is_completed: !resource.is_completed,
                                  })
                                }
                                className={cn(
                                  "rounded-full p-1.5 transition-colors",
                                  resource.is_completed
                                    ? "bg-green-50 text-green-600 dark:bg-green-950"
                                    : "hover:bg-muted"
                                )}
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    resource.is_completed
                                      ? "opacity-100"
                                      : "opacity-40"
                                  )}
                                />
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(e, resource)}
                                className="rounded-full p-1.5 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                              >
                                <Trash2 className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                              </button>
                            </div>
                          </div>

                          {resource.categories.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {resource.categories.map((category) => (
                                <Badge
                                  key={category}
                                  variant="secondary"
                                  className="text-xs capitalize bg-white/50 dark:bg-white/5"
                                >
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 space-y-2">
                            <Progress
                              value={resource.progress}
                              className="h-1"
                            />
                            <input
                              type="range"
                              value={resource.progress}
                              onChange={(e) =>
                                handleUpdateResource(resource.id, {
                                  progress: parseInt(e.target.value),
                                })
                              }
                              min="0"
                              max="100"
                              className="w-full accent-primary"
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <LearningRoadmap
                resources={filteredAndSortedResources}
                onResourceClick={setSelectedResource}
              />
            )}
          </>
        )}
      </div>

      {/* <Button
        size="lg"
        className="fixed bottom-8 right-8 shadow-lg"
        onClick={() => setShowAddResource(true)}
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Resource
      </Button> */}

      {selectedResource && (
        <ResourceDialog
          resource={selectedResource}
          open={!!selectedResource}
          onOpenChange={(open) => !open && setSelectedResource(null)}
          onUpdate={(updates) => {
            handleUpdateResource(selectedResource.id, updates);
          }}
          onDelete={deleteResource}
        />
      )}

      {resourceToDelete && (
        <ConfirmDialog
          open={!!resourceToDelete}
          onOpenChange={(open) => !open && setResourceToDelete(null)}
          onConfirm={async () => {
            await deleteResource(resourceToDelete.id);
            setResourceToDelete(null);
          }}
          title="Delete Resource"
          description={`Are you sure you want to delete "${resourceToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      )}
    </div>
  );
}
