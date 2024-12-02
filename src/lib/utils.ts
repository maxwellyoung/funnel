import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as PDFJS from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import "./pdf-worker";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function categorizeResource(title: string, content: string): string[] {
  const keywords = {
    programming: [
      "code",
      "programming",
      "javascript",
      "typescript",
      "python",
      "java",
      "react",
      "angular",
      "vue",
      "node",
      "api",
      "backend",
      "frontend",
      "fullstack",
      "web",
      "development",
      "github",
      "git",
      "coding",
      "software",
      "app",
      "developer",
    ],
    design: [
      "design",
      "ui",
      "ux",
      "interface",
      "visual",
      "figma",
      "sketch",
      "adobe",
      "prototype",
      "wireframe",
      "layout",
      "typography",
      "color",
      "accessibility",
      "user experience",
      "user interface",
      "responsive",
    ],
    business: [
      "business",
      "startup",
      "marketing",
      "strategy",
      "product",
      "management",
      "leadership",
      "entrepreneur",
      "sales",
      "growth",
      "analytics",
      "metrics",
      "revenue",
      "customer",
      "market",
      "saas",
      "b2b",
      "b2c",
    ],
    learning: [
      "course",
      "tutorial",
      "learn",
      "guide",
      "education",
      "training",
      "workshop",
      "documentation",
      "reference",
      "resource",
      "book",
      "video",
      "lecture",
      "lesson",
      "study",
      "practice",
    ],
    productivity: [
      "productivity",
      "workflow",
      "tools",
      "automation",
      "efficiency",
      "time",
      "management",
      "organization",
      "planning",
      "task",
      "project",
      "process",
      "methodology",
      "system",
    ],
    technology: [
      "tech",
      "ai",
      "machine learning",
      "data",
      "cloud",
      "security",
      "devops",
      "infrastructure",
      "architecture",
      "database",
      "blockchain",
      "mobile",
      "iot",
      "artificial intelligence",
      "ml",
      "deep learning",
    ],
  };

  const text = `${title} ${content}`.toLowerCase();

  // Find matches for each category
  const matches = Object.entries(keywords).map(([category, words]) => {
    const matchCount = words.reduce((count, word) => {
      // Use word boundary for more accurate matching
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);

    return { category, matchCount };
  });

  // Filter categories with matches and sort by match count
  return matches
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map(({ category }) => category);
}

export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export async function extractFileContent(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items
          .filter((item): item is TextItem => "str" in item)
          .map((item) => item.str);
        fullText += strings.join(" ") + "\n";
      }

      return fullText;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      throw new Error(
        "Failed to extract text from PDF. Please try again or use a different file."
      );
    }
  } else if (file.type.startsWith("text/")) {
    return await file.text();
  }

  throw new Error("Unsupported file type. Please use PDF or text files.");
}
