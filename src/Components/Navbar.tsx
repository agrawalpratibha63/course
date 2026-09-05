import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { BookOpen, Menu, Search, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const router = useRouter(); const { user, logout } = useApp();
  const [auth, setAuth] = useState(false); const [mobile, setMobile] = useState(false); const [query, setQuery] = useState("");
  function search(event: FormEvent) { event.preventDefault(); router.push(`/catalog?q=${encodeURIComponent(query)}`); }
  return <><header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
      <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-black tracking-wide text-blue-700"><span className="grid h-8 w-8 place-items-center rounded-md bg-blue-700 text-white"><BookOpen size={17}/></span>CODES</Link>
      <Link href="/catalog" className="hidden rounded-md bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 md:block">Explore</Link>
      <form onSubmit={search} className="desktop-search min-w-0 max-w-lg flex-1"><input aria-label="Search courses" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search courses" className="min-w-0 w-full rounded-l-md border border-r-0 px-3 py-2 text-sm"/><button className="rounded-r-md bg-blue-700 px-3 text-white" aria-label="Search"><Search size={17}/></button></form>
      <nav className="desktop-nav ml-auto items-center gap-3"><Link href="/catalog" className="text-xs font-semibold">Courses</Link>{user?<><Link href="/profile" className="rounded-md border px-3 py-2 text-xs font-semibold">{user.name.split(" ")[0]}</Link><button onClick={logout} className="text-xs font-semibold text-slate-600">Log out</button></>:<button onClick={()=>setAuth(true)} className="rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white">Join free</button>}</nav>
      <button onClick={()=>setMobile(!mobile)} className="mobile-trigger ml-auto" aria-label="Toggle navigation">{mobile?<X size={21}/>:<Menu size={21}/>}</button>
    </div>
    {mobile?<div className="space-y-3 border-t p-4 text-sm md:hidden"><Link onClick={()=>setMobile(false)} href="/catalog" className="block font-semibold">Explore courses</Link><Link onClick={()=>setMobile(false)} href="/profile" className="block font-semibold">My learning</Link>{user?<button onClick={()=>{logout();setMobile(false)}} className="font-semibold">Log out</button>:<button onClick={()=>{setMobile(false);setAuth(true)}} className="w-full rounded-md bg-blue-700 py-2 font-bold text-white">Join free</button>}</div>:null}
  </header>{auth?<AuthModal onClose={()=>setAuth(false)}/>:null}</>;
}
