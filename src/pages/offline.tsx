import Head from "next/head";
import { BookOpen, CheckCircle2, Trash2, WifiOff } from "lucide-react";
import { courses as courseCatalog } from "@/Components/data/constant";
import OfflineCourseButton from "@/Components/OfflineCourseButton";
import {
  removeOfflineCourse,
  useOfflineCourses,
  type OfflineCourse,
} from "@/lib/offline";

export default function OfflineLibrary() {
  const downloaded = useOfflineCourses();
  const available = courseCatalog.filter(
    (course) => !downloaded.some((saved) => saved.id === course.id),
  );

  return (
    <>
      <Head>
        <title>Offline Library | CODES</title>
      </Head>
      <main className="min-h-screen bg-slate-50">
        <section className="bg-slate-950 px-4 py-9 text-white">
          <div className="mx-auto max-w-6xl">
            <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-blue-300">
              <WifiOff size={16} />
              OFFLINE MODE
            </p>
            <h1 className="mt-2 text-3xl font-bold">Your offline library</h1>
            <p className="mt-2 text-sm text-slate-300">
              Download course text, images and outlines here. Videos always
              require internet.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Downloaded courses</h2>
              <p className="mt-1 text-sm text-slate-600">
                These courses remain readable without an internet connection.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
              {downloaded.length} saved
            </span>
          </div>
          {downloaded.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {downloaded.map((course) => (
                <DownloadedCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-white p-8 text-center">
              <WifiOff className="mx-auto text-slate-400" size={38} />
              <h3 className="mt-3 text-lg font-bold">No downloads yet</h3>
              <p className="mt-1 text-sm text-slate-600">
                Choose any course below and tap “Download for offline”.
              </p>
            </div>
          )}

          <h2 className="mt-12 text-2xl font-black">
            Courses available to download
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Select a course to save its non-video learning material.
          </p>
          {available.length ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {available.map((course) => (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                >
                  <img
                    src={course.image}
                    alt=""
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-xs font-bold text-blue-700">
                      {course.provider}
                    </p>
                    <h3 className="mt-1 min-h-12 font-bold">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {course.description}
                    </p>
                    <OfflineCourseButton course={course} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-emerald-50 p-6 text-center font-bold text-emerald-700">
              <CheckCircle2 className="mx-auto mb-2" />
              All courses are available offline.
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function DownloadedCard({ course }: { course: OfflineCourse }) {
  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {course.image ? (
        <img src={course.image} alt="" className="h-40 w-full object-cover" />
      ) : (
        <div className="grid h-32 place-items-center bg-blue-50">
          <BookOpen className="text-blue-700" size={36} />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
          <CheckCircle2 size={15} />
          Available Offline
        </div>
        <h2 className="mt-2 text-xl font-bold">{course.title}</h2>
        <p className="mt-1 text-xs font-semibold text-blue-700">
          {course.provider} · {course.type}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {course.description}
        </p>
        <h3 className="mt-5 font-bold">Course outline</h3>
        <div className="mt-2 space-y-2">
          {course.modules.map((module, index) => (
            <details key={module.title} className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-semibold">
                {index + 1}. {module.title}
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                {module.description}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {module.hours} hours · {module.quizzes} quizzes ·{" "}
                {module.projects} projects
              </p>
            </details>
          ))}
        </div>
        <button
          onClick={() => removeOfflineCourse(course.id)}
          className="mt-5 flex items-center gap-2 text-sm font-semibold text-red-600"
        >
          <Trash2 size={16} />
          Remove download
        </button>
      </div>
    </article>
  );
}
