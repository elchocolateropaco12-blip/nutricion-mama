'use client';

import React, { useState } from 'react';
import { PRESET_MEALS, PresetMeal } from '@/lib/preset-meals';

interface MealPickerSheetProps {
  mealType: 'desayuno' | 'comida' | 'merienda' | 'cena';
  onClose: () => void;
  onSelectMeal: (meal: PresetMeal) => void;
  onTakePhoto: () => void;
}

export default function MealPickerSheet({
  mealType,
  onClose,
  onSelectMeal,
  onTakePhoto,
}: MealPickerSheetProps) {
  const [showPortions, setShowPortions] = useState<string | null>(null);
  const options = PRESET_MEALS.filter((m) => m.meal_type === mealType);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            Opciones para {mealType}
          </h2>
          <button onClick={onClose} className="text-slate-400 text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {options.map((meal) => (
            <div
              key={meal.id}
              className="border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <img
                  src={meal.image_url}
                  alt={meal.name}
                  className="w-16 h-16 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm">{meal.name}</h4>
                  <p className="text-xs text-slate-500">
                    {meal.calories} kcal | Prot: {meal.proteins_g}g | Grasas: {meal.fats_g}g
                  </p>
                </div>
                <button
                  onClick={() => onSelectMeal(meal)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Elegir
                </button>
              </div>

              {meal.portion_desc && (
                <div className="text-xs text-slate-600 border-t border-slate-200 pt-2">
                  <button
                    onClick={() =>
                      setShowPortions(showPortions === meal.id ? null : meal.id)
                    }
                    className="text-indigo-600 font-medium underline"
                  >
                    {showPortions === meal.id ? 'Ocultar cantidades' : 'Ver cantidades'}
                  </button>
                  {showPortions === meal.id && (
                    <p className="mt-1 italic">{meal.portion_desc}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onTakePhoto}
          className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl text-center text-sm"
        >
          📷 Hacer foto a otra comida
        </button>
      </div>
    </div>
  );
}
