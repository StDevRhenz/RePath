import { motion } from "motion/react";
import { ArrowRight, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { signInWithGoogle, logout } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  console.log("Auth loading:", loading);
  console.log("Current user:", user?.email);

  async function handleGoogleLogin() {
    try {
      const user = await signInWithGoogle();

      console.log("Logged in:", user.email);
      console.log("UID:", user.uid);
    } catch (error) {
      console.error("Google login failed:", error);
    }
  }

  async function handleLogout() {
    await logout();
    console.log("Logged out");
  }

  async function testAuth() {
    if (!user) {
      console.log("No logged-in user");
      return;
    }

    const token = await user.getIdToken();

    const response = await fetch("http://127.0.0.1:8000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Auth test:", await response.json());
  }



  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-950">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/" className="text-xl font-normal tracking-tight">
          RePath
        </a>

        <Button variant="ghost" className="font-normal">
          About
        </Button>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          className="flex flex-col items-center"
        >
          <p className="mb-6 text-sm font-normal text-zinc-500">
            Recover. Resolve. Resume.
          </p>

          <h1 className="max-w-4xl text-5xl font-light tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Recover what got stuck.
          </h1>

          <p className="mt-7 max-w-xl text-base font-light leading-7 text-zinc-500 sm:text-lg">
            RePath understands why an application failed, identifies what needs
            attention, and builds a clear path toward resubmission.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate("/new")}
              className="h-11 rounded-lg px-6 font-normal"
            >
              Start a recovery
              <ArrowRight className="ml-1 size-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/resume")}
              className="h-11 rounded-lg bg-transparent px-6 font-normal"
            >
              Resume a case
            </Button>
          </div>

          {/* RePath visual motif */}
          <div className="mt-16 flex items-center gap-3 text-zinc-400">
            <div className="h-px w-16 bg-zinc-200" />

            <div className="flex size-8 items-center justify-center rounded-full border border-zinc-200 bg-white">
              <Route className="size-3.5" strokeWidth={1.5} />
            </div>

            <div className="h-px w-16 bg-zinc-200" />
          </div>

          <p className="mt-4 text-xs font-light tracking-wide text-zinc-400">
            From interruption to resolution
          </p>
        </motion.div>
      </section>

      <button onClick={handleGoogleLogin}>
        Continue with Google
      </button>

      <button onClick={handleLogout}>
        Logout
      </button>

      <button onClick={testAuth}>
        Test Backend Auth
      </button>
    </main>
  );
}