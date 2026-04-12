export interface FoodItem {
  id: string;
  name: string;
  serving: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  category: string;
  isCustom?: boolean;
}

export const foodDatabase: FoodItem[] = [
  // Fruits
  { id: "apple", name: "Apple", serving: "1 medium", calories: 95, fat: 0.3, carbs: 25, protein: 0.5, category: "Fruits" },
  { id: "banana", name: "Banana", serving: "1 medium", calories: 105, fat: 0.4, carbs: 27, protein: 1.3, category: "Fruits" },
  { id: "orange", name: "Orange", serving: "1 medium", calories: 62, fat: 0.2, carbs: 15, protein: 1.2, category: "Fruits" },
  { id: "strawberry", name: "Strawberry", serving: "1 cup", calories: 49, fat: 0.5, carbs: 12, protein: 1, category: "Fruits" },
  { id: "grapes", name: "Grapes", serving: "1 cup", calories: 104, fat: 0.2, carbs: 27, protein: 1.1, category: "Fruits" },
  { id: "watermelon", name: "Watermelon", serving: "1 cup", calories: 46, fat: 0.2, carbs: 12, protein: 0.9, category: "Fruits" },
  { id: "blueberry", name: "Blueberry", serving: "1 cup", calories: 84, fat: 0.5, carbs: 21, protein: 1.1, category: "Fruits" },
  { id: "avocado", name: "Avocado", serving: "1 whole", calories: 322, fat: 29, carbs: 17, protein: 4, category: "Fruits" },
  { id: "mango", name: "Mango", serving: "1 cup", calories: 99, fat: 0.6, carbs: 25, protein: 1.4, category: "Fruits" },
  { id: "pineapple", name: "Pineapple", serving: "1 cup", calories: 82, fat: 0.2, carbs: 22, protein: 0.9, category: "Fruits" },

  // Vegetables
  { id: "broccoli", name: "Broccoli", serving: "1 cup", calories: 55, fat: 0.6, carbs: 11, protein: 3.7, category: "Vegetables" },
  { id: "carrot", name: "Carrot", serving: "1 medium", calories: 25, fat: 0.1, carbs: 6, protein: 0.6, category: "Vegetables" },
  { id: "spinach", name: "Spinach", serving: "1 cup raw", calories: 7, fat: 0.1, carbs: 1.1, protein: 0.9, category: "Vegetables" },
  { id: "tomato", name: "Tomato", serving: "1 medium", calories: 22, fat: 0.2, carbs: 4.8, protein: 1.1, category: "Vegetables" },
  { id: "potato", name: "Potato", serving: "1 medium baked", calories: 161, fat: 0.2, carbs: 37, protein: 4.3, category: "Vegetables" },
  { id: "sweet-potato", name: "Sweet Potato", serving: "1 medium", calories: 103, fat: 0.1, carbs: 24, protein: 2.3, category: "Vegetables" },
  { id: "cucumber", name: "Cucumber", serving: "1 cup", calories: 16, fat: 0.1, carbs: 3.6, protein: 0.7, category: "Vegetables" },
  { id: "lettuce", name: "Lettuce", serving: "1 cup", calories: 5, fat: 0.1, carbs: 1, protein: 0.5, category: "Vegetables" },
  { id: "onion", name: "Onion", serving: "1 medium", calories: 44, fat: 0.1, carbs: 10, protein: 1.2, category: "Vegetables" },
  { id: "bell-pepper", name: "Bell Pepper", serving: "1 medium", calories: 31, fat: 0.3, carbs: 6, protein: 1, category: "Vegetables" },

  // Grains & Bread
  { id: "white-rice", name: "White Rice", serving: "1 cup cooked", calories: 206, fat: 0.4, carbs: 45, protein: 4.3, category: "Grains & Bread" },
  { id: "brown-rice", name: "Brown Rice", serving: "1 cup cooked", calories: 216, fat: 1.8, carbs: 45, protein: 5, category: "Grains & Bread" },
  { id: "pasta", name: "Pasta", serving: "1 cup cooked", calories: 220, fat: 1.3, carbs: 43, protein: 8.1, category: "Grains & Bread" },
  { id: "white-bread", name: "White Bread", serving: "1 slice", calories: 79, fat: 1, carbs: 15, protein: 2.7, category: "Grains & Bread" },
  { id: "whole-wheat-bread", name: "Whole Wheat Bread", serving: "1 slice", calories: 81, fat: 1.1, carbs: 14, protein: 4, category: "Grains & Bread" },
  { id: "oatmeal", name: "Oatmeal", serving: "1 cup cooked", calories: 158, fat: 3.2, carbs: 27, protein: 6, category: "Grains & Bread" },
  { id: "quinoa", name: "Quinoa", serving: "1 cup cooked", calories: 222, fat: 3.6, carbs: 39, protein: 8.1, category: "Grains & Bread" },
  { id: "tortilla", name: "Tortilla", serving: "1 flour", calories: 146, fat: 3.6, carbs: 25, protein: 3.8, category: "Grains & Bread" },
  { id: "bagel", name: "Bagel", serving: "1 plain", calories: 270, fat: 1.5, carbs: 53, protein: 10, category: "Grains & Bread" },
  { id: "cornflakes", name: "Cornflakes", serving: "1 cup", calories: 101, fat: 0.2, carbs: 24, protein: 1.9, category: "Grains & Bread" },

  // Protein
  { id: "chicken-breast", name: "Chicken Breast", serving: "100g grilled", calories: 165, fat: 3.6, carbs: 0, protein: 31, category: "Protein" },
  { id: "beef-steak", name: "Beef Steak", serving: "100g", calories: 271, fat: 19, carbs: 0, protein: 26, category: "Protein" },
  { id: "salmon", name: "Salmon", serving: "100g", calories: 208, fat: 13, carbs: 0, protein: 20, category: "Protein" },
  { id: "tuna", name: "Tuna", serving: "100g canned", calories: 116, fat: 0.8, carbs: 0, protein: 26, category: "Protein" },
  { id: "egg", name: "Egg", serving: "1 large", calories: 72, fat: 5, carbs: 0.4, protein: 6.3, category: "Protein" },
  { id: "turkey-breast", name: "Turkey Breast", serving: "100g", calories: 135, fat: 1, carbs: 0, protein: 30, category: "Protein" },
  { id: "shrimp", name: "Shrimp", serving: "100g", calories: 99, fat: 0.3, carbs: 0.2, protein: 24, category: "Protein" },
  { id: "tofu", name: "Tofu", serving: "100g firm", calories: 144, fat: 8.7, carbs: 3.5, protein: 15.6, category: "Protein" },
  { id: "greek-yogurt", name: "Greek Yogurt", serving: "1 cup", calories: 130, fat: 0.7, carbs: 9, protein: 22, category: "Protein" },
  { id: "cottage-cheese", name: "Cottage Cheese", serving: "1 cup", calories: 206, fat: 9, carbs: 6.2, protein: 28, category: "Protein" },

  // Dairy & Drinks
  { id: "whole-milk", name: "Whole Milk", serving: "1 cup", calories: 149, fat: 8, carbs: 12, protein: 8, category: "Dairy & Drinks" },
  { id: "skim-milk", name: "Skim Milk", serving: "1 cup", calories: 83, fat: 0.2, carbs: 12, protein: 8.3, category: "Dairy & Drinks" },
  { id: "cheddar-cheese", name: "Cheddar Cheese", serving: "1 oz", calories: 114, fat: 9.4, carbs: 0.4, protein: 7, category: "Dairy & Drinks" },
  { id: "mozzarella", name: "Mozzarella", serving: "1 oz", calories: 85, fat: 6.3, carbs: 0.7, protein: 6.3, category: "Dairy & Drinks" },
  { id: "butter", name: "Butter", serving: "1 tbsp", calories: 102, fat: 11.5, carbs: 0, protein: 0.1, category: "Dairy & Drinks" },
  { id: "orange-juice", name: "Orange Juice", serving: "1 cup", calories: 112, fat: 0.5, carbs: 26, protein: 1.7, category: "Dairy & Drinks" },
  { id: "coca-cola", name: "Coca-Cola", serving: "12 oz", calories: 140, fat: 0, carbs: 39, protein: 0, category: "Dairy & Drinks" },
  { id: "coffee-black", name: "Coffee (black)", serving: "1 cup", calories: 2, fat: 0, carbs: 0, protein: 0.3, category: "Dairy & Drinks" },
  { id: "beer", name: "Beer", serving: "12 oz", calories: 153, fat: 0, carbs: 13, protein: 1.6, category: "Dairy & Drinks" },
  { id: "red-wine", name: "Red Wine", serving: "5 oz", calories: 125, fat: 0, carbs: 4, protein: 0.1, category: "Dairy & Drinks" },

  // Snacks & Sweets
  { id: "almonds", name: "Almonds", serving: "1 oz / 23 nuts", calories: 164, fat: 14, carbs: 6, protein: 6, category: "Snacks & Sweets" },
  { id: "peanut-butter", name: "Peanut Butter", serving: "2 tbsp", calories: 188, fat: 16, carbs: 7, protein: 8, category: "Snacks & Sweets" },
  { id: "dark-chocolate", name: "Dark Chocolate", serving: "1 oz", calories: 170, fat: 12, carbs: 13, protein: 2.2, category: "Snacks & Sweets" },
  { id: "potato-chips", name: "Potato Chips", serving: "1 oz", calories: 152, fat: 10, carbs: 15, protein: 2, category: "Snacks & Sweets" },
  { id: "popcorn", name: "Popcorn", serving: "3 cups air-popped", calories: 93, fat: 1.1, carbs: 19, protein: 3, category: "Snacks & Sweets" },
  { id: "granola-bar", name: "Granola Bar", serving: "1 bar", calories: 190, fat: 7, carbs: 29, protein: 4, category: "Snacks & Sweets" },
  { id: "ice-cream", name: "Ice Cream", serving: "1/2 cup vanilla", calories: 137, fat: 7.3, carbs: 16, protein: 2.3, category: "Snacks & Sweets" },
  { id: "cookie", name: "Cookie", serving: "1 chocolate chip", calories: 78, fat: 4.5, carbs: 9, protein: 0.9, category: "Snacks & Sweets" },
  { id: "donut", name: "Donut", serving: "1 glazed", calories: 269, fat: 15, carbs: 31, protein: 4, category: "Snacks & Sweets" },
  { id: "honey", name: "Honey", serving: "1 tbsp", calories: 64, fat: 0, carbs: 17, protein: 0.1, category: "Snacks & Sweets" },

  // Fast Food
  { id: "big-mac", name: "Big Mac", serving: "1 burger", calories: 563, fat: 33, carbs: 44, protein: 26, category: "Fast Food" },
  { id: "cheeseburger", name: "Cheeseburger", serving: "1 generic", calories: 303, fat: 15, carbs: 28, protein: 16, category: "Fast Food" },
  { id: "pizza-slice", name: "Pizza Slice", serving: "1 slice cheese 14\"", calories: 272, fat: 10, carbs: 34, protein: 12, category: "Fast Food" },
  { id: "french-fries", name: "French Fries", serving: "medium", calories: 365, fat: 17, carbs: 48, protein: 4, category: "Fast Food" },
  { id: "hot-dog", name: "Hot Dog", serving: "1 with bun", calories: 290, fat: 18, carbs: 22, protein: 11, category: "Fast Food" },
  { id: "fried-chicken", name: "Fried Chicken", serving: "1 drumstick", calories: 193, fat: 11, carbs: 6, protein: 16, category: "Fast Food" },
  { id: "burrito", name: "Burrito", serving: "bean & cheese", calories: 380, fat: 13, carbs: 55, protein: 14, category: "Fast Food" },
  { id: "caesar-salad", name: "Caesar Salad", serving: "with dressing", calories: 180, fat: 12, carbs: 8, protein: 11, category: "Fast Food" },
  { id: "pancake", name: "Pancake", serving: "1 medium", calories: 86, fat: 3.5, carbs: 11, protein: 2.4, category: "Fast Food" },
  { id: "waffle", name: "Waffle", serving: "1 round", calories: 218, fat: 11, carbs: 25, protein: 6, category: "Fast Food" },
];

export interface LoggedFood {
  food: FoodItem;
  portions: number;
  id: string;
}

export interface MacroTotals {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
}

export function searchFoods(query: string, customFoods: FoodItem[], db = foodDatabase): FoodItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const combined = [...db, ...customFoods];
  return combined.filter(
    (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  );
}

export function calcTotals(items: LoggedFood[]): MacroTotals {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.food.calories * item.portions,
      fat: acc.fat + item.food.fat * item.portions,
      carbs: acc.carbs + item.food.carbs * item.portions,
      protein: acc.protein + item.food.protein * item.portions,
    }),
    { calories: 0, fat: 0, carbs: 0, protein: 0 }
  );
}

export function calcMacroRatios(totals: MacroTotals): { fat: number; carbs: number; protein: number } {
  const fatCal = totals.fat * 9;
  const carbCal = totals.carbs * 4;
  const proteinCal = totals.protein * 4;
  const total = fatCal + carbCal + proteinCal;
  if (total === 0) return { fat: 0, carbs: 0, protein: 0 };
  return {
    fat: Math.round((fatCal / total) * 100),
    carbs: Math.round((carbCal / total) * 100),
    protein: Math.round((proteinCal / total) * 100),
  };
}

export const MACRO_PRESETS = {
  balanced: { fat: 30, carbs: 40, protein: 30, label: "Balanced" },
  keto: { fat: 70, carbs: 5, protein: 25, label: "Keto" },
  highProtein: { fat: 25, carbs: 35, protein: 40, label: "High Protein" },
} as const;

export type MacroPreset = keyof typeof MACRO_PRESETS;
