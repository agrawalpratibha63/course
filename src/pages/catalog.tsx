import Head from "next/head";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/router";
import { useDeferredValue, useMemo, useState } from "react";
import CourseCard from "@/Components/CourseCard";
import { courses } from "@/Components/data/constant";

const TAGS = ["All", "Programming", "Design", "Marketing"] as const;
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const COURSE_TAGS: Record<string, string[]> = {
  "microsoft-front-end": ["Programming", "Design"],
  "microsoft-backend": ["Programming"],
  "microsoft-fullstack": ["Programming", "Design"],
  "microsoft-project-management": ["Marketing"],
};

export default function Catalog() {
  const router = useRouter();
  const [search, setSearch] = useState(() => String(router.query.q || ""));
  const [tag, setTag] = useState("All");
  const [level, setLevel] = useState("All");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const items = useMemo(() => courses.filter((course) => {
    const searchable = `${course.title} ${course.description}`.toLowerCase();
    const matchesSearch = !deferredSearch || searchable.includes(deferredSearch);
    const matchesTag = tag === "All" || (COURSE_TAGS[course.id] || []).includes(tag);
    const matchesLevel = level === "All" || course.level.includes(level);
    return matchesSearch && matchesTag && matchesLevel;
  }), [deferredSearch, tag, level]);

  function clearFilters() { setSearch(""); setTag("All"); setLevel("All"); }

  return <><Head><title>Explore Courses | CODES</title></Head>
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 px-4 py-9 text-white">
        <div className="mx-auto max-w-7xl"><p className="text-xs font-bold tracking-widest text-blue-300">COURSE CATALOG</p><h1 className="mt-2 text-3xl font-bold">Find the right course</h1><p className="mt-2 text-sm text-slate-300">Search and filter instantly—no page reload.</p></div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label htmlFor="course-search" className="mb-2 block text-sm font-semibold">Search by course title or description</label>
          <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={19}/><input id="course-search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Try ‘web development’..." className="w-full rounded-lg border py-2.5 pl-10 pr-10 outline-none focus:border-blue-600"/>{search && <button onClick={()=>setSearch("")} aria-label="Clear search" className="absolute right-3 top-3"><X size={18}/></button>}</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Filter label="Topic tags" values={TAGS} selected={tag} onSelect={setTag}/>
            <Filter label="Level" values={LEVELS} selected={level} onSelect={setLevel}/>
          </div>
        </div>
        <div className="my-6 flex items-center justify-between gap-3"><p className="text-sm"><strong>{items.length}</strong> course{items.length===1?"":"s"} found</p>{(search||tag!=="All"||level!=="All")&&<button onClick={clearFilters} className="flex items-center gap-1 text-sm font-semibold text-blue-700"><SlidersHorizontal size={16}/>Clear filters</button>}</div>
        {items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((course)=><CourseCard key={course.id} course={course}/>)}</div> : <div className="rounded-xl border border-dashed bg-white p-10 text-center"><h2 className="text-xl font-bold">No matching courses</h2><p className="mt-2 text-sm text-slate-600">Try another search term or clear the filters.</p><button onClick={clearFilters} className="mt-4 rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white">Show all courses</button></div>}
      </section>
    </main></>;
}

function Filter({label,values,selected,onSelect}:{label:string;values:readonly string[];selected:string;onSelect:(value:string)=>void}) {
  return <fieldset><legend className="mb-2 text-sm font-semibold">{label}</legend><div className="flex flex-wrap gap-2">{values.map((value)=><button type="button" key={value} onClick={()=>onSelect(value)} aria-pressed={selected===value} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${selected===value?"border-blue-700 bg-blue-700 text-white":"bg-white hover:border-blue-500"}`}>{value}</button>)}</div></fieldset>;
}
