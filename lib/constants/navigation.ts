import type { Filter, HexItem } from "@/lib/types";
import { SKILLS } from "./skills";
import { WORKS } from "./works";

export const VALID_FILTERS: Filter[] = ["all", "skills", "works"];
export const ALL_ITEMS: HexItem[] = [...SKILLS, ...WORKS];
