import { useState } from "react";
import { motion } from "motion/react";
import { FileCheck2, SearchCheck, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/services/authService";

export function LandingPage() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  async function handleGoogleLogin() {
    try {
      setLoginError("");
      const signedInUser = await signInWithGoogle();
      const token = await signedInUser.getIdToken();

      if (!token.trim()) {
        throw new Error("Firebase did not return an ID token.");
      }

      navigate("/recoveries", { replace: true });
    } catch (error) {
      console.error("Google login failed", error);
      setLoginError("We couldn't complete Google sign-in. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[#fafafa]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <button onClick={() => navigate("/")} className="text-xl font-normal tracking-tight">
            RePath
          </button>
        </div>
      </nav>

      <section className="mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <p className="mb-6 text-sm font-normal text-zinc-500">For rejected, incomplete, or stuck applications</p>
          <h1 className="max-w-full whitespace-nowrap text-[1.72rem] font-light sm:text-5xl lg:text-6xl">
            Get your application back on track.
          </h1>
          <p className="mt-7 max-w-xl text-base font-light leading-7 text-zinc-500 sm:text-lg">
            RePath tells you exactly why your application was rejected or stuck, what documents to fix, and walks you through resubmitting it.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={handleGoogleLogin}
              className="h-11 rounded-lg px-6 font-normal"
            >
              <img
                src="/googleicon.svg"
                alt=""
                aria-hidden="true"
                className="size-4"
              />
              Continue with Google
            </Button>
          </div>

          {loginError && (
            <p className="mt-4 text-sm font-light text-red-600">
              {loginError}
            </p>
          )}

          <div className="mt-16 flex flex-col items-center gap-3 text-xs font-light text-zinc-500 sm:flex-row sm:gap-4">
            <WorkflowStep
              icon={SearchCheck}
              label="See what went wrong"
            />
            <div className="hidden h-px w-10 bg-zinc-200 sm:block" />
            <WorkflowStep
              icon={FileCheck2}
              label="Fix your documents"
            />
            <div className="hidden h-px w-10 bg-zinc-200 sm:block" />
            <WorkflowStep
              icon={Send}
              label="Resubmit with confidence"
            />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

type WorkflowStepProps = {
  icon: typeof SearchCheck;
  label: string;
};

function WorkflowStep({ icon: Icon, label }: WorkflowStepProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        className="size-4 text-zinc-400"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
