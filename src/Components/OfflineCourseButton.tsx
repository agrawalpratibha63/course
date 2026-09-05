import { useState } from "react";
import { CheckCircle2, Download, LoaderCircle, Trash2 } from "lucide-react";
import type { Course } from "@/Components/data/constant";
import { removeOfflineCourse, saveCourseOffline, useOfflineCourses } from "@/lib/offline";

export default function OfflineCourseButton({ course }: { course: Course }) {
  const saved = useOfflineCourses().some((item) => item.id === course.id);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function download() { setLoading(true); setError(""); try { await saveCourseOffline(course); } catch { setError("Could not save the course. Please check browser storage and try again."); } finally { setLoading(false); } }
  if (saved) return <div className="mt-3"><div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-700"><CheckCircle2 size={17}/>Available Offline</div><button onClick={()=>removeOfflineCourse(course.id)} className="mt-2 flex w-full items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-600"><Trash2 size={14}/>Remove offline copy</button></div>;
  return <div className="mt-3"><button disabled={loading} onClick={download} className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-bold text-blue-700 disabled:opacity-60">{loading?<LoaderCircle className="animate-spin" size={17}/>:<Download size={17}/>} {loading?"Saving content…":"Download for offline"}</button><p className="mt-1 text-center text-[11px] text-slate-500">Saves text and images only. Videos excluded.</p>{error?<p className="mt-1 text-xs text-red-600">{error}</p>:null}</div>;
}
