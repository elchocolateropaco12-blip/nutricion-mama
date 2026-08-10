'use client';

import React, { useState } from 'react';

interface MealSlotCardProps {
  title: string;
  time: string;
  mealType: string;
  entry?: any;
  onSelect: () => void;
  onRemove: () => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=80';

export default function MealSlotCard({
  title,
  time,
  entry,
  onSelect,
  onRemove,
}: MealSlotCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(entry?.image_url || FALLBACK_IMAGE);

  React.useEffect(() => {
    if (entry?.image_url) {
      setImgSrc(entry.image_url);
    }
  }, [entry?.image_url]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-400">{time}</p>
        </div>
        {entry ? (
          <button
            onClick={onRemove}
            className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium"
          >
            Cambiar
          </button>
        ) : (
          <button
            onClick={onSelect}
            className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-bold"
          >
            + Registrar tu {title.toLowerCase()}
          </button>
        )}
      </div>

      {entry && (
        <div className="flex items-center space-x-3 pt-2 border-t border-slate-50">
          <img
            src={imgSrc}
            alt={entry.dish_name}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-16 h-16 rounded-xl object-cover bg-slate-100"
          />
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">{entry.dish_name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {entry.calories} kcal | P: {entry.proteins_g}g | G: {entry.fats_g}g
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
