"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Entrar() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function entrar() {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No he podido entrar. Inténtalo otra vez.");
        setPin("");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Sin conexión. Comprueba el wifi o los datos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[26rem] flex-col justify-center px-6 py-10">
      <h1 className="text-[1.75rem] font-bold leading-tight">La comida de mamá</h1>
      <p className="mt-3 text-[1.0625rem] text-tinta-suave">
        Escribe el código una vez. El teléfono lo recuerda y ya no vuelve a pedirlo.
      </p>

      <label htmlFor="pin" className="eyebrow mt-8 block">
        Código
      </label>
      <input
        id="pin"
        type="password"
        inputMode="numeric"
        autoComplete="current-password"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && pin && !enviando) void entrar();
        }}
        className="mt-2 min-h-[80px] w-full rounded-[var(--radio)] border-2 border-borde bg-white px-5 text-center text-[2rem] font-bold tracking-[0.3em] text-tinta"
      />

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-2xl bg-ambar-claro px-4 py-3 text-[1.0625rem] font-bold text-ambar"
        >
          {error}
        </p>
      )}

      <button
        onClick={() => void entrar()}
        disabled={!pin || enviando}
        className="btn-principal mt-6 disabled:opacity-50"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </main>
  );
}
