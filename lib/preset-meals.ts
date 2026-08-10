export interface PresetMeal {
  id: string;
  name: string;
  mealType: 'desayuno' | 'comida' | 'merienda' | 'cena';
  meal_type: 'desayuno' | 'comida' | 'merienda' | 'cena';
  calories: number;
  proteins_g: number;
  fats_g: number;
  carbs_g: number;
  fiber_g: number;
  image_url: string;
  portion_desc?: string;
}

export const PRESET_MEALS: PresetMeal[] = [
  // Desayunos
  {
    id: 'desayuno-a',
    name: 'Gachas de Avena Proteicas con Manzana',
    mealType: 'desayuno',
    meal_type: 'desayuno',
    calories: 380,
    proteins_g: 28,
    fats_g: 8,
    carbs_g: 48,
    fiber_g: 6,
    image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=500&auto=format&fit=crop&q=80',
    portion_desc: '1 tazón (40g avena + 1 scoop proteína)',
  },
  {
    id: 'desayuno-b',
    name: 'Tostadas de Centeno con Huevo y Aguacate',
    mealType: 'desayuno',
    meal_type: 'desayuno',
    calories: 350,
    proteins_g: 18,
    fats_g: 16,
    carbs_g: 32,
    fiber_g: 5,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
    portion_desc: '2 tostadas + 2 huevos',
  },
  {
    id: 'desayuno-c',
    name: 'Batido Nutritivo Densificado',
    mealType: 'desayuno',
    meal_type: 'desayuno',
    calories: 320,
    proteins_g: 25,
    fats_g: 5,
    carbs_g: 42,
    fiber_g: 3,
    image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80',
    portion_desc: '1 vaso grande (1 plátano + proteína)',
  },

  // Comidas
  {
    id: 'comida-a',
    name: 'Pescado Blanco con Patata y Judías',
    mealType: 'comida',
    meal_type: 'comida',
    calories: 480,
    proteins_g: 35,
    fats_g: 11.8,
    carbs_g: 58,
    fiber_g: 7,
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80',
    portion_desc: '160g pescado + 150g patata + 100g judías',
  },
  {
    id: 'comida-b',
    name: 'Ensalada de Pasta Templada con Pollo',
    mealType: 'comida',
    meal_type: 'comida',
    calories: 520,
    proteins_g: 38,
    fats_g: 12,
    carbs_g: 62,
    fiber_g: 6,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    portion_desc: '60g pasta + 120g pollo + verduras',
  },

  // Meriendas
  {
    id: 'merienda-a',
    name: 'Yogur Griego con Frutos Rojos',
    mealType: 'merienda',
    meal_type: 'merienda',
    calories: 210,
    proteins_g: 15,
    fats_g: 6,
    carbs_g: 22,
    fiber_g: 4,
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
    portion_desc: '125g yogur + 1 puñado frutos rojos',
  },

  // Cenas
  {
    id: 'cena-a',
    name: 'Sopa de Verduras con Huevo Hervido',
    mealType: 'cena',
    meal_type: 'cena',
    calories: 320,
    proteins_g: 18,
    fats_g: 11.8,
    carbs_g: 35,
    fiber_g: 5,
    image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=80',
    portion_desc: '300ml sopa + 2 huevos',
  },
  {
    id: 'cena-b',
    name: 'Crema de Calabacín con Pollo Desmechado',
    mealType: 'cena',
    meal_type: 'cena',
    calories: 340,
    proteins_g: 30,
    fats_g: 10,
    carbs_g: 30,
    fiber_g: 5,
    image_url: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=500&auto=format&fit=crop&q=80',
    portion_desc: '1 cuenco crema + 100g pollo',
  },
];
