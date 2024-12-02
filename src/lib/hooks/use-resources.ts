import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { useAuth } from "@/lib/auth";
import { PostgrestError } from "@supabase/supabase-js";

export type Resource = Database["public"]["Tables"]["resources"]["Row"] & {
  categories: string[];
};

export type NewResource = Omit<Resource, "id" | "created_at" | "user_id">;

type SupabaseCategoryResponse = {
  resource_id: string;
  categories: {
    name: string;
  };
}[];

export function useResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setResources([]);
      setLoading(false);
      return;
    }

    async function fetchResources() {
      try {
        // Fetch resources
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("resources")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false });

        if (resourcesError) throw resourcesError;
        if (!resourcesData) return;

        // Fetch resource categories
        const { data: categoriesData, error: categoriesError } = (await supabase
          .from("resource_categories")
          .select(
            `
            resource_id,
            categories (
              name
            )
          `
          )
          .in(
            "resource_id",
            resourcesData.map((r) => r.id)
          )) as {
          data: SupabaseCategoryResponse | null;
          error: PostgrestError | null;
        };

        if (categoriesError) throw categoriesError;
        if (!categoriesData) return;

        // Combine resources with their categories
        const resourcesWithCategories = resourcesData.map((resource) => ({
          ...resource,
          categories: categoriesData
            .filter((c) => c.resource_id === resource.id)
            .map((c) => c.categories.name),
        }));

        setResources(resourcesWithCategories);
        setError(null);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, [user]);

  const addResource = async (resource: NewResource) => {
    if (!user) return;

    try {
      const { data: newResource, error: resourceError } = await supabase
        .from("resources")
        .insert({
          ...resource,
          user_id: user.id,
        })
        .select()
        .single();

      if (resourceError) throw resourceError;

      // Get or create categories
      const categoryPromises = resource.categories.map(async (categoryName) => {
        const { data: existingCategory } = await supabase
          .from("categories")
          .select("id")
          .eq("name", categoryName)
          .single();

        if (existingCategory) return existingCategory.id;

        const { data: newCategory } = await supabase
          .from("categories")
          .insert({ name: categoryName })
          .select()
          .single();

        return newCategory?.id;
      });

      const categoryIds = await Promise.all(categoryPromises);

      // Link categories to resource
      await supabase.from("resource_categories").insert(
        categoryIds.map((categoryId) => ({
          resource_id: newResource.id,
          category_id: categoryId,
        }))
      );

      // Update local state
      setResources((prev) => [
        { ...newResource, categories: resource.categories },
        ...prev,
      ]);
    } catch (err) {
      console.error("Error adding resource:", err);
      throw err;
    }
  };

  const updateResource = async (
    id: string,
    updates: Partial<Omit<Resource, "id" | "created_at" | "user_id">>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("resources")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    } catch (err) {
      console.error("Error updating resource:", err);
      throw err;
    }
  };

  const deleteResource = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);

      if (error) throw error;

      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting resource:", err);
      throw err;
    }
  };

  return {
    resources,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
  };
}
