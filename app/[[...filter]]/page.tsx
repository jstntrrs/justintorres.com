import { SKILLS, WORKS } from "@/lib/constants";

export function generateStaticParams() {
  return [
    { filter: [] },
    { filter: ["skills"] },
    { filter: ["works"] },
    ...SKILLS.map((s) => ({ filter: ["skills", s.id] })),
    ...WORKS.map((w) => ({ filter: ["works", w.id] })),
  ];
}

export default function Home() {
  return null;
}
