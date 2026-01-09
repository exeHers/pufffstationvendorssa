import { createClient } from "@/lib/supabase/client";

export type Flavour = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export async function fetchActiveFlavours(): Promise<Flavour[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("flavours")
    .select("id,name,slug,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetchActiveFlavours error:", error);
    return [];
  }

  return data ?? [];
}