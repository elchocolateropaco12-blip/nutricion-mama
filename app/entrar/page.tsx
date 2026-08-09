'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EntrarPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'PIN incorrecto');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Acceso a la App</h1>
        <p className="text-sm text-slate-500">Introduce el PIN de acceso</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full text-center text-2xl tracking-widest py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 transition"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
