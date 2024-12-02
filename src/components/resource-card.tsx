"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResourceCardProps {
  title: string;
  url: string;
  notes?: string;
  categories: string[];
}

export function ResourceCard({
  title,
  url,
  notes,
  categories,
}: ResourceCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden hover-lift">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-medium leading-none">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {title}
              </a>
            </h3>
            <button
              onClick={() => setIsCompleted(!isCompleted)}
              className={`rounded-full p-2 transition-colors duration-200 ${
                isCompleted
                  ? "bg-green-100 text-green-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <Check
                className={`h-4 w-4 ${
                  isCompleted ? "opacity-100" : "opacity-30"
                }`}
              />
            </button>
          </div>

          {notes && <p className="text-sm text-muted-foreground">{notes}</p>}

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="secondary" className="capitalize">
                {category}
              </Badge>
            ))}
          </div>

          <div className="mt-4">
            <Progress value={progress} />
            <input
              type="range"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              min="0"
              max="100"
              className="w-full mt-2"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
