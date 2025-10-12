import type { Recipe, ThoughtStep } from "./types";

export const sampleRecipe: Recipe = {
    title: "Classic Margherita Pizza",
    description:
        "A timeless Italian classic featuring a crispy thin crust, tangy tomato sauce, creamy mozzarella, and fresh basil. Simple yet absolutely delicious.",
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    difficulty: "medium",
    ingredients: [
        { item: "pizza dough", amount: "500g", category: "grain" },
        { item: "crushed tomatoes", amount: "400g", category: "vegetable" },
        { item: "fresh mozzarella cheese", amount: "250g", category: "dairy" },
        { item: "fresh basil leaves", amount: "1 handful", category: "vegetable" },
        { item: "extra virgin olive oil", amount: "3 tbsp", category: "other" },
        { item: "garlic cloves, minced", amount: "2", category: "vegetable" },
        { item: "salt", amount: "to taste", category: "spice" },
        { item: "black pepper", amount: "to taste", category: "spice" },
        { item: "dried oregano", amount: "1 tsp", category: "spice" },
    ],
    steps: [
        {
            stepNumber: 1,
            instruction:
                "Preheat your oven to the highest temperature (usually 250°C/480°F). If you have a pizza stone, place it in the oven to heat up.",
            duration: 5,
        },
        {
            stepNumber: 2,
            instruction:
                "Make the sauce by combining crushed tomatoes, minced garlic, 1 tablespoon of olive oil, oregano, salt, and pepper in a bowl. Mix well and set aside.",
            duration: 5,
        },
        {
            stepNumber: 3,
            instruction:
                "Divide the pizza dough into 2-4 portions depending on how large you want your pizzas. On a floured surface, stretch or roll each portion into a thin circle, about 25-30cm in diameter.",
            duration: 10,
        },
        {
            stepNumber: 4,
            instruction:
                "Transfer the dough to a pizza peel or baking sheet lined with parchment paper. Spread a thin layer of tomato sauce over the dough, leaving a 1cm border around the edges.",
            duration: 3,
        },
        {
            stepNumber: 5,
            instruction:
                "Tear the mozzarella into small pieces and distribute evenly over the sauce. Drizzle with a bit of olive oil.",
            duration: 2,
        },
        {
            stepNumber: 6,
            instruction:
                "Carefully slide the pizza onto the preheated pizza stone or place the baking sheet in the oven. Bake for 10-15 minutes until the crust is golden and the cheese is bubbling.",
            duration: 15,
        },
        {
            stepNumber: 7,
            instruction:
                "Remove from the oven and immediately top with fresh basil leaves and a final drizzle of extra virgin olive oil. Let cool for 2 minutes before slicing and serving.",
            duration: 2,
        },
    ],
    tips: [
        "For an even crispier crust, pre-bake the dough for 3-4 minutes before adding toppings.",
        "Use fresh mozzarella (not pre-shredded) for the best melting quality and authentic flavor.",
        "Don't overload the pizza with sauce or cheese - less is more for a traditional Margherita.",
        "If you don't have a pizza stone, flip a baking sheet upside down and use that as your baking surface.",
    ],
    nutritionEstimate: {
        calories: 320,
        protein: "14g",
        carbs: "42g",
        fat: "11g",
    },
    status: "complete",
    progress: 1,
};

export const sampleThoughtSteps: ThoughtStep[] = [
    {
        id: "1",
        title: "Understanding your request",
        description: "Analyzing requirements: classic Italian pizza, traditional approach",
        status: "completed",
    },
    {
        id: "2",
        title: "Identifying constraints",
        description: "Time: 35 minutes total, Difficulty: Medium, Cuisine: Italian",
        status: "completed",
    },
    {
        id: "3",
        title: "Searching recipe database",
        description: "Finding authentic Margherita pizza recipe",
        status: "completed",
        files: ["italian_recipes.json", "pizza_techniques.json"],
    },
    {
        id: "4",
        title: "Generating recipe details",
        description: "Creating ingredient list with proper measurements and step-by-step instructions",
        status: "completed",
    },
    {
        id: "5",
        title: "Adding helpful tips",
        description: "Including chef's tips and nutrition information",
        status: "completed",
    },
];




