import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NewRecoveryPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");

  function handleContinue() {
    const trimmedDescription = description.trim();

    if (!trimmedDescription) {
      return;
    }

    console.log("Recovery description:", trimmedDescription);

    // Next step:
    // Send this to our RePath Agent API.
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-950">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-normal tracking-tight"
        >
          RePath
        </button>

        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="font-normal"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </nav>

      {/* Content */}
      <section className="mx-auto flex min-h-[75vh] max-w-2xl items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="w-full"
        >
          <p className="text-sm font-normal text-zinc-500">
            New recovery
          </p>

          <h1 className="mt-4 text-4xl font-light tracking-[-0.035em] sm:text-5xl">
            What happened?
          </h1>

          <p className="mt-5 max-w-lg font-light leading-7 text-zinc-500">
            Tell RePath what happened to your application. You can paste the
            rejection notice or briefly explain the problem.
          </p>

          <div className="mt-10">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-normal text-zinc-700"
            >
              Application issue
            </label>

            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="My scholarship application was rejected because..."
              className="min-h-40 resize-none bg-white font-light leading-6"
            />

            <div className="mt-5 flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={!description.trim()}
                className="h-11 px-5 font-normal"
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}