import {
  createContext,
  ReactNode,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
export type User = { name: string; email: string; headline: string };
type Progress = Record<string, number[]>;
export type LearningStreak = {
  current: number;
  longest: number;
  lastActive: string | null;
};

const EMPTY_STREAK: LearningStreak = {
  current: 0,
  longest: 0,
  lastActive: null,
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(from: string, to: string) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000,
  );
}
type Value = {
  ready: boolean;
  user: User | null;
  enrolled: string[];
  wishlist: string[];
  progress: Progress;
  streak: LearningStreak;
  login: (n: string, e: string) => void;
  logout: () => void;
  updateProfile: (u: Partial<User>) => void;
  enroll: (id: string) => void;
  toggleWishlist: (id: string) => void;
  toggleModule: (id: string, i: number) => void;
  recordActivity: () => void;
};
const Context = createContext<Value | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false),
    [user, setUser] = useState<User | null>(null),
    [enrolled, setEnrolled] = useState<string[]>([]),
    [wishlist, setWishlist] = useState<string[]>([]),
    [progress, setProgress] = useState<Progress>({}),
    [streak, setStreak] = useState<LearningStreak>(EMPTY_STREAK);

  const recordActivity = useCallback(() => {
    const today = localDateKey();
    setStreak((current) => {
      if (current.lastActive === today) return current;
      const gap = current.lastActive
        ? daysBetween(current.lastActive, today)
        : null;
      const nextCount = gap === 1 ? current.current + 1 : 1;
      return {
        current: nextCount,
        longest: Math.max(current.longest, nextCount),
        lastActive: today,
      };
    });
  }, []);
  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("ls-user") || "null"));
      setEnrolled(JSON.parse(localStorage.getItem("ls-enrolled") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("ls-wishlist") || "[]"));
      setProgress(JSON.parse(localStorage.getItem("ls-progress") || "{}"));
      const savedStreak: LearningStreak = JSON.parse(
        localStorage.getItem("codes-learning-streak-v1") ||
          JSON.stringify(EMPTY_STREAK),
      );
      const missedDays = savedStreak.lastActive
        ? daysBetween(savedStreak.lastActive, localDateKey())
        : 0;
      setStreak(missedDays > 1 ? { ...savedStreak, current: 0 } : savedStreak);
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, (account) => {
      setUser(
        account
          ? {
              name: account.displayName || "Learner",
              email: account.email || "",
              headline: "Lifelong learner",
            }
          : null,
      );
    });
  }, []);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("ls-user", JSON.stringify(user));
    localStorage.setItem("ls-enrolled", JSON.stringify(enrolled));
    localStorage.setItem("ls-wishlist", JSON.stringify(wishlist));
    localStorage.setItem("ls-progress", JSON.stringify(progress));
    localStorage.setItem("codes-learning-streak-v1", JSON.stringify(streak));
  }, [ready, user, enrolled, wishlist, progress, streak]);
  const value = useMemo<Value>(
    () => ({
      ready,
      user,
      enrolled,
      wishlist,
      progress,
      streak,
      login: (name, email) => {
        setUser({
          name: name.trim(),
          email: email.trim(),
          headline: "Lifelong learner",
        });
        recordActivity();
      },
      logout: () => {
        if (firebaseAuth) void signOut(firebaseAuth);
        setUser(null);
      },
      updateProfile: (u) => setUser((c) => (c ? { ...c, ...u } : c)),
      enroll: (id) => {
        setEnrolled((a) => (a.includes(id) ? a : [...a, id]));
        recordActivity();
      },
      toggleWishlist: (id) =>
        setWishlist((a) =>
          a.includes(id) ? a.filter((x) => x !== id) : [...a, id],
        ),
      toggleModule: (id, i) => {
        setProgress((all) => {
          const a = all[id] || [];
          return {
            ...all,
            [id]: a.includes(i) ? a.filter((x) => x !== i) : [...a, i],
          };
        });
        recordActivity();
      },
      recordActivity,
    }),
    [ready, user, enrolled, wishlist, progress, streak, recordActivity],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() {
  const v = useContext(Context);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
