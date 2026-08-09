export interface PresetMeal {
  id: string;
  name: string;
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
    meal_type: 'desayuno',
    calories: 580,
    proteins_g: 32,
    fats_g: 12.5,
    carbs_g: 82,
    fiber_g: 8.5,
    image_url: '/meals/desayuno-a.jpg',
    portion_desc: '45g avena, 15g proteína aislado, 1 manzana, 15g nueces'
  },
  {
    id: 'desayuno-b',
    name: 'Tostadas de Centeno con Huevo y Aguacate',
    meal_type: 'desayuno',
    calories: 560,
    proteins_g: 28,
    fats_g: 13.8,
    carbs_g: 78,
    fiber_g: 7.0,
    image_url: '/meals/desayuno-b.jpg',
    portion_desc: '2 rebanadas centeno, 2 huevos, 30g aguacate'
  },
  {
    id: 'desayuno-c',
    name: 'Batido Nutritivo Densificado',
    meal_type: 'desayuno',
    calories: 575,
    proteins_g: 34,
    fats_g: 11.2,
    carbs_g: 83,
    fiber_g: 6.2,
    image_url: '/meals/desayuno-c.jpg',
    portion_desc: '1 plátano, 125g yogur desnatado, 20g proteína, 200ml leche'
  },
  // Comidas
  {
    id: 'comida-a',
    name: 'Pescado Blanco con Patata y Judías',
    meal_type: 'comida',
    calories: 480,
    proteins_g: 35,
    fats_g: 11.8,
    carbs_g: 58,
    fiber_g: 6.0,
    image_url: '/meals/comida-a.jpg',
    portion_desc: '160g merluza/bacalao, 180g patata cocida, 100g judías verdes'
  },
  {
    id: 'comida-b',
    name: 'Ensalada de Pasta con Pollo y Verduras',
    meal_type: 'comida',
    calories: 495,
    proteins_g: 36,
    fats_g: 12.0,
    carbs_g: 61,
    fiber_g: 5.2,
    image_url: '/meals/comida-b.jpg',
    portion_desc: '70g pasta blanca, 120g pechuga pollo, verduras asadas'
  },
  // Cenas
  {
    id: 'cena-a',
    name: 'Sopa de Verduras con Huevo Hervido',
    meal_type: 'cena',
    calories: 320,
    proteins_g: 18,
    fats_g: 11.8,
    carbs_g: 34,
    fiber_g: 4.8,
    image_url: '/meals/cena-a.jpg',
    portion_desc: 'Caldo verduras, patata 80g, 1 huevo entero + 1 clara'
  },
  {
    id: 'cena-b',
    name: 'Crema de Calabacín con Pollo Desmechado',
    meal_type: 'cena',
    calories: 315,
    proteins_g: 26,
    fats_g: 10.5,
    carbs_g: 28,
    fiber_g: 4.2,
    image_url: '/meals/cena-b.jpg',
    portion_desc: 'Calabacín, patata 80g, 100g pechuga pollo, 10ml AOVE'
  },
  {
    id: 'cena-c',
    name: 'Pechuga al Limón con Cuscús y Zanahoria',
    meal_type: 'cena',
    calories: 325,
    proteins_g: 28,
    fats_g: 9.8,
    carbs_g: 32,
    fiber_g: 3.8,
    image_url: '/meals/cena-c.jpg',
    portion_desc: '120g pechuga pollo, 45g cuscús, 1 zanahoria'
  },
  {
    id: 'cena-d',
    name: 'Salmón al Horno con Patata y Espárragos',
    meal_type: 'cena',
    calories: 335,
    proteins_g: 24,
    fats_g: 12.3,
    carbs_g: 30,
    fiber_g: 4.0,
    image_url: '/meals/cena-d.jpg',
    portion_desc: '90g salmón fresco, 120g patata al vapor, espárragos'
  },
  {
    id: 'cena-e',
    name: 'Tortilla Francesa con Calabacín Salteado',
    meal_type: 'cena',
    calories: 310,
    proteins_g: 19,
    fats_g: 11.5,
    carbs_g: 26,
    fiber_g: 3.5,
    image_url: '/meals/cena-e.jpg',
    portion_desc: '1 huevo + 1 clara, calabacín, 1/4 cebolla dulce'
  }
];
