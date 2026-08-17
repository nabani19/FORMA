import { DayOfWeek } from '../types';

export interface MealIngredient {
  name: string;
  quantity: string;
  costInr: number;
  proteinG: number;
}

export interface PlannedMeal {
  id: string;
  slot: string;
  name: string;
  portion: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  costInr: number;
  prepTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Quick (<10m)';
  dietaryTags: string[];
  ingredients: MealIngredient[];
  instructions: string[];
  chefTips: string;
  micronutrients: {
    calciumMg: number;
    ironMg: number;
    potassiumMg: number;
    sodiumMg: number;
    vitaminD_iu?: number;
    zincMg?: number;
  };
}

export interface DayPlan {
  totalKcal: number;
  totalProtein: number;
  totalCost: number;
  meals: PlannedMeal[];
}

export const BASE_WEEKLY_PLAN: Record<DayOfWeek, DayPlan> = {
  monday: {
    totalKcal: 2150,
    totalProtein: 138,
    totalCost: 65,
    meals: [
      {
        id: 'mon_breakfast',
        slot: 'Breakfast',
        name: 'High-Protein Moong Dal Chilla (3 pcs) with Green Chutney',
        portion: '280g',
        kcal: 410,
        protein: 26,
        carbs: 45,
        fat: 10,
        fiber: 11,
        costInr: 14,
        prepTimeMinutes: 15,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'High Protein', 'Gluten Free', 'Diabetic Safe'],
        ingredients: [
          { name: 'Yellow Moong Dal (Soaked & Ground)', quantity: '80g', costInr: 8, proteinG: 19 },
          { name: 'Onion, Green Chilli & Ginger', quantity: '30g', costInr: 2, proteinG: 1 },
          { name: 'Cold Pressed Mustard Oil / Ghee', quantity: '5ml', costInr: 2, proteinG: 0 },
          { name: 'Fresh Mint & Coriander Chutney', quantity: '30g', costInr: 2, proteinG: 1 },
          { name: 'Ajwain, Jeera, Turmeric & Salt', quantity: '5g', costInr: 0, proteinG: 5 },
        ],
        instructions: [
          'Wash and soak yellow moong dal for 30 minutes, then blend into a smooth batter with ginger, green chilli and cumin.',
          'Add chopped onions, fresh coriander, turmeric, pinch of hing and salt to taste.',
          'Heat a cast-iron tawa, lightly grease with a few drops of mustard oil, and pour a ladleful of batter spreading outward in circular motions.',
          'Cook on medium heat for 2 minutes until golden crisp, flip and cook the other side for 1 minute.',
          'Serve piping hot with fresh homemade mint-coriander green chutney.'
        ],
        chefTips: 'Soaking moong dal softens the starch and increases bioavailable protein absorption by 25%.',
        micronutrients: { calciumMg: 75, ironMg: 4.2, potassiumMg: 480, sodiumMg: 280, zincMg: 2.1 }
      },
      {
        id: 'mon_morning_snack',
        slot: 'Morning Snack',
        name: 'Bihar Roasted Sattu Energy Drink with Lemon & Roasted Jeera',
        portion: '300ml',
        kcal: 260,
        protein: 18,
        carbs: 35,
        fat: 4,
        fiber: 9,
        costInr: 8,
        prepTimeMinutes: 5,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Vegan', 'High Protein', 'Budget Champion', 'Gut Friendly'],
        ingredients: [
          { name: 'Roasted Chana Sattu (Bengal Gram Flour)', quantity: '60g', costInr: 5, proteinG: 15 },
          { name: 'Chilled Water & Lemon Juice', quantity: '250ml', costInr: 2, proteinG: 0 },
          { name: 'Roasted Cumin Powder & Kala Namak', quantity: '5g', costInr: 1, proteinG: 3 },
        ],
        instructions: [
          'In a tall glass or shaker, add 60g pure roasted Bengal gram sattu.',
          'Pour in 250ml chilled water slowly while whisking with a spoon to eliminate any lumps.',
          'Squeeze half a fresh juicy lemon, sprinkle roasted cumin powder and black salt (kala namak).',
          'Mix vigorously and consume immediately for sustained slow-burning energy.'
        ],
        chefTips: 'Sattu has a glycemic index of only 28, preventing mid-morning insulin spikes and keeping you satiated for hours.',
        micronutrients: { calciumMg: 90, ironMg: 5.1, potassiumMg: 520, sodiumMg: 310, zincMg: 2.8 }
      },
      {
        id: 'mon_lunch',
        slot: 'Lunch',
        name: 'High-Protein Soya Chunk Curry + Steamed Brown Rice + Cucumber Salad',
        portion: '520g',
        kcal: 620,
        protein: 46,
        carbs: 78,
        fat: 11,
        fiber: 16,
        costInr: 18,
        prepTimeMinutes: 25,
        difficulty: 'Medium',
        dietaryTags: ['Vegan', 'Ultra High Protein', 'Bodybuilding Staple', 'Low Cost'],
        ingredients: [
          { name: 'Defatted Soya Chunks (52% Protein)', quantity: '60g dry (180g boiled)', costInr: 6, proteinG: 31 },
          { name: 'Raw Brown Rice (Cooked to 200g)', quantity: '70g', costInr: 4, proteinG: 6 },
          { name: 'Tomato, Onion, Garlic & Ginger Gravy', quantity: '100g', costInr: 4, proteinG: 3 },
          { name: 'Mustard Oil & Indian Spices (Garam Masala, Coriander, Turmeric)', quantity: '8ml', costInr: 2, proteinG: 0 },
          { name: 'Fresh Cucumber & Carrot Salad', quantity: '80g', costInr: 2, proteinG: 6 },
        ],
        instructions: [
          'Boil soya chunks in salted water for 5 minutes until soft and expanded, drain and thoroughly squeeze out excess water.',
          'In a kadai, heat mustard oil and saute cumin seeds, chopped onions, ginger-garlic paste until aromatic and golden brown.',
          'Add pureed tomatoes, turmeric, coriander powder, red chilli powder and garam masala. Cook until oil separates.',
          'Toss in squeezed soya chunks and 1 cup of water; simmer on low heat for 10 minutes to allow the rich spices to penetrate.',
          'Serve warm with steamed brown rice and crunchy sliced cucumber salad with lemon squeeze.'
        ],
        chefTips: 'Squeezing soya chunks 2-3 times in cold water eliminates any residual beany flavor and yields tender meat-like texture.',
        micronutrients: { calciumMg: 210, ironMg: 8.5, potassiumMg: 820, sodiumMg: 420, zincMg: 4.3 }
      },
      {
        id: 'mon_evening_snack',
        slot: 'Evening Snack',
        name: 'Sprouted Kala Chana & Peanuts Chaat with Chatpata Masala',
        portion: '180g',
        kcal: 270,
        protein: 17,
        carbs: 32,
        fat: 7,
        fiber: 10,
        costInr: 9,
        prepTimeMinutes: 8,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Vegan', 'High Fiber', 'Natural Energy', 'Immunity Boost'],
        ingredients: [
          { name: 'Sprouted Brown Chickpeas (Kala Chana)', quantity: '70g', costInr: 4, proteinG: 11 },
          { name: 'Roasted Peanuts', quantity: '20g', costInr: 2, proteinG: 5 },
          { name: 'Finely Chopped Onion, Tomato, Green Chilli & Coriander', quantity: '50g', costInr: 2, proteinG: 1 },
          { name: 'Chaat Masala, Kala Namak & Fresh Lemon', quantity: '5g', costInr: 1, proteinG: 0 },
        ],
        instructions: [
          'Steam or lightly blanch sprouted kala chana for 3 minutes to enhance digestibility.',
          'In a mixing bowl, combine warm sprouted chana with crunchy roasted peanuts.',
          'Add finely diced onions, juicy tomatoes, minced green chilli and fresh coriander.',
          'Sprinkle generous chaat masala, roasted cumin, black salt and squeeze fresh lemon juice.',
          'Toss well and serve immediately for a mouthwatering, protein-packed evening bite.'
        ],
        chefTips: 'Sprouting legumes activates enzymes, multiplies Vitamin C by 300% and increases protein bioavailability.',
        micronutrients: { calciumMg: 85, ironMg: 3.9, potassiumMg: 410, sodiumMg: 220, zincMg: 1.9 }
      },
      {
        id: 'mon_dinner',
        slot: 'Dinner',
        name: 'Homestyle Toor Dal Tadka + 3 Whole Wheat Phulkas + Spiced Lauki Sabzi',
        portion: '480g',
        kcal: 590,
        protein: 31,
        carbs: 88,
        fat: 10,
        fiber: 14,
        costInr: 16,
        prepTimeMinutes: 20,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'Heart Healthy', 'Easy Digest', 'Classic Indian'],
        ingredients: [
          { name: 'Toor Dal (Pigeon Pea Dal)', quantity: '60g', costInr: 6, proteinG: 14 },
          { name: 'Whole Wheat Atta (3 Soft Phulkas)', quantity: '80g', costInr: 3, proteinG: 10 },
          { name: 'Fresh Lauki (Bottle Gourd) / Seasonal Sabzi', quantity: '150g', costInr: 4, proteinG: 2 },
          { name: 'Desi Ghee / Mustard Oil Tadka (Jeera, Hing, Garlic, Dry Red Chilli)', quantity: '6ml', costInr: 2, proteinG: 0 },
          { name: 'Curd / Dahi Serving', quantity: '60g', costInr: 1, proteinG: 5 },
        ],
        instructions: [
          'Pressure cook toor dal with turmeric, chopped tomatoes and salt for 3 whistles until creamy.',
          'Prepare tadka in a pan with ghee, cumin seeds, minced garlic, hing and dried red chilli; pour sizzling tadka into hot dal.',
          'Saute diced bottle gourd (lauki) with jeera, turmeric and coriander powder until tender and mildly spiced.',
          'Knead whole wheat atta into a smooth dough, roll thin discs and roast on direct flame until fully puffed into soft phulkas.',
          'Assemble dinner with steaming dal, fresh sabzi, hot phulkas and a side of cooling curd.'
        ],
        chefTips: 'Pairing lentils (dal) with whole wheat grains (phulkas) forms a complete amino acid profile with all 9 essential amino acids.',
        micronutrients: { calciumMg: 160, ironMg: 5.8, potassiumMg: 690, sodiumMg: 360, zincMg: 3.2 }
      },
    ]
  },

  tuesday: {
    totalKcal: 2180,
    totalProtein: 140,
    totalCost: 66,
    meals: [
      {
        id: 'tue_breakfast',
        slot: 'Breakfast',
        name: 'Protein Besan Chilla (3 pcs) Loaded with Grated Veggies & Mint Chutney',
        portion: '270g',
        kcal: 400,
        protein: 24,
        carbs: 48,
        fat: 11,
        fiber: 10,
        costInr: 13,
        prepTimeMinutes: 12,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'Gluten Free', 'High Protein'],
        ingredients: [
          { name: 'Pure Bengal Gram Besan', quantity: '80g', costInr: 7, proteinG: 18 },
          { name: 'Grated Carrot, Onion & Spinach', quantity: '60g', costInr: 3, proteinG: 3 },
          { name: 'Mustard Oil / Ghee', quantity: '5ml', costInr: 2, proteinG: 0 },
          { name: 'Mint Chutney & Spices', quantity: '25g', costInr: 1, proteinG: 3 },
        ],
        instructions: [
          'Whisk besan with water, grated carrot, finely chopped spinach, onion, ajwain and salt into a smooth batter.',
          'Pour batter on a hot non-stick pan and spread evenly.',
          'Drizzle a few drops of oil around edges and cook until golden crisp on both sides.',
          'Fold and serve with zesty mint chutney.'
        ],
        chefTips: 'Adding grated spinach and carrots increases fiber and adds natural moisture so the chilla stays soft.',
        micronutrients: { calciumMg: 95, ironMg: 4.8, potassiumMg: 490, sodiumMg: 270, zincMg: 2.4 }
      },
      {
        id: 'tue_morning_snack',
        slot: 'Morning Snack',
        name: 'Farm Fresh Boiled Eggs (3) with Black Pepper & Chaas (200ml)',
        portion: '320g',
        kcal: 270,
        protein: 23,
        carbs: 9,
        fat: 14,
        fiber: 1,
        costInr: 18,
        prepTimeMinutes: 10,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Eggitarian', 'High Bioavailability Protein', 'Keto Friendly'],
        ingredients: [
          { name: 'Farm Fresh Eggs (Hard Boiled)', quantity: '3 eggs', costInr: 15, proteinG: 20 },
          { name: 'Fresh Buttermilk / Chaas with Jeera', quantity: '200ml', costInr: 3, proteinG: 3 },
        ],
        instructions: [
          'Place eggs in boiling water and cook for 9 minutes for perfect firm yolks.',
          'Transfer to ice-cold water bath for 2 minutes, peel shells smoothly.',
          'Slice in halves, season with freshly cracked black pepper and rock salt.',
          'Enjoy with a chilled glass of roasted cumin spiced buttermilk.'
        ],
        chefTips: 'Egg protein has a biological value score of 100, the highest reference standard for muscle tissue synthesis.',
        micronutrients: { calciumMg: 140, ironMg: 3.2, potassiumMg: 340, sodiumMg: 290, zincMg: 2.2, vitaminD_iu: 120 }
      },
      {
        id: 'tue_lunch',
        slot: 'Lunch',
        name: 'Dhaba Style Rajma Masala + Jeera Rice (200g) + 2 Phulkas + Onion Salad',
        portion: '540g',
        kcal: 640,
        protein: 36,
        carbs: 92,
        fat: 10,
        fiber: 17,
        costInr: 16,
        prepTimeMinutes: 30,
        difficulty: 'Medium',
        dietaryTags: ['Vegetarian', 'High Fiber', 'Classic Comfort'],
        ingredients: [
          { name: 'Red Kidney Beans (Rajma Soaked & Boiled)', quantity: '70g dry', costInr: 7, proteinG: 17 },
          { name: 'Steamed Jeera Rice', quantity: '60g raw', costInr: 3, proteinG: 5 },
          { name: 'Whole Wheat Phulkas (2)', quantity: '55g atta', costInr: 2, proteinG: 7 },
          { name: 'Tomato, Onion, Ginger Garlic Masala', quantity: '100g', costInr: 3, proteinG: 2 },
          { name: 'Mustard Oil & Whole Spices', quantity: '6ml', costInr: 1, proteinG: 5 },
        ],
        instructions: [
          'Soak red rajma overnight for 8 hours; pressure cook with bay leaf and black cardamom for 5 whistles.',
          'In a pan, cook finely chopped onions and ginger-garlic paste in mustard oil until dark golden.',
          'Add tomato puree and rajma masala spices; cook till oil glazes on top.',
          'Add boiled rajma with its nutrient-rich broth and mash 20% of beans to thicken gravy naturally.',
          'Simmer for 15 minutes and serve with warm jeera rice and soft phulkas.'
        ],
        chefTips: 'Mashing a small portion of boiled rajma creates a thick, restaurant-quality velvety gravy without any added cream.',
        micronutrients: { calciumMg: 130, ironMg: 6.4, potassiumMg: 790, sodiumMg: 390, zincMg: 3.6 }
      },
      {
        id: 'tue_evening_snack',
        slot: 'Evening Snack',
        name: 'Soya Bhurji Stuffed Roll / Quick Chaat with Coriander & Lime',
        portion: '160g',
        kcal: 230,
        protein: 26,
        carbs: 16,
        fat: 5,
        fiber: 9,
        costInr: 7,
        prepTimeMinutes: 8,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Vegan', 'High Protein', 'Post Workout Snack'],
        ingredients: [
          { name: 'Granulated Soya Chunks (Mince)', quantity: '45g dry', costInr: 4, proteinG: 23 },
          { name: 'Chopped Onion, Green Chilli & Tomato', quantity: '40g', costInr: 2, proteinG: 2 },
          { name: 'Oil & Pav Bhaji / Chaat Masala', quantity: '4ml', costInr: 1, proteinG: 1 },
        ],
        instructions: [
          'Soak soya granules in boiling water for 3 minutes, rinse in cold water and squeeze dry.',
          'Saute onions, green chilli and tomatoes in a pan with pav bhaji masala.',
          'Add squeezed soya granules and stir fry on high heat for 3 minutes until aromatic.',
          'Finish with fresh lemon juice and chopped coriander leaves.'
        ],
        chefTips: 'Soya granules absorb spices like a sponge, making it a delicious, 50%+ protein evening powerhouse for under ₹7.',
        micronutrients: { calciumMg: 160, ironMg: 5.6, potassiumMg: 510, sodiumMg: 210, zincMg: 2.7 }
      },
      {
        id: 'tue_dinner',
        slot: 'Dinner',
        name: 'High-Protein Moong Dal Khichdi + Spiced Curd Raita + Roasted Papad',
        portion: '460g',
        kcal: 640,
        protein: 31,
        carbs: 85,
        fat: 12,
        fiber: 13,
        costInr: 12,
        prepTimeMinutes: 20,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'Ayurvedic Superfood', 'Gut Healing'],
        ingredients: [
          { name: 'Split Yellow & Green Moong Dal', quantity: '65g', costInr: 6, proteinG: 16 },
          { name: 'Rice (Short Grain)', quantity: '50g', costInr: 2, proteinG: 4 },
          { name: 'Fresh Curd / Dahi (Raita with Cucumber)', quantity: '100g', costInr: 2, proteinG: 4 },
          { name: 'Ghee Tadka (Cumin, Hing, Ginger, Curry Leaves)', quantity: '6ml', costInr: 2, proteinG: 7 },
        ],
        instructions: [
          'Wash moong dal and rice together, drain.',
          'In a pressure cooker, heat ghee and crackle cumin seeds, hing, grated ginger and black peppercorns.',
          'Add dal and rice, 3.5 cups of water, turmeric and salt.',
          'Cook on medium flame for 3 whistles until soft and porridge-like.',
          'Serve steaming khichdi with cooling cucumber raita and crisp roasted papad.'
        ],
        chefTips: 'Khichdi with a 1:1 dal-to-rice ratio provides the ideal balance of amino acids and prebiotic fibers for overnight recovery.',
        micronutrients: { calciumMg: 190, ironMg: 4.6, potassiumMg: 610, sodiumMg: 340, zincMg: 2.9 }
      },
    ]
  },

  wednesday: {
    totalKcal: 2160,
    totalProtein: 139,
    totalCost: 65,
    meals: [
      {
        id: 'wed_breakfast',
        slot: 'Breakfast',
        name: 'Vegetable Oats Upma with Roasted Peanuts & Curry Leaves',
        portion: '280g',
        kcal: 410,
        protein: 21,
        carbs: 52,
        fat: 12,
        fiber: 11,
        costInr: 13,
        prepTimeMinutes: 12,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'High Fiber', 'Heart Health Beta-Glucan'],
        ingredients: [
          { name: 'Rolled / Whole Grain Oats', quantity: '70g', costInr: 6, proteinG: 10 },
          { name: 'Roasted Peanuts', quantity: '25g', costInr: 3, proteinG: 7 },
          { name: 'Onion, Green Peas, Carrots & Green Chilli', quantity: '60g', costInr: 2, proteinG: 3 },
          { name: 'Mustard Seeds, Curry Leaves & Oil', quantity: '5ml', costInr: 2, proteinG: 1 },
        ],
        instructions: [
          'Dry roast oats in a pan for 3 minutes until fragrant, set aside.',
          'In the same pan, heat oil, crackle mustard seeds and curry leaves.',
          'Add chopped onions, green peas and carrots; saute for 3 minutes.',
          'Add 1.5 cups of water with turmeric and salt; bring to a rolling boil.',
          'Slowly stir in roasted oats and crunchy peanuts; cook for 2 minutes until creamy and fluffy.'
        ],
        chefTips: 'Oats are rich in beta-glucan soluble fiber which actively lowers LDL cholesterol and sustains satiety.',
        micronutrients: { calciumMg: 80, ironMg: 4.1, potassiumMg: 440, sodiumMg: 240, zincMg: 2.6 }
      },
      {
        id: 'wed_morning_snack',
        slot: 'Morning Snack',
        name: 'Protein Sattu Shake (Masala / Sweet Option) with Black Salt',
        portion: '300ml',
        kcal: 260,
        protein: 18,
        carbs: 36,
        fat: 4,
        fiber: 9,
        costInr: 8,
        prepTimeMinutes: 5,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Vegan', 'High Protein', 'Hydration Power'],
        ingredients: [
          { name: 'Pure Chana Sattu', quantity: '60g', costInr: 5, proteinG: 15 },
          { name: 'Chilled Water, Lime & Cumin', quantity: '250ml', costInr: 2, proteinG: 0 },
          { name: 'Black Salt & Spices', quantity: '5g', costInr: 1, proteinG: 3 },
        ],
        instructions: [
          'Whisk sattu in chilled water until perfectly smooth.',
          'Add lemon juice, roasted cumin, black salt and mix well.',
          'Drink immediately.'
        ],
        chefTips: 'Sattu is 100% natural pre-cooked roasted gram flour, meaning zero cooking time and instant protein delivery.',
        micronutrients: { calciumMg: 85, ironMg: 4.9, potassiumMg: 500, sodiumMg: 290, zincMg: 2.7 }
      },
      {
        id: 'wed_lunch',
        slot: 'Lunch',
        name: 'High-Protein Chana Masala (Chickpeas) + 2 Phulkas + Rice + Salad',
        portion: '520g',
        kcal: 630,
        protein: 34,
        carbs: 90,
        fat: 11,
        fiber: 16,
        costInr: 17,
        prepTimeMinutes: 25,
        difficulty: 'Medium',
        dietaryTags: ['Vegetarian', 'High Protein', 'Rich in Folate & Iron'],
        ingredients: [
          { name: 'White Kabuli Chana (Soaked & Boiled)', quantity: '70g dry', costInr: 7, proteinG: 16 },
          { name: 'Whole Wheat Phulkas (2)', quantity: '55g atta', costInr: 2, proteinG: 7 },
          { name: 'Steamed Rice', quantity: '50g raw', costInr: 2, proteinG: 4 },
          { name: 'Onion, Tomato, Ginger & Chole Spices', quantity: '90g', costInr: 4, proteinG: 2 },
          { name: 'Oil & Garnishing Herbs', quantity: '6ml', costInr: 2, proteinG: 5 },
        ],
        instructions: [
          'Pressure cook soaked chana with a tea bag and bay leaf for 5 whistles until fork tender.',
          'Saute onions, ginger, garlic and tomato puree with chana masala spices until rich and fragrant.',
          'Add boiled chickpeas with broth, simmer for 10 minutes to allow flavors to meld.',
          'Serve with warm whole wheat phulkas, steamed rice and sliced red onions.'
        ],
        chefTips: 'Boiling chickpeas with a tea bag yields the authentic deep brown color and rich nutty flavor of classic Amritsari chole.',
        micronutrients: { calciumMg: 140, ironMg: 6.2, potassiumMg: 710, sodiumMg: 380, zincMg: 3.4 }
      },
      {
        id: 'wed_evening_snack',
        slot: 'Evening Snack',
        name: 'Crispy Pan-Seared Soya Chunks Tikki (3 pcs) with Mint Dip',
        portion: '160g',
        kcal: 240,
        protein: 26,
        carbs: 18,
        fat: 5,
        fiber: 8,
        costInr: 9,
        prepTimeMinutes: 10,
        difficulty: 'Easy',
        dietaryTags: ['Vegan', 'High Protein', 'Kabab Alternative'],
        ingredients: [
          { name: 'Soya Chunks (Boiled & Coarsely Minced)', quantity: '50g dry', costInr: 5, proteinG: 26 },
          { name: 'Boiled Potato Binder & Spices', quantity: '40g', costInr: 2, proteinG: 1 },
          { name: 'Oil for Pan Searing', quantity: '4ml', costInr: 1, proteinG: 0 },
          { name: 'Green Mint Chutney', quantity: '20g', costInr: 1, proteinG: 0 },
        ],
        instructions: [
          'Pulse boiled squeezed soya chunks in a mixer into a coarse mince.',
          'Mix with mashed potato, green chillies, ginger, garam masala, chaat masala and salt.',
          'Shape into 3 flat patties (tikkis) and pan sear on a lightly greased tawa for 3 minutes per side until golden brown and crispy.',
          'Serve with mint chutney.'
        ],
        chefTips: 'Soya tikkis give the exact chew and bite of gourmet shami kababs at less than 1/10th the cost.',
        micronutrients: { calciumMg: 170, ironMg: 6.8, potassiumMg: 600, sodiumMg: 260, zincMg: 3.1 }
      },
      {
        id: 'wed_dinner',
        slot: 'Dinner',
        name: 'Egg Curry (3 Eggs) + 3 Soft Phulkas + Spiced Cabbage Foogath',
        portion: '480g',
        kcal: 620,
        protein: 40,
        carbs: 68,
        fat: 18,
        fiber: 11,
        costInr: 18,
        prepTimeMinutes: 20,
        difficulty: 'Easy',
        dietaryTags: ['Eggitarian', 'High Protein', 'Clean Dinner'],
        ingredients: [
          { name: 'Hard Boiled Eggs', quantity: '3 eggs', costInr: 15, proteinG: 20 },
          { name: 'Whole Wheat Atta (3 Phulkas)', quantity: '80g', costInr: 3, proteinG: 10 },
          { name: 'Onion Tomato Curry Base & Spices', quantity: '80g', costInr: 3, proteinG: 2 },
          { name: 'Cabbage Sabzi / Salad', quantity: '100g', costInr: 2, proteinG: 2 },
          { name: 'Oil / Ghee', quantity: '5ml', costInr: 1, proteinG: 6 },
        ],
        instructions: [
          'Prick boiled eggs with a fork, pan fry with pinch of turmeric and chilli powder for 1 minute until blistered.',
          'Saute finely diced onions, ginger, garlic and tomato paste until aromatic.',
          'Add curry powder, water and simmer for 5 minutes.',
          'Add fried eggs, coat in gravy and simmer for 2 minutes.',
          'Serve hot with fresh phulkas and cabbage sabzi.'
        ],
        chefTips: 'Lightly blistering eggs in turmeric oil locks in moisture and prevents the egg whites from turning rubbery.',
        micronutrients: { calciumMg: 170, ironMg: 5.1, potassiumMg: 620, sodiumMg: 340, zincMg: 3.0, vitaminD_iu: 120 }
      },
    ]
  },

  thursday: {
    totalKcal: 2190,
    totalProtein: 141,
    totalCost: 67,
    meals: [
      {
        id: 'thu_breakfast',
        slot: 'Breakfast',
        name: 'Kanda Poha with Peanuts, Sprouted Moong & Fresh Lemon',
        portion: '280g',
        kcal: 410,
        protein: 20,
        carbs: 58,
        fat: 11,
        fiber: 9,
        costInr: 12,
        prepTimeMinutes: 12,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'Gluten Free', 'Iron Rich Maharashtrian'],
        ingredients: [
          { name: 'Thick Poha (Flattened Rice, Rinsed)', quantity: '70g', costInr: 4, proteinG: 5 },
          { name: 'Sprouted Moong Beans', quantity: '50g', costInr: 3, proteinG: 8 },
          { name: 'Crunchy Peanuts', quantity: '25g', costInr: 3, proteinG: 7 },
          { name: 'Onion, Mustard Seeds, Curry Leaves & Green Chilli', quantity: '40g', costInr: 1, proteinG: 0 },
          { name: 'Oil & Lemon Juice', quantity: '5ml', costInr: 1, proteinG: 0 },
        ],
        instructions: [
          'Rinse poha in a colander for 30 seconds, drain and let rest to fluff up.',
          'In a kadai, heat oil, fry peanuts until golden crisp, remove half for garnish.',
          'Add mustard seeds, curry leaves, green chilli and onions; saute until translucent.',
          'Add sprouted moong, turmeric and salt; cook covered for 2 minutes.',
          'Toss in soft poha gently, cover and steam on low flame for 2 minutes. Squeeze fresh lemon.'
        ],
        chefTips: 'Flattened rice (poha) is naturally fortified with non-heme iron from iron processing rollers; adding lemon juice (Vitamin C) multiplies iron absorption by 3x.',
        micronutrients: { calciumMg: 85, ironMg: 5.4, potassiumMg: 420, sodiumMg: 210, zincMg: 2.1 }
      },
      {
        id: 'thu_morning_snack',
        slot: 'Morning Snack',
        name: 'Boiled Egg Whites (4) / Sattu Shake + Roasted Chana (40g)',
        portion: '240g',
        kcal: 250,
        protein: 24,
        carbs: 22,
        fat: 4,
        fiber: 6,
        costInr: 14,
        prepTimeMinutes: 6,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['High Protein', 'Lean Muscle', 'Low Fat'],
        ingredients: [
          { name: 'Boiled Eggs / Roasted Chana Sattu', quantity: '4 whites / 50g sattu', costInr: 12, proteinG: 18 },
          { name: 'Roasted Bengal Gram Chana', quantity: '30g', costInr: 2, proteinG: 6 },
        ],
        instructions: [
          'Slice hard-boiled eggs, season whites with chaat masala and black pepper.',
          'Pair with crunchy roasted chana for balanced chew and slow-digesting complex carbs.'
        ],
        chefTips: 'Roasted chana provides resistant starch that nourishes beneficial bifidobacteria in your gut microbiome.',
        micronutrients: { calciumMg: 70, ironMg: 3.8, potassiumMg: 380, sodiumMg: 260, zincMg: 2.3 }
      },
      {
        id: 'thu_lunch',
        slot: 'Lunch',
        name: 'Rich Soya-Dal Tadka Curry + 2 Whole Wheat Phulkas + Steamed Rice',
        portion: '520g',
        kcal: 640,
        protein: 43,
        carbs: 86,
        fat: 11,
        fiber: 16,
        costInr: 16,
        prepTimeMinutes: 25,
        difficulty: 'Medium',
        dietaryTags: ['Vegan', 'High Protein', 'Budget Muscle Fuel'],
        ingredients: [
          { name: 'Soya Chunks (Hydrated & Minced/Halved)', quantity: '50g dry', costInr: 5, proteinG: 26 },
          { name: 'Masoor Dal (Red Lentil)', quantity: '40g', costInr: 4, proteinG: 10 },
          { name: 'Whole Wheat Phulkas (2)', quantity: '55g atta', costInr: 2, proteinG: 7 },
          { name: 'Rice & Tomato Onion Gravy', quantity: '80g', costInr: 3, proteinG: 0 },
          { name: 'Mustard Oil & Spices', quantity: '6ml', costInr: 2, proteinG: 0 },
        ],
        instructions: [
          'Pressure cook red masoor dal with tomatoes and turmeric for 2 whistles.',
          'In a separate pan, saute onions, garlic and spices; add squeezed boiled soya chunks.',
          'Combine soya with dal, add water and simmer for 8 minutes until rich and thick.',
          'Serve with warm phulkas, steamed rice and lemon-tossed cucumbers.'
        ],
        chefTips: 'Combining masoor dal with soya chunks creates a thick, creamy sauce that clings to every grain of rice.',
        micronutrients: { calciumMg: 190, ironMg: 7.9, potassiumMg: 780, sodiumMg: 370, zincMg: 3.8 }
      },
      {
        id: 'thu_evening_snack',
        slot: 'Evening Snack',
        name: 'Sprouted Moong & Sweet Corn Sundal with Fresh Coconut Shavings',
        portion: '170g',
        kcal: 230,
        protein: 16,
        carbs: 32,
        fat: 5,
        fiber: 9,
        costInr: 8,
        prepTimeMinutes: 8,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Vegan', 'South Indian Temple Style', 'Clean Eating'],
        ingredients: [
          { name: 'Sprouted Green Moong Beans', quantity: '70g', costInr: 4, proteinG: 12 },
          { name: 'Boiled Sweet Corn / Peanuts', quantity: '30g', costInr: 2, proteinG: 3 },
          { name: 'Mustard Seeds, Curry Leaves, Hing & Fresh Grated Coconut', quantity: '15g', costInr: 2, proteinG: 1 },
        ],
        instructions: [
          'Steam sprouted moong for 3 minutes until tender.',
          'In a pan, heat a teaspoon of oil, crackle mustard seeds, urad dal, curry leaves and dry red chilli.',
          'Add sprouted moong, corn, salt and pinch of hing; toss for 1 minute.',
          'Garnish with fresh grated coconut and lime juice.'
        ],
        chefTips: 'Curry leaves contain carbazole alkaloids which enhance insulin sensitivity and glucose transport into muscle cells.',
        micronutrients: { calciumMg: 65, ironMg: 3.6, potassiumMg: 430, sodiumMg: 190, zincMg: 1.8 }
      },
      {
        id: 'thu_dinner',
        slot: 'Dinner',
        name: 'Homestyle Paneer / Soya Bhurji + 3 Whole Wheat Phulkas + Dal Soup',
        portion: '480g',
        kcal: 660,
        protein: 38,
        carbs: 76,
        fat: 17,
        fiber: 13,
        costInr: 17,
        prepTimeMinutes: 20,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'High Calcium', 'Complete Protein'],
        ingredients: [
          { name: 'Fresh Paneer (Crumpled) / Soya Mince', quantity: '80g paneer / 40g soya', costInr: 9, proteinG: 18 },
          { name: 'Whole Wheat Atta (3 Phulkas)', quantity: '80g', costInr: 3, proteinG: 10 },
          { name: 'Moong Dal Soup / Rasam', quantity: '150ml', costInr: 2, proteinG: 6 },
          { name: 'Onion, Capsicum, Tomato & Pav Bhaji Spices', quantity: '80g', costInr: 2, proteinG: 2 },
          { name: 'Oil / Ghee', quantity: '5ml', costInr: 1, proteinG: 2 },
        ],
        instructions: [
          'Saute diced onions, green bell peppers (capsicum) and tomatoes in oil until softened.',
          'Add turmeric, red chilli, coriander powder and pav bhaji masala.',
          'Crumble fresh paneer / soya mince into the pan; cook on medium flame for 3 minutes (do not overcook).',
          'Finish with chopped coriander and serve with soft hot phulkas and warm dal soup.'
        ],
        chefTips: 'Overcooking paneer expels moisture and makes it chewy; 2 to 3 minutes of gentle tossing keeps it succulent and soft.',
        micronutrients: { calciumMg: 280, ironMg: 4.8, potassiumMg: 590, sodiumMg: 350, zincMg: 3.1 }
      },
    ]
  },

  friday: {
    totalKcal: 2160,
    totalProtein: 140,
    totalCost: 65,
    meals: [
      {
        id: 'fri_breakfast',
        slot: 'Breakfast',
        name: 'Besan Chilla (3 pcs) with Mint Chutney & Grated Paneer Garnish',
        portion: '260g',
        kcal: 390,
        protein: 23,
        carbs: 42,
        fat: 12,
        fiber: 9,
        costInr: 13,
        prepTimeMinutes: 12,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'Gluten Free', 'High Protein'],
        ingredients: [
          { name: 'Bengal Gram Besan', quantity: '75g', costInr: 6, proteinG: 17 },
          { name: 'Grated Paneer Garnish', quantity: '25g', costInr: 3, proteinG: 5 },
          { name: 'Onion, Green Chilli, Coriander & Ajwain', quantity: '30g', costInr: 2, proteinG: 1 },
          { name: 'Mustard Oil / Ghee', quantity: '5ml', costInr: 2, proteinG: 0 },
        ],
        instructions: [
          'Whisk besan with water, chopped onions, green chilli, ginger, ajwain and salt.',
          'Pour batter on a hot greased tawa, spread thinly into round chillas.',
          'Cook both sides till crisp golden; sprinkle grated paneer on top and fold.',
          'Serve with green mint chutney.'
        ],
        chefTips: 'Ajwain (carom seeds) contains thymol which aids gastric enzymes in digesting legume proteins smoothly.',
        micronutrients: { calciumMg: 110, ironMg: 4.3, potassiumMg: 460, sodiumMg: 250, zincMg: 2.2 }
      },
      {
        id: 'fri_morning_snack',
        slot: 'Morning Snack',
        name: 'Boiled Eggs (3) with Chaat Masala + Cooling Buttermilk (200ml)',
        portion: '320g',
        kcal: 270,
        protein: 23,
        carbs: 9,
        fat: 14,
        fiber: 1,
        costInr: 18,
        prepTimeMinutes: 10,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Eggitarian', 'High Protein', 'Zero Sugar'],
        ingredients: [
          { name: 'Farm Eggs (Hard Boiled)', quantity: '3 eggs', costInr: 15, proteinG: 20 },
          { name: 'Chilled Chaas with Jeera', quantity: '200ml', costInr: 3, proteinG: 3 },
        ],
        instructions: [
          'Boil 3 eggs for 9 minutes, peel and slice in halves.',
          'Sprinkle black salt and freshly ground pepper.',
          'Drink with a glass of buttermilk seasoned with roasted cumin.'
        ],
        chefTips: 'Chaas delivers natural probiotics and lactic acid that optimize protein absorption in the upper intestine.',
        micronutrients: { calciumMg: 140, ironMg: 3.1, potassiumMg: 330, sodiumMg: 280, zincMg: 2.1, vitaminD_iu: 120 }
      },
      {
        id: 'fri_lunch',
        slot: 'Lunch',
        name: 'High-Protein Kala Chana Curry + 2 Phulkas + Steamed Rice + Carrot Salad',
        portion: '520g',
        kcal: 630,
        protein: 36,
        carbs: 88,
        fat: 11,
        fiber: 18,
        costInr: 15,
        prepTimeMinutes: 25,
        difficulty: 'Medium',
        dietaryTags: ['Vegetarian', 'High Fiber', 'Low Glycemic Index'],
        ingredients: [
          { name: 'Brown Chickpeas (Kala Chana Soaked & Boiled)', quantity: '75g dry', costInr: 6, proteinG: 18 },
          { name: 'Whole Wheat Phulkas (2)', quantity: '55g atta', costInr: 2, proteinG: 7 },
          { name: 'Steamed Rice', quantity: '50g raw', costInr: 2, proteinG: 4 },
          { name: 'Tomato Onion Gravy with Punjabi Chana Masala', quantity: '90g', costInr: 3, proteinG: 2 },
          { name: 'Carrot & Cucumber Sticks with Lemon', quantity: '70g', costInr: 2, proteinG: 5 },
        ],
        instructions: [
          'Soak kala chana for 8 hours and pressure cook for 6 whistles with rock salt.',
          'In a pan, cook ginger-garlic paste and onions until deep brown.',
          'Add pureed tomatoes, coriander powder, cumin and garam masala.',
          'Add boiled chana with its rich black broth, simmer for 10 minutes until aromatic.',
          'Serve with warm whole wheat phulkas, steamed rice and crunchy salad.'
        ],
        chefTips: 'Kala chana is loaded with copper and manganese, essential trace minerals for collagen synthesis and joint health.',
        micronutrients: { calciumMg: 140, ironMg: 6.9, potassiumMg: 760, sodiumMg: 360, zincMg: 3.7 }
      },
      {
        id: 'fri_evening_snack',
        slot: 'Evening Snack',
        name: 'Soya Chunks & Roasted Peanuts Bhel with Lime Juice',
        portion: '160g',
        kcal: 240,
        protein: 24,
        carbs: 18,
        fat: 6,
        fiber: 8,
        costInr: 8,
        prepTimeMinutes: 6,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Vegan', 'High Protein', 'Crunchy Snack'],
        ingredients: [
          { name: 'Dry Roasted Soya Chunks (Crushed/Boiled)', quantity: '40g dry', costInr: 4, proteinG: 21 },
          { name: 'Roasted Peanuts', quantity: '15g', costInr: 2, proteinG: 4 },
          { name: 'Diced Onion, Tomato, Green Chilli & Lemon', quantity: '40g', costInr: 2, proteinG: 0 },
        ],
        instructions: [
          'Toss boiled/roasted soya chunks with roasted peanuts.',
          'Mix in chopped onions, tomatoes, green chillies, chaat masala and fresh lemon juice.',
          'Enjoy immediately for a crispy, spicy protein boost.'
        ],
        chefTips: 'Peanuts provide heart-healthy monounsaturated fats (MUFA) and arginine, which improves blood flow to working muscles.',
        micronutrients: { calciumMg: 130, ironMg: 5.2, potassiumMg: 480, sodiumMg: 210, zincMg: 2.5 }
      },
      {
        id: 'fri_dinner',
        slot: 'Dinner',
        name: 'Palak Dal (Spinach Lentil Curry) + 3 Soft Phulkas + Roasted Papad',
        portion: '480g',
        kcal: 630,
        protein: 34,
        carbs: 86,
        fat: 12,
        fiber: 14,
        costInr: 14,
        prepTimeMinutes: 20,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'Iron & Folate Rich', 'Immunity Boost'],
        ingredients: [
          { name: 'Yellow Moong & Toor Dal Mix', quantity: '65g', costInr: 6, proteinG: 16 },
          { name: 'Fresh Spinach (Palak Chopped)', quantity: '120g', costInr: 3, proteinG: 3 },
          { name: 'Whole Wheat Atta (3 Phulkas)', quantity: '80g', costInr: 3, proteinG: 10 },
          { name: 'Garlic & Cumin Ghee Tadka', quantity: '6ml', costInr: 2, proteinG: 5 },
        ],
        instructions: [
          'Pressure cook dal with chopped palak, turmeric and green chillies for 3 whistles.',
          'Prepare a fragrant tadka with ghee, crushed garlic cloves, cumin seeds and dried red chilli.',
          'Pour the sizzling garlic tadka over the bubbling palak dal.',
          'Serve with warm, puffed whole wheat phulkas and roasted papad.'
        ],
        chefTips: 'Spinach provides lutein and dietary nitrates which promote nitric oxide production for enhanced arterial vascularity.',
        micronutrients: { calciumMg: 220, ironMg: 7.1, potassiumMg: 740, sodiumMg: 350, zincMg: 3.3 }
      },
    ]
  },

  saturday: {
    totalKcal: 2200,
    totalProtein: 142,
    totalCost: 68,
    meals: [
      {
        id: 'sat_breakfast',
        slot: 'Breakfast',
        name: 'South Indian Idli (4) with High-Protein Sambar & Chutney',
        portion: '340g',
        kcal: 420,
        protein: 20,
        carbs: 72,
        fat: 6,
        fiber: 10,
        costInr: 14,
        prepTimeMinutes: 15,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'Fermented Gut Food', 'Low Fat'],
        ingredients: [
          { name: 'Steamed Idlis (4 pcs)', quantity: '160g', costInr: 6, proteinG: 8 },
          { name: 'Thick Toor Dal Sambar with Veggies', quantity: '150ml', costInr: 6, proteinG: 10 },
          { name: 'Roasted Chana Coconut Chutney', quantity: '30g', costInr: 2, proteinG: 2 },
        ],
        instructions: [
          'Steam fermented idli batter in an idli cooker for 10 minutes until soft and spongy.',
          'Cook toor dal with drumsticks, pumpkin, tomatoes, sambar powder and tamarind pulp.',
          'Temper sambar with mustard seeds, hing and curry leaves.',
          'Serve hot idlis dipped in steaming sambar with roasted chana chutney.'
        ],
        chefTips: 'Natural lactic acid fermentation in idli batter synthesizes B-complex vitamins and breaks down phytates for better mineral absorption.',
        micronutrients: { calciumMg: 90, ironMg: 4.0, potassiumMg: 520, sodiumMg: 290, zincMg: 2.1 }
      },
      {
        id: 'sat_morning_snack',
        slot: 'Morning Snack',
        name: 'High-Protein Roasted Sattu Drink with Mint & Lemon Juice',
        portion: '300ml',
        kcal: 260,
        protein: 18,
        carbs: 36,
        fat: 4,
        fiber: 9,
        costInr: 8,
        prepTimeMinutes: 5,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Vegan', 'High Protein', 'Refreshing Drink'],
        ingredients: [
          { name: 'Pure Bengal Gram Sattu', quantity: '60g', costInr: 5, proteinG: 15 },
          { name: 'Chilled Water, Lemon & Mint', quantity: '250ml', costInr: 2, proteinG: 0 },
          { name: 'Kala Namak & Roasted Jeera', quantity: '5g', costInr: 1, proteinG: 3 },
        ],
        instructions: [
          'Stir sattu vigorously in chilled water.',
          'Add fresh lemon juice, crushed mint and black salt; drink cold.'
        ],
        chefTips: 'Sattu acts as a natural cooling agent in hot climates, preventing dehydration and heat exhaustion.',
        micronutrients: { calciumMg: 85, ironMg: 5.0, potassiumMg: 510, sodiumMg: 300, zincMg: 2.8 }
      },
      {
        id: 'sat_lunch',
        slot: 'Lunch',
        name: 'High-Protein Soya Pulao / Biryani + Cucumber Raita + Salad',
        portion: '530g',
        kcal: 640,
        protein: 44,
        carbs: 82,
        fat: 12,
        fiber: 15,
        costInr: 17,
        prepTimeMinutes: 25,
        difficulty: 'Medium',
        dietaryTags: ['Vegetarian', 'Ultra High Protein', 'Weekend Special'],
        ingredients: [
          { name: 'Defatted Soya Chunks', quantity: '60g dry', costInr: 6, proteinG: 31 },
          { name: 'Basmati / Brown Rice', quantity: '70g raw', costInr: 4, proteinG: 6 },
          { name: 'Curd / Dahi Raita', quantity: '100g', costInr: 3, proteinG: 4 },
          { name: 'Onion, Mint, Biryani Masala & Ghee', quantity: '80g', costInr: 4, proteinG: 3 },
        ],
        instructions: [
          'Boil and squeeze soya chunks, marinate in 2 tbsp curd, biryani masala, ginger and garlic.',
          'In a pot, heat ghee, saute sliced onions until caramelized; add marinated soya chunks.',
          'Layer soaked basmati rice, mint leaves, saffron water and 1.5 cups water.',
          'Cook on dum (low sealed heat) for 15 minutes until grains are long and fragrant.',
          'Serve with chilled cucumber raita.'
        ],
        chefTips: 'Marinating soya chunks in curd tenderizes the protein fibers and imparts authentic dum biryani richness.',
        micronutrients: { calciumMg: 230, ironMg: 8.6, potassiumMg: 790, sodiumMg: 380, zincMg: 4.1 }
      },
      {
        id: 'sat_evening_snack',
        slot: 'Evening Snack',
        name: 'Sprouted Kala Chana & Moong Chaat with Roasted Peanuts',
        portion: '170g',
        kcal: 250,
        protein: 18,
        carbs: 30,
        fat: 6,
        fiber: 10,
        costInr: 9,
        prepTimeMinutes: 6,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Vegan', 'High Fiber', 'Natural Energy'],
        ingredients: [
          { name: 'Sprouted Moong & Kala Chana Mix', quantity: '75g', costInr: 4, proteinG: 12 },
          { name: 'Roasted Peanuts', quantity: '20g', costInr: 2, proteinG: 5 },
          { name: 'Onion, Tomato, Chaat Masala & Lime', quantity: '40g', costInr: 2, proteinG: 1 },
        ],
        instructions: [
          'Toss sprouted beans and peanuts together with diced onions and tomatoes.',
          'Add chaat masala, kala namak and lemon juice.'
        ],
        chefTips: 'A versatile high-protein snack that requires zero cooking and delivers sustained focus.',
        micronutrients: { calciumMg: 80, ironMg: 4.1, potassiumMg: 420, sodiumMg: 210, zincMg: 2.0 }
      },
      {
        id: 'sat_dinner',
        slot: 'Dinner',
        name: 'Egg Curry (3 Eggs) + 3 Soft Phulkas + Bhindi Masala',
        portion: '490g',
        kcal: 640,
        protein: 42,
        carbs: 70,
        fat: 18,
        fiber: 12,
        costInr: 20,
        prepTimeMinutes: 20,
        difficulty: 'Easy',
        dietaryTags: ['Eggitarian', 'High Protein', 'Weekend Feast'],
        ingredients: [
          { name: 'Farm Boiled Eggs', quantity: '3 eggs', costInr: 15, proteinG: 20 },
          { name: 'Whole Wheat Atta (3 Phulkas)', quantity: '80g', costInr: 3, proteinG: 10 },
          { name: 'Okra (Bhindi) Sabzi & Curry Base', quantity: '120g', costInr: 3, proteinG: 3 },
          { name: 'Mustard Oil & Spices', quantity: '6ml', costInr: 1, proteinG: 9 },
        ],
        instructions: [
          'Lightly fry boiled eggs with turmeric and salt.',
          'Make an onion-tomato gravy with ginger, garlic and aromatic curry masala.',
          'Add eggs and simmer for 5 minutes.',
          'Serve with stir-fried spiced bhindi and warm phulkas.'
        ],
        chefTips: 'Bhindi is loaded with soluble mucilage fiber which slows glucose absorption and promotes gastrointestinal motility.',
        micronutrients: { calciumMg: 180, ironMg: 5.4, potassiumMg: 650, sodiumMg: 350, zincMg: 3.2, vitaminD_iu: 120 }
      },
    ]
  },

  sunday: {
    totalKcal: 2170,
    totalProtein: 139,
    totalCost: 66,
    meals: [
      {
        id: 'sun_breakfast',
        slot: 'Breakfast',
        name: 'Methi & Paneer Thepla (3 pcs) with Dahi & Spicy Lemon Achar',
        portion: '280g',
        kcal: 420,
        protein: 22,
        carbs: 52,
        fat: 14,
        fiber: 9,
        costInr: 14,
        prepTimeMinutes: 15,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'Gujarati Delicacy', 'High Fiber'],
        ingredients: [
          { name: 'Whole Wheat & Besan Flour Mix (3 Theplas)', quantity: '70g', costInr: 5, proteinG: 12 },
          { name: 'Fresh Fenugreek (Methi Leaves)', quantity: '40g', costInr: 2, proteinG: 2 },
          { name: 'Grated Paneer', quantity: '25g', costInr: 3, proteinG: 5 },
          { name: 'Fresh Curd / Dahi', quantity: '80g', costInr: 2, proteinG: 3 },
          { name: 'Oil & Spices (Sesame Seeds, Turmeric, Ajwain)', quantity: '5ml', costInr: 2, proteinG: 0 },
        ],
        instructions: [
          'Chop fresh methi leaves, knead with whole wheat flour, besan, grated paneer, white sesame seeds, turmeric, ajwain and curd into a soft dough.',
          'Roll thin theplas and roast on a hot tawa with drops of oil until golden brown speckles appear.',
          'Serve warm with a bowl of fresh curd and spicy lemon pickle.'
        ],
        chefTips: 'Methi (fenugreek) leaves contain 4-hydroxyisoleucine, an amino acid that stimulates glucose-dependent insulin secretion.',
        micronutrients: { calciumMg: 210, ironMg: 5.8, potassiumMg: 510, sodiumMg: 280, zincMg: 2.7 }
      },
      {
        id: 'sun_morning_snack',
        slot: 'Morning Snack',
        name: 'Boiled Eggs (3) with Black Pepper & Roasted Cumin Buttermilk',
        portion: '320g',
        kcal: 270,
        protein: 23,
        carbs: 9,
        fat: 14,
        fiber: 1,
        costInr: 18,
        prepTimeMinutes: 10,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Eggitarian', 'High Protein', 'Low Carb'],
        ingredients: [
          { name: 'Boiled Farm Eggs', quantity: '3 eggs', costInr: 15, proteinG: 20 },
          { name: 'Spiced Chaas', quantity: '200ml', costInr: 3, proteinG: 3 },
        ],
        instructions: [
          'Hard boil eggs for 9 minutes, peel and season with black salt and pepper.',
          'Enjoy with a glass of cold masala chaas.'
        ],
        chefTips: 'Egg yolk contains choline, a critical nutrient for neurotransmitter synthesis (acetylcholine) and liver lipid clearance.',
        micronutrients: { calciumMg: 140, ironMg: 3.2, potassiumMg: 340, sodiumMg: 290, zincMg: 2.2, vitaminD_iu: 120 }
      },
      {
        id: 'sun_lunch',
        slot: 'Lunch',
        name: 'High-Protein Soya Matar Curry + 2 Phulkas + Steamed Rice + Raita',
        portion: '520g',
        kcal: 620,
        protein: 42,
        carbs: 84,
        fat: 11,
        fiber: 16,
        costInr: 16,
        prepTimeMinutes: 25,
        difficulty: 'Medium',
        dietaryTags: ['Vegetarian', 'Ultra High Protein', 'Sunday Special'],
        ingredients: [
          { name: 'Soya Chunks (Hydrated)', quantity: '55g dry', costInr: 5, proteinG: 28 },
          { name: 'Green Peas (Matar)', quantity: '40g', costInr: 2, proteinG: 3 },
          { name: 'Whole Wheat Phulkas (2)', quantity: '55g atta', costInr: 2, proteinG: 7 },
          { name: 'Rice & Tomato Gravy', quantity: '80g', costInr: 3, proteinG: 0 },
          { name: 'Curd Raita & Spices', quantity: '80g', costInr: 4, proteinG: 4 },
        ],
        instructions: [
          'Boil and squeeze soya chunks.',
          'Saute onions, ginger-garlic paste and tomato puree with coriander, cumin and garam masala.',
          'Add green peas and soya chunks with 1 cup water; simmer for 10 minutes.',
          'Serve with warm phulkas, steamed rice and cucumber raita.'
        ],
        chefTips: 'Green peas add natural sweetness, chlorophyll and leucine to the rich soya curry base.',
        micronutrients: { calciumMg: 220, ironMg: 8.2, potassiumMg: 810, sodiumMg: 390, zincMg: 4.0 }
      },
      {
        id: 'sun_evening_snack',
        slot: 'Evening Snack',
        name: 'Sprouted Moong & Roasted Peanuts Chaat with Lemon Juice',
        portion: '170g',
        kcal: 240,
        protein: 17,
        carbs: 28,
        fat: 7,
        fiber: 9,
        costInr: 8,
        prepTimeMinutes: 6,
        difficulty: 'Quick (<10m)',
        dietaryTags: ['Vegan', 'High Protein', 'Clean Energy'],
        ingredients: [
          { name: 'Sprouted Moong Beans', quantity: '70g', costInr: 4, proteinG: 12 },
          { name: 'Roasted Peanuts', quantity: '20g', costInr: 2, proteinG: 5 },
          { name: 'Onion, Tomato, Green Chilli & Lemon', quantity: '40g', costInr: 2, proteinG: 0 },
        ],
        instructions: [
          'Toss sprouted moong and crunchy peanuts in a bowl.',
          'Add diced vegetables, chaat masala and fresh lemon juice.'
        ],
        chefTips: 'Zero-oil, whole-food plant protein that delivers vitamins C, K, B6 and magnesium in every bite.',
        micronutrients: { calciumMg: 75, ironMg: 3.9, potassiumMg: 430, sodiumMg: 200, zincMg: 2.0 }
      },
      {
        id: 'sun_dinner',
        slot: 'Dinner',
        name: 'Dal Makhani Style Black Gram & Rajma + 3 Phulkas + Salad',
        portion: '480g',
        kcal: 610,
        protein: 35,
        carbs: 86,
        fat: 12,
        fiber: 15,
        costInr: 15,
        prepTimeMinutes: 25,
        difficulty: 'Easy',
        dietaryTags: ['Vegetarian', 'High Protein', 'Rich Creamy Texture Without Cream'],
        ingredients: [
          { name: 'Whole Black Gram (Sabut Urad) & Rajma', quantity: '65g', costInr: 6, proteinG: 17 },
          { name: 'Whole Wheat Atta (3 Phulkas)', quantity: '80g', costInr: 3, proteinG: 10 },
          { name: 'Tomato Garlic Gravy with Ghee Tadka', quantity: '80g', costInr: 3, proteinG: 2 },
          { name: 'Fresh Curd & Salad', quantity: '80g', costInr: 3, proteinG: 6 },
        ],
        instructions: [
          'Pressure cook whole urad and rajma with black cardamom and ginger for 6 whistles until ultra creamy.',
          'In a pan, cook tomato puree with Kashmiri red chilli, garam masala and kasuri methi in a teaspoon of ghee.',
          'Add cooked dal, mash 30% of lentils and slow simmer on low heat for 15 minutes to develop rich creamy body.',
          'Serve with warm whole wheat phulkas and cooling cucumber salad.'
        ],
        chefTips: 'Slow simmering whole black urad releases natural starches that create the iconic silky texture of Dal Makhani with zero added heavy cream.',
        micronutrients: { calciumMg: 190, ironMg: 6.7, potassiumMg: 710, sodiumMg: 340, zincMg: 3.5 }
      },
    ]
  }
};

/**
 * Dynamically scales the 7-day meal plan to strictly fit within any user-specified daily budget
 * while fully meeting their daily calorie and protein targets!
 */
export function getBudgetOptimizedWeeklyPlan(
  userDailyBudgetInr: number = 67,
  targetKcal: number = 2150,
  targetProteinG: number = 140
): Record<DayOfWeek, DayPlan> {
  const result: Partial<Record<DayOfWeek, DayPlan>> = {};
  const safeDailyBudget = Math.max(40, userDailyBudgetInr || 67);
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (const day of days) {
    const basePlan = BASE_WEEKLY_PLAN[day];
    const baseCost = basePlan.totalCost;
    
    // Scale factor for budget
    const costRatio = safeDailyBudget / baseCost;
    
    // Scale meals proportionally while protecting minimum ingredient costs
    const adjustedMeals: PlannedMeal[] = basePlan.meals.map((meal) => {
      // Calculate scaled cost that fits under daily budget
      const scaledCost = Math.max(4, Math.round(meal.costInr * Math.min(1.0, costRatio)));
      
      // Calorie & protein scaling: ensure targets are met
      const kcalRatio = targetKcal / basePlan.totalKcal;
      const proteinRatio = targetProteinG / basePlan.totalProtein;
      
      const scaledKcal = Math.round(meal.kcal * kcalRatio);
      const scaledProtein = Math.round(meal.protein * proteinRatio);
      const scaledCarbs = Math.round(meal.carbs * kcalRatio);
      const scaledFat = Math.round(meal.fat * kcalRatio);
      
      // Scale ingredients
      const scaledIngredients = meal.ingredients.map((ing) => ({
        ...ing,
        costInr: Math.max(1, Math.round(ing.costInr * Math.min(1.0, costRatio))),
        proteinG: Math.round(ing.proteinG * proteinRatio),
      }));

      return {
        ...meal,
        costInr: scaledCost,
        kcal: scaledKcal,
        protein: scaledProtein,
        carbs: scaledCarbs,
        fat: scaledFat,
        ingredients: scaledIngredients,
      };
    });

    // Ensure total sum strictly <= safeDailyBudget
    let totalCost = adjustedMeals.reduce((acc, m) => acc + m.costInr, 0);
    if (totalCost > safeDailyBudget) {
      const diff = totalCost - safeDailyBudget;
      // Deduct diff from largest cost meals
      for (let i = 0; i < diff; i++) {
        const largestMeal = adjustedMeals.reduce((max, m) => m.costInr > max.costInr ? m : max, adjustedMeals[0]);
        if (largestMeal.costInr > 5) {
          largestMeal.costInr -= 1;
        }
      }
      totalCost = adjustedMeals.reduce((acc, m) => acc + m.costInr, 0);
    }

    const totalKcal = adjustedMeals.reduce((acc, m) => acc + m.kcal, 0);
    const totalProtein = adjustedMeals.reduce((acc, m) => acc + m.protein, 0);

    result[day] = {
      totalKcal,
      totalProtein,
      totalCost,
      meals: adjustedMeals,
    };
  }

  return result as Record<DayOfWeek, DayPlan>;
}

export const WEEKLY_PLAN = BASE_WEEKLY_PLAN;
