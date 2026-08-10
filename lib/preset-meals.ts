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
  // DESAYUNOS
  {
    id: 'desayuno-a',
    name: 'Gachas de Avena Proteicas con Manzana y Nueces',
    mealType: 'desayuno',
    meal_type: 'desayuno',
    calories: 380,
    proteins_g: 28,
    fats_g: 8,
    carbs_g: 48,
    fiber_g: 6,
    image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&auto=format&fit=crop&q=80',
    portion_desc: '40g avena, 1 manzana, 1 scoop proteína, 15g nueces',
  },
  {
    id: 'desayuno-b',
    name: 'Tostadas de Pan de Centeno con Huevo y Aguacate',
    mealType: 'desayuno',
    meal_type: 'desayuno',
    calories: 350,
    proteins_g: 18,
    fats_g: 16,
    carbs_g: 32,
    fiber_g: 5,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
    portion_desc: '2 tostadas centeno, 2 huevos, 30g aguacate',
  },
  {
    id: 'desayuno-c',
    name: 'Batido Nutritivo Densificado con Suplementación',
    mealType: 'desayuno',
    meal_type: 'desayuno',
    calories: 320,
    proteins_g: 25,
    fats_g: 5,
    carbs_g: 42,
    fiber_g: 3,
    image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80',
    portion_desc: '1 plátano, 125g yogur griego, 1 scoop proteína, 200ml leche',
  },

  // COMIDAS
  {
    id: 'comida-a',
    name: 'Pescado Blanco al Horno con Patata Cocida y Judías Verdes',
    mealType: 'comida',
    meal_type: 'comida',
    calories: 480,
    proteins_g: 35,
    fats_g: 11.8,
    carbs_g: 58,
    fiber_g: 7,
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80',
    portion_desc: '160g pescado blanco, 150g patata, 100g judías verdes',
  },
  {
    id: 'comida-b',
    name: 'Ensalada de Pasta Templada con Pollo y Verduras Asadas',
    mealType: 'comida',
    meal_type: 'comida',
    calories: 520,
    proteins_g: 38,
    fats_g: 12,
    carbs_g: 62,
    fiber_g: 6,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
    portion_desc: '60g pasta integral, 120g pollo, 1/2 calabacín, 1 zanahoria',
  },

  // MERIENDAS
  {
    id: 'merienda-a',
    name: 'Yogur Griego con Frutos Rojos y Nueces',
    mealType: 'merienda',
    meal_type: 'merienda',
    calories: 220,
    proteins_g: 15,
    fats_g: 7,
    carbs_g: 22,
    fiber_g: 4,
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80',
    portion_desc: '125g yogur griego, 50g frutos rojos, 10g nueces',
  },
  {
    id: 'merienda-b',
    name: 'Batido Nutritivo Densificado',
    mealType: 'merienda',
    meal_type: 'merienda',
    calories: 320,
    proteins_g: 25,
    fats_g: 5,
    carbs_g: 42,
    fiber_g: 3,
    image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80',
    portion_desc: '1 plátano, 125g yogur, 1 scoop proteína',
  },

  // CENAS
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
    image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=80',
    portion_desc: '300ml caldo, 1/2 zanahoria, 1/2 calabacín, 1/2 patata, 2 huevos',
  },
  {
    id: 'cena-b',
    name: 'Crema de Calabacín y Patata con Pollo Desmechado',
    mealType: 'cena',
    meal_type: 'cena',
    calories: 340,
    proteins_g: 30,
    fats_g: 10,
    carbs_g: 30,
    fiber_g: 5,
    image_url: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&auto=format&fit=crop&q=80',
    portion_desc: '1 calabacín, 80g patata, 100g pollo desmechado',
  },
  {
    id: 'cena-c',
    name: 'Pechuga de Pollo al Limón con Cuscús y Zanahoria',
    mealType: 'cena',
    meal_type: 'cena',
    calories: 390,
    proteins_g: 32,
    fats_g: 9,
    carbs_g: 45,
    fiber_g: 4,
    image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80',
    portion_desc: '120g pechuga pollo, 40g cuscús integral, 1 zanahoria',
  },
  {
    id: 'cena-d',
    name: 'Salmón al Horno con Patata al Vapor y Puntas de Espárragos',
    mealType: 'cena',
    meal_type: 'cena',
    calories: 410,
    proteins_g: 28,
    fats_g: 18,
    carbs_g: 30,
    fiber_g: 4,
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop&q=80',
    portion_desc: '100g salmón, 120g patata, 5-6 espárragos trigueros',
  },
  {
    id: 'cena-e',
    name: 'Tortilla Francesa con Calabacín Salteado',
    mealType: 'cena',
    meal_type: 'cena',
    calories: 280,
    proteins_g: 16,
    fats_g: 14,
    carbs_g: 18,
    fiber_g: 3,
    image_url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&auto=format&fit=crop&q=80',
    portion_desc: '1 huevo + 1 clara, 1/2 calabacín, 1/4 cebolla',
  },
];
