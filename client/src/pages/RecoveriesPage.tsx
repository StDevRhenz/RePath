import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getMyCases, type RecoveryCase } from "@/services/caseApi";
import { getCaseStatusLabel } from "@/lib/statusLabels";
import { AuthenticatedTopNav } from "@/components/navigation/AuthenticatedTopNav";

type RecoveriesRequestStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export function RecoveriesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [recoveries, setRecoveries] = useState<RecoveryCase[]>([]);
  const [requestStatus, setRequestStatus] =
    useState<RecoveriesRequestStatus>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    let ignore = false;

    setRequestStatus("loading");
    setError("");

    getMyCases()
      .then((response) => {
        if (ignore) {
          return;
        }

        setRecoveries(response.cases);
        setRequestStatus("success");
      })
      .catch(() => {
        if (ignore) {
          return;
        }

        setError("We couldn't load your recoveries. Please try again.");
        setRequestStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [authLoading, navigate, user]);

  if (authLoading || requestStatus === "idle") return <LoadingState />;
  if (!user) return null;

  const loading = requestStatus === "loading";
  const hasError = requestStatus === "error";
  const hasLoaded = requestStatus === "success";

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-950">
      <AuthenticatedTopNav />

      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-normal text-zinc-500">Home</p>
          <h1 className="mt-3 text-4xl font-light tracking-[-0.035em] sm:text-5xl">Pick up where you left off</h1>
          <p className="mt-4 max-w-xl font-light leading-7 text-zinc-500">Open an application you’re working on or start a new one.</p>
        </motion.div>

        {loading && <p className="mt-12 text-sm font-light text-zinc-500">Loading recoveries...</p>}
        {hasError && <p className="mt-12 text-sm font-light text-red-600">{error}</p>}

        {hasLoaded && recoveries.length === 0 && (
          <div className="mt-12 border-t border-zinc-200 py-12">
            <h2 className="text-2xl font-light">No recoveries yet.</h2>
            <p className="mt-3 font-light text-zinc-500">Start one when you're ready.</p>
            <Button onClick={() => navigate("/new")} className="mt-6 font-normal">
              Start a recovery
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {hasLoaded && recoveries.length > 0 && (
          <div className="mt-12 divide-y divide-zinc-200 border-y border-zinc-200">
            {recoveries.map((recovery) => (
              <button key={recovery.case_id} onClick={() => navigate(`/cases/${recovery.case_id}`)} aria-label={`Open recovery: ${recovery.title}`} className="group flex min-h-16 w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:bg-white">
                <span className="min-w-0">
                  <span className="block truncate text-lg font-normal">{recovery.title}</span>
                  <span className="mt-2 block text-sm font-light text-zinc-500">{getCaseStatusLabel(recovery.status)}</span>
                  {recovery.updated_at && (
                    <span className="mt-1 block text-xs font-light text-zinc-400">
                      Updated {formatDate(recovery.updated_at)}
                    </span>
                  )}
                </span>
                <ArrowRight className="size-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function LoadingState() {
  return <main className="flex min-h-screen items-center justify-center bg-[#fafafa]"><p className="text-sm font-light text-zinc-500">Loading recoveries...</p></main>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "recently"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
