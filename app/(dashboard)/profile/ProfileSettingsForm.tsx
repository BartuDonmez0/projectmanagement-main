"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSettingsForm({
  initialName,
  initialEmail,
  onClose,
  onUpdated,
}: {
  initialName: string | null;
  initialEmail: string;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const router = useRouter();

  const [name, setName] = useState(initialName || "");
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Profil güncellenemedi");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setSuccess("Profil bilgileri güncellendi.");

    onUpdated?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl"
    >
     <div className="mb-6 flex items-start justify-between gap-4">
  <div>
    <p className="text-sm font-medium text-red-400">
      Hesap Ayarları
    </p>

    <h2 className="mt-1 text-2xl font-bold text-white">
      Profil Bilgilerini Güncelle
    </h2>

    <p className="mt-1 text-sm text-zinc-500">
      İsmini, email adresini veya şifreni değiştirebilirsin.
    </p>
  </div>

  <button
    type="button"
    onClick={onClose}
    className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
  >
    ✕
  </button>
</div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            İsim Soyisim
          </label>
          <input
            className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="İsim soyisim"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Mevcut Şifre
            </label>
            <input
              type="password"
              className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mevcut şifre"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Yeni Şifre
            </label>
            <input
              type="password"
              className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-600"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yeni şifre"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {success}
          </p>
        )}

        <button
          type="submit"
          className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
        >
          Bilgileri Güncelle
        </button>
      </div>
    </form>
  );
}