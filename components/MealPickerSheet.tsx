'use client';

import React from 'react';
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
  const options = PRESET_MEALS.filter(
    (m) => m.mealType === mealType || m.meal_type === mealType
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-800 capitalize">
            Opciones para {mealType}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        <button
          onClick={onTakePhoto}
          className="w-full py-3 px-4 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-2xl flex items-center justify-center space-x-2 hover:bg-indigo-100 transition"
        >
          <span>📷</span>
          <span>Hacer foto a otra comida</span>
        </button>

        <div className="space-y-3 pt-2">
          {options.map((meal) => (
            <div
              key={meal.id}
              className="border border-slate-100 rounded-2xl p-3 flex items-center space-x-3 hover:bg-slate-50 transition"
            >
              <div 
                style={{ width: '64px', height: '64px', minWidth: '64px', minHeight: '64px', maxWidth: '64px', maxHeight: '64px' }} 
                className="overflow-hidden rounded-xl bg-slate-100 flex-shrink-0"
              >
                <img
                  src={meal.image_url}
                  alt={meal.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate">{meal.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {meal.calories} kcal | P: {meal.proteins_g}g | G: {meal.fats_g}g
                </p>
                {meal.portion_desc && (
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{meal.portion_desc}</p>
                )}
              </div>
              <button
                onClick={() => onSelectMeal(meal)}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700"
              >
                Elegir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
