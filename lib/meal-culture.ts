// Cultural meal timing and customs by country
export const MEAL_CULTURE = {
  Japan: {
    breakfast: "07:00-08:00",
    lunch: "12:00-13:00",
    dinner: "18:00-19:00",
    snack: "15:00",
    culture: "Japanese meals are typically light and balanced. Breakfast often includes rice, miso soup, and grilled fish. Lunch is the lightest meal. Dinner is the main meal, served early.",
    typical_portions: "Small, multiple dishes served together"
  },
  Thailand: {
    breakfast: "07:00-08:00",
    lunch: "12:00-13:00",
    dinner: "19:00-20:00",
    snack: "16:00",
    culture: "Thai food culture emphasizes fresh ingredients and bold flavors. Most meals include rice. Street food is common for snacks and light meals throughout the day.",
    typical_portions: "Medium portions with multiple shared dishes"
  },
  Mexico: {
    breakfast: "08:00-09:00",
    lunch: "14:00-15:00",
    dinner: "20:00-21:00",
    snack: "11:00",
    culture: "Lunch (comida) is the main meal in Mexico, often the largest and most important. Dinner (cena) is lighter. Breakfast can be substantial.",
    typical_portions: "Large lunch, lighter dinner"
  },
  Italy: {
    breakfast: "07:00-08:00",
    lunch: "13:00-14:00",
    dinner: "20:00-21:30",
    snack: "17:00",
    culture: "Italian meals are social events. Breakfast is light (cappuccino and cornetto). Lunch can be substantial. Dinner is late and includes multiple courses. Aperitivo culture before dinner.",
    typical_portions: "Multiple small courses, especially at dinner"
  },
  India: {
    breakfast: "08:00-09:00",
    lunch: "13:00-14:00",
    dinner: "20:00-21:00",
    snack: "17:00",
    culture: "Indian meals vary greatly by region but typically include multiple dishes served together. Meals are often vegetarian and spice-rich. Tea time is important.",
    typical_portions: "Multiple dishes with rice or bread as base"
  },
  France: {
    breakfast: "07:00-08:00",
    lunch: "12:30-14:00",
    dinner: "20:00-21:30",
    snack: "16:00",
    culture: "French dining emphasizes quality and presentation. Lunch can be leisurely. Dinner is late and structured (entrée, plat, dessert). Goûter (afternoon snack) for children.",
    typical_portions: "Multi-course meals, moderate portions"
  },
  Morocco: {
    breakfast: "07:00-08:00",
    lunch: "13:00-14:00",
    dinner: "20:00-21:00",
    snack: "17:00",
    culture: "Moroccan meals are communal and flavorful. Lunch is the main meal. Mint tea is served throughout the day. Couscous on Fridays is traditional.",
    typical_portions: "Large shared platters"
  },
  Peru: {
    breakfast: "07:00-08:00",
    lunch: "13:00-15:00",
    dinner: "20:00-21:00",
    snack: "17:00",
    culture: "Peruvian cuisine is diverse. Lunch is the main meal. Ceviche is typically eaten at lunch. Dinner is lighter. Inca Kola is a popular drink.",
    typical_portions: "Hearty portions, especially at lunch"
  },
  "South Korea": {
    breakfast: "07:00-08:00",
    lunch: "12:00-13:00",
    dinner: "18:00-19:00",
    snack: "15:00",
    culture: "Korean meals include rice, soup, and multiple banchan (side dishes). All meals are similarly substantial. Eating together is important.",
    typical_portions: "Multiple small dishes with rice"
  },
  Spain: {
    breakfast: "08:00-09:00",
    lunch: "14:00-16:00",
    dinner: "21:00-23:00",
    snack: "18:00",
    culture: "Spanish meal times are late by international standards. Lunch is the main meal and can last 2+ hours. Dinner is very late. Tapas culture for snacking. Siesta after lunch.",
    typical_portions: "Large lunch, tapas-style for dinner"
  },
  Turkey: {
    breakfast: "07:00-09:00",
    lunch: "12:30-14:00",
    dinner: "19:00-21:00",
    snack: "16:00",
    culture: "Turkish breakfast is elaborate and can last hours on weekends. Lunch is moderate. Dinner is the main meal. Tea (çay) is consumed throughout the day.",
    typical_portions: "Substantial breakfast, moderate other meals"
  },
  Vietnam: {
    breakfast: "06:30-07:30",
    lunch: "11:30-13:00",
    dinner: "18:00-19:00",
    snack: "15:00",
    culture: "Vietnamese meals are fresh and light. Breakfast often includes pho or bun. Street food is very common. Meals are quick but social. Fresh herbs in every meal.",
    typical_portions: "Light portions, fresh ingredients"
  },
  Greece: {
    breakfast: "07:00-08:00",
    lunch: "14:00-15:00",
    dinner: "21:00-22:00",
    snack: "17:00",
    culture: "Greek meals are Mediterranean-style, with olive oil, fresh vegetables, and fish. Lunch is substantial. Dinner is late and social. Meze culture for appetizers.",
    typical_portions: "Multiple shared dishes (meze style)"
  },
  Brazil: {
    breakfast: "07:00-08:00",
    lunch: "12:00-14:00",
    dinner: "19:00-21:00",
    snack: "16:00",
    culture: "Brazilian meals include rice and beans as staples. Lunch is the main meal (almoço). Churrasco (barbecue) is popular. Coffee breaks are frequent throughout the day.",
    typical_portions: "Large portions, especially lunch"
  },
  Colombia: {
    breakfast: "07:00-08:00",
    lunch: "12:00-14:00",
    dinner: "19:00-20:00",
    snack: "16:00",
    culture: "Colombian meals feature arepas, rice, and beans. Lunch is the main meal (almuerzo). Coffee culture is strong. Bandeja paisa is a traditional large meal.",
    typical_portions: "Hearty portions at lunch"
  },
}

export type DestinationKey = keyof typeof MEAL_CULTURE
