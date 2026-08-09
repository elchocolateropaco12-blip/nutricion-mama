'use client';

import React, { useState, useEffect } from 'react';
import MealSlotCard from '@/components/MealSlotCard';
import MealPickerSheet from '@/components/MealPickerSheet';
import RodrigoSummaryCard from '@/components/RodrigoSummaryCard';
import { DAILY_TARGETS } from '@/lib/targets';
import { PresetMeal } from '@/lib/preset-meals';

export default function HomePage() {
  const [activeSlot, setActiveSlot] = useState<'desayuno' | 'comida' | 'merienda' | 'cena' | null>(null);
  const [meals, setMeals] = useState<Record<string, any>>({});
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, any> = {};
        data.forEach((entry: any) => {
          map[entry.meal_type] = entry;
        });
        setMeals(map);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSelectMeal = async (meal: PresetMeal) => {
    if (!activeSlot) return;
    const newEntry = {
      meal_type: activeSlot,
      dish_name: meal.name,
      calories: meal.calories,
      proteins_g: meal.proteins_g,
      fats_g: meal.fats_g,
      carbs_g: meal.carbs_g,
      fiber_g: meal.fiber_g,
      image_url: meal.image_url,
    };

    await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });

    setActiveSlot(null);
    fetchEntries();
  };

  const handleRemoveMeal = async (mealType: string) => {
    const entry = meals[mealType];
    if (entry?.id) {
      await fetch(`/api/entries?id=${entry.id}`, { method: 'DELETE' });
      fetchEntries();
    }
  };

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/daily-summary', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 max-w-md mx-auto space-y-4 pb-24">
      <header className="bg-white p-4 rounded-2xl shadow-sm text-center">
        <h1 className="text-xl font-bold text-slate-800">Nutrición de Mamá</h1>
        <p className="text-xs text-slate-500">Objetivo diario: {DAILY_TARGETS.calories.target} kcal</p>
      </header>

      <MealSlotCard
        title="Desayuno"
        time="8:00 - 10:00"
        mealType="desayuno"
        entry={meals['desayuno']}
        onSelect={() => setActiveSlot('desayuno')}
        onRemove={() => handleRemoveMeal('desayuno')}
      />

      <MealSlotCard
        title="Comida"
        time="13:30 - 15:30"
        mealType="comida"
        entry={meals['comida']}
        onSelect={() => setActiveSlot('comida')}
        onRemove={() => handleRemoveMeal('comida')}
      />

      <MealSlotCard
        title="Merienda"
        time="17:30 - 18:30"
        mealType="merienda"
        entry={meals['merienda']}
        onSelect={() => setActiveSlot('merienda')}
        onRemove={() => handleRemoveMeal('merienda')}
      />

      <MealSlotCard
        title="Cena"
        time="20:30 - 22:00"
        mealType="cena"
        entry={meals['cena']}
        onSelect={() => setActiveSlot('cena')}
        onRemove={() => handleRemoveMeal('cena')}
      />

      <button
        onClick={handleGenerateSummary}
        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-md text-sm"
      >
        Ver Resumen de Rodrigo
      </button>

      <RodrigoSummaryCard
        score={summary?.score}
        totals={summary?.totals}
        feedback={summary?.feedback}
        loading={loadingSummary}
      />

      {activeSlot && (
        <MealPickerSheet
          mealType={activeSlot}
          onClose={() => setActiveSlot(null)}
          onSelectMeal={handleSelectMeal}
          onTakePhoto={() => alert('Función de cámara activada')}
        />
      )}
    </main>
  );
}
