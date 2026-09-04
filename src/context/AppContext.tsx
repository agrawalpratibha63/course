import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
export type User = { name: string; email: string; headline: string };
type Progress = Record<string, number[]>;
type Value = { ready:boolean; user:User|null; enrolled:string[]; wishlist:string[]; progress:Progress; login:(n:string,e:string)=>void; logout:()=>void; updateProfile:(u:Partial<User>)=>void; enroll:(id:string)=>void; toggleWishlist:(id:string)=>void; toggleModule:(id:string,i:number)=>void };
const Context = createContext<Value|null>(null);
export function AppProvider({children}:{children:ReactNode}) {
 const [ready,setReady]=useState(false), [user,setUser]=useState<User|null>(null), [enrolled,setEnrolled]=useState<string[]>([]), [wishlist,setWishlist]=useState<string[]>([]), [progress,setProgress]=useState<Progress>({});
 useEffect(()=>{ try { setUser(JSON.parse(localStorage.getItem("ls-user")||"null")); setEnrolled(JSON.parse(localStorage.getItem("ls-enrolled")||"[]")); setWishlist(JSON.parse(localStorage.getItem("ls-wishlist")||"[]")); setProgress(JSON.parse(localStorage.getItem("ls-progress")||"{}")); } finally { setReady(true); } },[]);
 useEffect(()=>{ if(!ready)return; localStorage.setItem("ls-user",JSON.stringify(user)); localStorage.setItem("ls-enrolled",JSON.stringify(enrolled)); localStorage.setItem("ls-wishlist",JSON.stringify(wishlist)); localStorage.setItem("ls-progress",JSON.stringify(progress)); },[ready,user,enrolled,wishlist,progress]);
 const value=useMemo<Value>(()=>({ready,user,enrolled,wishlist,progress,login:(name,email)=>setUser({name:name.trim(),email:email.trim(),headline:"Lifelong learner"}),logout:()=>setUser(null),updateProfile:(u)=>setUser(c=>c?{...c,...u}:c),enroll:(id)=>setEnrolled(a=>a.includes(id)?a:[...a,id]),toggleWishlist:(id)=>setWishlist(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]),toggleModule:(id,i)=>setProgress(all=>{const a=all[id]||[];return {...all,[id]:a.includes(i)?a.filter(x=>x!==i):[...a,i]}})}),[ready,user,enrolled,wishlist,progress]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp(){const v=useContext(Context);if(!v)throw new Error("useApp must be used inside AppProvider");return v;}
