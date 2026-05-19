"use client";

import { useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Filter, HexItem } from "@/lib/types";
import { parsePath } from "@/lib/client";

export function useNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { filter: urlFilter, selectedItem, hasItem } = parsePath(pathname);
  const activeFilterRef = useRef<Filter>("all");

  if (!hasItem) {
    activeFilterRef.current = urlFilter;
  }
  const filter = activeFilterRef.current;
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const navigate = useCallback(
    (item: HexItem | null) => {
      if (item) {
        router.push(`/${item.type}/${item.id}`, { scroll: false });
      } else {
        const f = filterRef.current;
        router.push(f === "all" ? "/" : `/${f}`, { scroll: false });
      }
    },
    [router, filterRef]
  );

  return { filter, selectedItem, navigate };
}
