import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { deleteAccountData } from "@/services/accountApi";
import { deleteCurrentFirebaseUser, logout } from "@/services/authService";

export function AuthenticatedTopNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const cancelLogoutButtonRef = useRef<HTMLButtonElement>(null);
  const cancelDeleteButtonRef = useRef<HTMLButtonElement>(null);
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

  async function handleConfirmLogout() {
    setConfirmingLogout(false);
    setOpen(false);
    await logout();
    navigate("/", { replace: true });
  }

  function handleOpenLogoutDialog() {
    setOpen(false);
    setConfirmingLogout(true);
  }

  const handleCancelLogout = useCallback(() => {
    setConfirmingLogout(false);
    accountButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!confirmingLogout) {
      return;
    }

    cancelLogoutButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCancelLogout();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirmingLogout, handleCancelLogout]);

  function handleOpenDeleteDialog() {
    setOpen(false);
    setDeleteError("");
    setConfirmingDelete(true);
  }

  const handleCancelDelete = useCallback(() => {
    if (deletingAccount) {
      return;
    }

    setConfirmingDelete(false);
    accountButtonRef.current?.focus();
  }, [deletingAccount]);

  useEffect(() => {
    if (!confirmingDelete) {
      return;
    }

    cancelDeleteButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCancelDelete();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirmingDelete, handleCancelDelete]);

  async function handleDeleteAccount() {
    if (!user) {
      setDeleteError("We couldn't delete your account. Please try again.");
      return;
    }

    try {
      setDeletingAccount(true);
      setDeleteError("");

      await deleteAccountData();
    } catch (error) {
      console.error("Account data deletion failed", error);
      setDeleteError("We couldn't delete your account. Please try again.");
      setDeletingAccount(false);
      return;
    }

    try {
      await deleteCurrentFirebaseUser(user);

      setConfirmingDelete(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Firebase account deletion failed", error);
      setDeleteError("Your RePath data was deleted, but we couldn't delete your Firebase account. Please try again.");
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <>
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
              ref={accountButtonRef}
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
                    onClick={handleOpenDeleteDialog}
                    className="flex h-10 w-full items-center gap-3 px-4 text-left text-sm font-normal text-red-700 outline-none transition-colors hover:bg-red-50 hover:text-red-800 focus-visible:bg-red-50 focus-visible:text-red-800"
                  >
                    <Trash2 className="size-4" />
                    Delete Account
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleOpenLogoutDialog}
                    className="flex h-10 w-full items-center gap-3 px-4 text-left text-sm font-light text-zinc-700 outline-none transition-colors hover:bg-zinc-50 hover:text-zinc-950 focus-visible:bg-zinc-50 focus-visible:text-zinc-950"
                  >
                    <LogOut className="size-4 text-zinc-400" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {confirmingLogout && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCancelLogout();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-out-title"
            aria-describedby="sign-out-description"
            className="w-full max-w-sm rounded-md bg-white p-5 shadow-lg"
          >
            <h2
              id="sign-out-title"
              className="text-lg font-normal text-zinc-950"
            >
              Sign out?
            </h2>
            <p
              id="sign-out-description"
              className="mt-3 text-sm font-light leading-6 text-zinc-600"
            >
              Are you sure you want to sign out of RePath?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                ref={cancelLogoutButtonRef}
                type="button"
                variant="outline"
                onClick={handleCancelLogout}
                className="font-normal"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleConfirmLogout}
                className="font-normal"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCancelDelete();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            className="w-full max-w-sm rounded-md bg-white p-5 shadow-lg"
          >
            <h2
              id="delete-account-title"
              className="text-lg font-normal text-zinc-950"
            >
              Delete your account?
            </h2>
            <p
              id="delete-account-description"
              className="mt-3 text-sm font-light leading-6 text-zinc-600"
            >
              This will permanently delete your RePath account and all recovery data linked to it. This action cannot be undone.
            </p>

            {deleteError && (
              <p className="mt-4 text-sm font-light text-red-600">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                ref={cancelDeleteButtonRef}
                type="button"
                variant="outline"
                onClick={handleCancelDelete}
                disabled={deletingAccount}
                className="font-normal"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="bg-red-700 font-normal text-white hover:bg-red-800"
              >
                {deletingAccount ? "Deleting..." : "Delete account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getUserInitial(displayName: string, email: string) {
  const value = displayName || email;
  return value.trim().charAt(0).toUpperCase() || "R";
}
