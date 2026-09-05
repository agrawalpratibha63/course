import { useMemo, useSyncExternalStore } from "react";
import type { Course } from "@/Components/data/constant";

const KEY = "codes-offline-courses-v1";
const EVENT = "codes-offline-change";

export type OfflineCourse = {
  id: string;
  title: string;
  provider: string;
  type: string;
  description: string;
  image: string;
  skills: string[];
  modules: Array<{ title: string; description: string; duration: string; weeks: number; hours: number; projects: number; quizzes: number }>;
  savedAt: string;
};

function rawSnapshot() { return typeof window === "undefined" ? "[]" : localStorage.getItem(KEY) || "[]"; }
function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback); window.addEventListener("storage", callback);
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener("storage", callback); };
}
function announce() { window.dispatchEvent(new Event(EVENT)); }
function read(): OfflineCourse[] { try { return JSON.parse(rawSnapshot()); } catch { return []; } }

async function imageAsDataUrl(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return "";
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
  } catch { return ""; }
}

export async function saveCourseOffline(course: Course) {
  const image = await imageAsDataUrl(course.image);
  const item: OfflineCourse = {
    id: course.id, title: course.title, provider: course.provider, type: course.type,
    description: course.description, image, skills: course.skills,
    modules: course.modules.map(({ videoId: _videoId, ...module }) => module),
    savedAt: new Date().toISOString(),
  };
  const next = [...read().filter((saved) => saved.id !== item.id), item];
  localStorage.setItem(KEY, JSON.stringify(next)); announce();
}

export function removeOfflineCourse(id: string) { localStorage.setItem(KEY, JSON.stringify(read().filter((course) => course.id !== id))); announce(); }

export function useOfflineCourses() {
  const raw = useSyncExternalStore(subscribe, rawSnapshot, () => "[]");
  return useMemo<OfflineCourse[]>(() => { try { return JSON.parse(raw); } catch { return []; } }, [raw]);
}
