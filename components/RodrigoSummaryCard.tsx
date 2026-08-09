'use client';

import React from 'react';

interface RodrigoSummaryCardProps {
  score?: number;
  totals?: {
    calories: number;
    proteins_g: number;
    fats_g: number;
    fiber_g: number;
  };
  feedback?: string;
  loading?: boolean;
}

export default function RodrigoSummaryCard({
  score,
  totals,
  feedback,
  loading,
}: RodrigoSummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center text-indigo-700 animate-pulse">
        Rodrigo está analizando tus comidas de hoy...
      </div>
    );
  }

  if (!feedback) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-center border-b border-indigo-700/50 pb-4">
        <div>
          <h3 className="text-lg font-bold">Resumen de Rodrigo</h3>
          <p className="text-xs text-indigo-300">Valoración nutricional del día</p>
        </div>
        {score !== undefined && (
          <div className="bg-indigo-500/30 border border-indigo-400/30 rounded-2xl px-4 py-2 text-center">
            <span className="text-2xl font-black text-indigo-200">{score}</span>
            <span className="text-xs text-indigo-300">/10</span>
          </div>
        )}
      </div>

      {totals && (
        <div className="grid grid-cols-4 gap-2 text-center bg-indigo-950/50 p-3 rounded-2xl text-xs">
          <div>
            <p className="text-indigo-300">Calorías</p>
            <p className="font-bold text-sm">{totals.calories}</p>
          </div>
          <div>
            <p className="text-indigo-300">Proteína</p>
            <p className="font-bold text-sm">{totals.proteins_g}g</p>
          </div>
          <div>
            <p className="text-indigo-300">Grasas</p>
            <p className="font-bold text-sm">{totals.fats_g}g</p>
          </div>
          <div>
            <p className="text-indigo-300">Fibra</p>
            <p className="font-bold text-sm">{totals.fiber_g}g</p>
          </div>
        </div>
      )}

      <p className="text-sm text-indigo-100 leading-relaxed italic">
        "{feedback}"
      </p>
    </div>
  );
}
