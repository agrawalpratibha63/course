import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCircle2, LoaderCircle } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase";

type SavedReminder = {
  id: string;
  scheduledAt: string;
  email: string;
  courseTitle: string;
};
const keyFor = (courseId: string) => `codes-reminder-${courseId}`;

export default function CourseReminder({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const [saved, setSaved] = useState<SavedReminder | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem(keyFor(courseId)) || "null"));
    } catch {
      setSaved(null);
    }
  }, [courseId]);

  useEffect(() => {
    if (
      !saved ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    )
      return;
    const remaining = new Date(saved.scheduledAt).getTime() - Date.now();
    if (remaining <= 0 || remaining > 2147483647) return;
    const timer = window.setTimeout(
      () =>
        new Notification("Time to continue learning", {
          body: `${courseTitle} is waiting for you.`,
          icon: "/favicon.ico",
        }),
      remaining,
    );
    return () => window.clearTimeout(timer);
  }, [saved, courseTitle]);

  async function request(
    action: "schedule" | "cancel",
    delay?: "hour" | "tomorrow",
  ) {
    if (!firebaseAuth?.currentUser) {
      setMessage("Please sign in with Google first.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      if (
        action === "schedule" &&
        "Notification" in window &&
        Notification.permission === "default"
      )
        await Notification.requestPermission();
      const token = await firebaseAuth.currentUser.getIdToken();
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          action === "cancel"
            ? { action, reminderId: saved?.id }
            : { action, courseId, delay },
        ),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Reminder request failed.");
      if (action === "cancel") {
        localStorage.removeItem(keyFor(courseId));
        setSaved(null);
        setMessage("Reminder cancelled.");
      } else {
        const next = { ...data, courseTitle } as SavedReminder;
        localStorage.setItem(keyFor(courseId), JSON.stringify(next));
        setSaved(next);
        setMessage(
          `Email reminder scheduled for ${new Date(next.scheduledAt).toLocaleString()}.`,
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update reminder.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex items-center gap-2 font-bold text-blue-900">
        <Bell size={18} />
        Course reminder
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        A real reminder email will be sent to your signed-in Google account.
        Browser alert is also enabled when permitted.
      </p>
      {saved ? (
        <div className="mt-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={16} />
            Scheduled: {new Date(saved.scheduledAt).toLocaleString()}
          </p>
          <button
            disabled={loading}
            onClick={() => request("cancel")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2 text-sm font-bold"
          >
            <BellOff size={16} />
            No reminders
          </button>
        </div>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <button
            disabled={loading}
            onClick={() => request("schedule", "hour")}
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white"
          >
            Remind me in 1 hour
          </button>
          <button
            disabled={loading}
            onClick={() => request("schedule", "tomorrow")}
            className="rounded-lg border border-blue-700 bg-white px-3 py-2 text-sm font-bold text-blue-700"
          >
            Remind me tomorrow
          </button>
        </div>
      )}
      {loading ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-600">
          <LoaderCircle className="animate-spin" size={14} />
          Updating reminder…
        </p>
      ) : null}
      {message ? (
        <p className="mt-2 text-xs font-semibold text-slate-700">{message}</p>
      ) : null}
    </section>
  );
}
