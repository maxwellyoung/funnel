import { useState, useEffect } from "react";

interface Preferences {
  view: "grid" | "roadmap";
  sort: string;
  theme: "light" | "dark" | "system";
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferences");
      return saved
        ? JSON.parse(saved)
        : {
            view: "grid",
            sort: "date-desc",
            theme: "system",
          };
    }
    return {
      view: "grid",
      sort: "date-desc",
      theme: "system",
    };
  });

  useEffect(() => {
    localStorage.setItem("preferences", JSON.stringify(preferences));
  }, [preferences]);

  return [preferences, setPreferences] as const;
}
