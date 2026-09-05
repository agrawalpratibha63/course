import Head from "next/head";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Award, BookOpen, Bookmark, Flame, Medal } from "lucide-react";
import CourseCard from "@/Components/CourseCard";
import AuthModal from "@/Components/AuthModal";
import { courses } from "@/Components/data/constant";
import { useApp } from "@/context/AppContext";
export default function Profile() {
  const { ready, user, enrolled, wishlist, progress, streak, updateProfile } =
    useApp();
  const [auth, setAuth] = useState(false),
    [edit, setEdit] = useState(false),
    [name, setName] = useState(user?.name || ""),
    [headline, setHeadline] = useState(user?.headline || "");
  if (!ready) return null;
  if (!user)
    return (
      <main className="grid min-h-[65vh] place-items-center bg-slate-50">
        <div className="max-w-md rounded-2xl border bg-white p-10 text-center">
          <BookOpen className="mx-auto text-blue-700" size={42} />
          <h1 className="mt-4 text-3xl font-black">
            Your learning starts here
          </h1>
          <p className="mt-3 text-slate-600">
            Sign in to enroll, save courses and track progress.
          </p>
          <button
            onClick={() => setAuth(true)}
            className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-bold text-white"
          >
            Create profile
          </button>
          {auth && <AuthModal onClose={() => setAuth(false)} />}
        </div>
      </main>
    );
  function save(e: FormEvent) {
    e.preventDefault();
    updateProfile({ name, headline });
    setEdit(false);
  }
  const joined = courses.filter((c) => enrolled.includes(c.id)),
    saved = courses.filter((c) => wishlist.includes(c.id));
  return (
    <>
      <Head>
        <title>My Learning | CODES</title>
      </Head>
      <main className="min-h-screen bg-slate-50">
        <section className="bg-blue-800 py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-3xl font-black text-blue-800">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black">{user.name}</h1>
              <p className="text-blue-100">
                {user.headline} · {user.email}
              </p>
            </div>
            <button
              onClick={() => {
                setName(user.name);
                setHeadline(user.headline);
                setEdit(!edit);
              }}
              className="ml-auto rounded-lg border border-white px-4 py-2 font-bold"
            >
              Edit profile
            </button>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10">
          {edit && (
            <form
              onSubmit={save}
              className="mb-8 grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border px-4 py-3"
                required
              />
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="rounded-lg border px-4 py-3"
                required
              />
              <button className="rounded-lg bg-blue-700 px-5 font-bold text-white">
                Save
              </button>
            </form>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={<BookOpen />}
              value={joined.length}
              label="Enrolled courses"
            />
            <Stat
              icon={<Bookmark />}
              value={saved.length}
              label="Saved courses"
            />
            <Stat
              icon={<Award />}
              value={
                joined.filter(
                  (c) => (progress[c.id] || []).length === c.modules.length,
                ).length
              }
              label="Certificates earned"
            />
            <Stat
              icon={<Flame />}
              value={streak.current}
              label="Day learning streak"
            />
          </div>
          <section className="mt-8 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-orange-500 text-white">
                <Flame size={30} />
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-black">
                  {streak.current} day streak
                </h2>
                <p className="text-sm text-slate-600">
                  Learn or interact with a course every day to keep your streak
                  alive. Longest streak: {streak.longest} days.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <StreakBadge
                days={3}
                current={streak.longest}
                label="3-Day Starter"
              />
              <StreakBadge
                days={7}
                current={streak.longest}
                label="7-Day Streak"
              />
              <StreakBadge
                days={30}
                current={streak.longest}
                label="30-Day Champion"
              />
            </div>
          </section>
          <h2 className="mt-12 text-2xl font-black">My courses</h2>
          {joined.length ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {joined.map((c) => (
                <div key={c.id}>
                  <CourseCard course={c} />
                  <div className="mt-2 h-2 rounded bg-slate-200">
                    <div
                      className="h-full rounded bg-emerald-500"
                      style={{
                        width: `${Math.round(((progress[c.id] || []).length / c.modules.length) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="You have not enrolled in a course yet." />
          )}
          <div className="mt-12 flex items-center justify-between">
            <h2 className="text-2xl font-black">Certificates</h2>
            <Link href="/certificate" className="font-bold text-blue-700">
              View certificates →
            </Link>
          </div>
          {saved.length > 0 && (
            <>
              <h2 className="mt-12 text-2xl font-black">Saved for later</h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-white p-5 text-blue-700">
      {icon}
      <div>
        <b className="text-2xl text-slate-900">{value}</b>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed bg-white p-10 text-center text-slate-600">
      {text}{" "}
      <Link href="/catalog" className="font-bold text-blue-700">
        Explore courses
      </Link>
    </div>
  );
}

function StreakBadge({
  days,
  current,
  label,
}: {
  days: number;
  current: number;
  label: string;
}) {
  const unlocked = current >= days;
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${unlocked ? "border-amber-300 bg-white text-amber-700" : "border-slate-200 bg-white/60 text-slate-400"}`}
    >
      <Medal size={17} />
      {label}
      {unlocked ? " ✓" : ` · ${days - current} days to go`}
    </div>
  );
}
