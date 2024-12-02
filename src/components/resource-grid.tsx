"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Resource } from "@/lib/hooks/use-resources";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ResourceGrid({ resources }: { resources: Resource[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence mode="popLayout">
        {resources.map((resource) => (
          <motion.div
            key={resource.id}
            layoutId={resource.id}
            variants={item}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative"
          >
            {/* Resource card content */}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
