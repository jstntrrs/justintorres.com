import type { Filter, HexItem } from "@/lib/types";
import { VALID_FILTERS, ALL_ITEMS } from "@/lib/constants";

export interface ParsedPath {
  filter: Filter;
  selectedItem: HexItem | null;
  hasItem: boolean;
}

export function parsePath(pathname: string): ParsedPath {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] || "";
  const isFilterSegment =
    VALID_FILTERS.includes(first as Filter) && first !== "all";

  if (isFilterSegment && segments[1]) {
    const selectedItem = ALL_ITEMS.find((i) => i.id === segments[1]) ?? null;
    return { filter: first as Filter, selectedItem, hasItem: true };
  }

  if (isFilterSegment) {
    return { filter: first as Filter, selectedItem: null, hasItem: false };
  }

  return { filter: "all", selectedItem: null, hasItem: false };
}
