"use client";

import { useState } from "react";
import ProfileSettingsForm from "./ProfileSettingsForm";

export default function ProfileSettingsWrapper({
  name,
  email,
  onUpdated,
}: {
  name: string | null;
  email: string;
  onUpdated?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        ⚙️
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
           <ProfileSettingsForm
            initialName={name}
            initialEmail={email}
            onClose={() => setOpen(false)}
            onUpdated={onUpdated}
          />
          </div>
        </div>
      )}
    </>
  );
}