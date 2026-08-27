import { useEffect, useRef, useState } from "react";
import { ChevronDown, FolderOpen, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authService";

export function AuthenticatedTopNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = user?.displayName?.trim() || "RePath user";
  const email = user?.email?.trim() || "";
  const initial = getUserInitial(displayName, email);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleNavigate(path: string) {
    setOpen(false);
    navigate(path);
  }

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[#fafafa]/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 lg:px-8">
        <div className="min-w-0">
          <button
            onClick={() => navigate("/recoveries")}
            className="shrink-0 text-xl font-normal tracking-tight"
          >
            RePath
          </button>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          <Button
            variant="ghost"
            onClick={() => navigate("/recoveries")}
            className="font-normal"
          >
            Home
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/new")}
            className="font-normal"
          >
            Start Recovery
          </Button>
        </nav>

        <div ref={menuRef} className="relative shrink-0 justify-self-end">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Open account menu for ${displayName}`}
            className="flex h-10 max-w-[12rem] items-center gap-2 rounded-md px-2 text-sm font-normal text-zinc-700 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:border focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-[16rem]"
          >
            <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-white text-xs font-normal text-zinc-700">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="size-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                initial
              )}
            </span>

            <span className="hidden min-w-0 truncate sm:block">
              {displayName}
            </span>

            <ChevronDown className="size-4 shrink-0 text-zinc-400" />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm"
            >
              <div className="border-b border-zinc-200 px-4 py-3">
                <p className="truncate text-sm font-normal text-zinc-900">
                  {displayName}
                </p>
                {email && (
                  <p className="mt-0.5 truncate text-xs font-light text-zinc-500">
                    {email}
                  </p>
                )}
              </div>

              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleNavigate("/recoveries")}
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-sm font-light text-zinc-700 outline-none transition-colors hover:bg-zinc-50 hover:text-zinc-950 focus-visible:bg-zinc-50 focus-visible:text-zinc-950"
                >
                  <FolderOpen className="size-4 text-zinc-400" />
                  Home
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleNavigate("/new")}
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-sm font-light text-zinc-700 outline-none transition-colors hover:bg-zinc-50 hover:text-zinc-950 focus-visible:bg-zinc-50 focus-visible:text-zinc-950"
                >
                  <Plus className="size-4 text-zinc-400" />
                  Start Recovery
                </button>
              </div>

              <div className="border-t border-zinc-200 py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex h-10 w-full items-center gap-3 px-4 text-left text-sm font-light text-red-600 outline-none transition-colors hover:bg-red-50 focus-visible:bg-red-50"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function getUserInitial(displayName: string, email: string) {
  const value = displayName || email;
  return value.trim().charAt(0).toUpperCase() || "R";
}
