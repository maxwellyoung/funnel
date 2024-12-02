"use client";

import { BookOpen, Lock, Code, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Resource } from "@/lib/hooks/use-resources";

interface RoadmapNode {
  title: string;
  description: string;
  resources: Resource[];
  isCompleted: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  categories: string[];
}

// Helper function to determine resource difficulty
const getResourceDifficulty = (
  resource: Resource
): "beginner" | "intermediate" | "advanced" => {
  const complexityIndicators = {
    beginner: [
      "basic",
      "introduction",
      "getting started",
      "fundamentals",
      "101",
    ],
    advanced: ["advanced", "expert", "complex", "architecture", "optimization"],
  };

  const text = `${resource.title} ${resource.notes}`.toLowerCase();

  if (complexityIndicators.advanced.some((term) => text.includes(term))) {
    return "advanced";
  }
  if (complexityIndicators.beginner.some((term) => text.includes(term))) {
    return "beginner";
  }
  return "intermediate";
};

// Helper function to group resources by topic
const groupResourcesByTopic = (resources: Resource[]): RoadmapNode[] => {
  // First, analyze resources to identify main topics
  const topics = new Map<string, Resource[]>();

  resources.forEach((resource) => {
    const mainCategory = resource.categories[0]; // Use first category as main topic
    if (!mainCategory) return;

    const existing = topics.get(mainCategory) || [];
    topics.set(mainCategory, [...existing, resource]);
  });

  // Create roadmap nodes from topics
  return Array.from(topics.entries())
    .map(([topic, resources]): RoadmapNode => {
      // Determine difficulty based on resources
      const difficulties = resources.map(getResourceDifficulty);
      const avgDifficulty =
        difficulties.reduce((acc, d) => {
          if (d === "advanced") return acc + 2;
          if (d === "intermediate") return acc + 1;
          return acc;
        }, 0) / difficulties.length;

      const difficulty =
        avgDifficulty > 1.5
          ? "advanced"
          : avgDifficulty > 0.5
          ? "intermediate"
          : "beginner";

      return {
        title: topic.charAt(0).toUpperCase() + topic.slice(1),
        description: `Resources related to ${topic}`,
        resources,
        isCompleted: resources.every((r) => r.is_completed),
        difficulty: difficulty as "beginner" | "intermediate" | "advanced",
        categories: [topic],
      };
    })
    .sort((a, b) => {
      // Sort by difficulty and completion
      const difficultyOrder: Record<
        "beginner" | "intermediate" | "advanced",
        number
      > = {
        beginner: 0,
        intermediate: 1,
        advanced: 2,
      };
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
};

// Add at the top with other helper functions
const getDifficultyColor = (
  difficulty: "beginner" | "intermediate" | "advanced"
) => {
  switch (difficulty) {
    case "beginner":
      return "text-green-500";
    case "intermediate":
      return "text-yellow-500";
    case "advanced":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
};

// Add these helper functions
const getNodeIcon = (difficulty: "beginner" | "intermediate" | "advanced") => {
  switch (difficulty) {
    case "beginner":
      return <BookOpen className="h-5 w-5" />;
    case "intermediate":
      return <Code className="h-5 w-5" />;
    case "advanced":
      return <Zap className="h-5 w-5" />;
  }
};

const getDifficultyBadgeColor = (
  difficulty: "beginner" | "intermediate" | "advanced"
) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-50 text-green-600 dark:bg-green-950";
    case "intermediate":
      return "bg-yellow-50 text-yellow-600 dark:bg-yellow-950";
    case "advanced":
      return "bg-red-50 text-red-600 dark:bg-red-950";
  }
};

interface LearningRoadmapProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
}

export function LearningRoadmap({
  resources,
  onResourceClick,
}: LearningRoadmapProps) {
  const roadmap = groupResourcesByTopic(resources);

  const isNodeLocked = (index: number) => {
    if (index === 0) return false;
    const previousNodes = roadmap.slice(0, index);
    return !previousNodes.every(
      (node: RoadmapNode) =>
        node.resources.length === 0 ||
        node.resources.some((r) => r.is_completed)
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="space-y-12">
        {roadmap.map((node, index) => {
          const isLocked = isNodeLocked(index);
          const nodeProgress = node.resources.length
            ? (node.resources.filter((r) => r.is_completed).length /
                node.resources.length) *
              100
            : 0;

          return (
            <motion.div
              key={node.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {index !== roadmap.length - 1 && (
                <motion.div
                  className="absolute left-6 top-12 h-full border-l-2 border-dashed border-muted-foreground/20"
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              )}
              <div className="flex gap-6">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                      isLocked
                        ? "bg-muted"
                        : getDifficultyBadgeColor(node.difficulty)
                    )}
                  >
                    {isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      getNodeIcon(node.difficulty)
                    )}
                  </div>
                  <Progress
                    value={nodeProgress}
                    className={cn(
                      "absolute -right-3 top-6 w-24 h-1 rotate-90 origin-left",
                      nodeProgress === 100 && "bg-primary"
                    )}
                  />
                </motion.div>
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{node.title}</h3>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs capitalize",
                          getDifficultyColor(node.difficulty)
                        )}
                      >
                        {node.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {node.description}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {node.resources.map((resource) => (
                      <Card
                        key={resource.url}
                        className={cn(
                          "p-4 space-y-3 transition-opacity cursor-pointer",
                          isLocked && "opacity-50"
                        )}
                        onClick={() => !isLocked && onResourceClick(resource)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium line-clamp-1">
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {resource.title}
                              </a>
                            </h4>
                            {resource.notes && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {resource.notes}
                              </p>
                            )}
                          </div>
                          <BookOpen
                            className={cn(
                              "h-4 w-4",
                              resource.is_completed
                                ? "text-primary"
                                : "text-muted-foreground/40"
                            )}
                          />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {resource.categories.map((category) => (
                            <Badge
                              key={category}
                              variant="secondary"
                              className="text-xs"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <Progress value={resource.progress} className="h-1" />
                      </Card>
                    ))}
                  </div>
                  {node.resources.length === 0 && (
                    <div className="text-center py-8 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        No resources yet. Add resources with the following
                        categories:
                      </p>
                      <div className="flex gap-2 justify-center mt-2">
                        {node.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
