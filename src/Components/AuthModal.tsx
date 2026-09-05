import { useState } from "react";
import { Chrome, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useApp } from "@/context/AppContext";
import { firebaseAuth, firebaseConfigured } from "@/lib/firebase";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function googleLogin() {
    if (!firebaseAuth) {
      setError("Google sign-in is awaiting Firebase configuration.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(
        firebaseAuth,
        new GoogleAuthProvider(),
      );
      login(result.user.displayName || "Learner", result.user.email || "");
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google sign-in failed.";
      setError(
        message.includes("popup-closed")
          ? "Google sign-in was cancelled."
          : message,
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 hover:bg-slate-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
          Welcome to CODES
        </p>
        <h2 id="auth-title" className="mt-2 text-3xl font-bold">
          Sign in to continue
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Use your Google account for secure authentication, course progress and
          email reminders.
        </p>
        <button
          disabled={loading || !firebaseConfigured}
          onClick={googleLogin}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 px-5 py-3 font-bold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="animate-spin" /> : <Chrome />}
          {loading ? "Signing in…" : "Continue with Google"}
        </button>
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
          <ShieldCheck className="mt-0.5 shrink-0" size={15} />
          Authentication is handled by Firebase. CODES never receives your
          Google password.
        </p>
        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {!firebaseConfigured ? (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs font-semibold text-amber-800">
            Firebase environment variables must be added on Vercel before
            sign-in can be used.
          </p>
        ) : null}
      </div>
    </div>
  );
}
