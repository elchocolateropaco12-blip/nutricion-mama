'use client';

import React from 'react';

interface MealSlotCardProps {
  title: string;
  time: string;
  mealType: string;
  entry?: {
    dish_name: string;
    calories: number;
    proteins_g: number;
    fats_g: number;
    image_url?: string;
  } | null;
  onSelect: () => void;
  onRemove?: () => void;
}

export default function MealSlotCard({
  title,
  time,
  entry,
  onSelect,
  onRemove,
}: MealSlotCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <span className="text-xs text-slate-500">{time}</span>
        </div>
        {entry && onRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-lg font-medium"
          >
            Cambiar
          </button>
        )}
      </div>

      {entry ? (
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
          {entry.image_url && (
            <img
              src={entry.image_url}
              alt={entry.dish_name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div>
            <p className="font-semibold text-slate-800 text-sm">{entry.dish_name}</p>
            <p className="text-xs text-slate-600 mt-1">
              {entry.calories} kcal | P: {entry.proteins_g}g | G: {entry.fats_g}g
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={onSelect}
          className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-semibold text-sm bg-indigo-50/50 hover:bg-indigo-50 transition"
        >
          + Registra tu {title.toLowerCase()}
        </button>
      )}
    </div>
  );
}
