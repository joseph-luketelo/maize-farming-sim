// --- Growth Stages Mapping ---
export const GROWTH_STAGES = [
    "Germination",
    "Seedling",
    "Vegetative Growth",
    "Flowering",
    "Grain Filling",
    "Maturity (Harvest-Ready)"
];

// --- Emojis for Visualization ---
export const EMOJI = {
    'moisture': '💧',
    'health': '🌱',
    'fertilizer': '✨',
    'money': '💰',
    'maize': '🌽', // Maize units emoji
    'temp': '🌡️', // Thermometer emoji
    'rainfall': '🌧️', // Cloud with rain emoji
    'event': '📰',
    'decision': '✅',
    'survival': '💪', // Survival emoji
    'loss': '💔', // Loss emoji
    'error': '❌' // Error emoji
};

// --- Decisions ---
// Decisions now primarily influence stats
export const DECISIONS = [
    { 'description': 'Irrigate Farm', 'base_cost_per_unit': 0.05, 'effects': { 'moisture': +45 } }, // Cost per maize unit
    { 'description': 'Apply Fertilizer', 'base_cost_per_unit': 0.10, 'effects': { 'fertilizer_applied': 0.01 } }, // Cost per maize unit, amount applied per unit
    { 'description': 'Spray Pesticide', 'base_cost_per_unit': 0.08, 'effects': { 'health': +30 } }, // Cost per maize unit
    { 'description': 'Weed the Fields', 'base_cost_per_unit': 0.06, 'effects': { 'health': +15 } }, // Cost per maize unit
    { 'description': 'Do Nothing', 'base_cost_per_unit': 0, 'effects': {} },
    { 'description': 'Improve Drainage', 'base_cost_per_unit': 0.07, 'effects': { 'moisture': -10 } } // Cost per maize unit
];

// --- Events ---
// Events now include weather and primarily affect stats
export const EVENTS = [
    {
        'description': "A dry spell continues, the soil is parched. Your maize plants are showing signs of stress.",
        'effects': { 'moisture': -25, 'health': -10 },
        'avg_temp': 30, 'rainfall': 5
    }, // High temp, low rain
    {
        'description': "Unexpected heavy rains lash the farm. While moisture is high, there's a risk of waterlogging.",
        'effects': { 'moisture': +35, 'health': -5 }, // Small health penalty for potential waterlogging
        'avg_temp': 22, 'rainfall': 60
    }, // Moderate temp, high rain
    {
        'description': "You notice small insects on the leaves. It appears to be a mild pest infestation.",
        'effects': { 'health': -15 }, 'base_cost': 500, // Event can also have a base cost
        'avg_temp': 26, 'rainfall': 15
    }, // Moderate temp/rain
    {
        'description': "Large swarms of locusts have been reported in the region. Your farm is hit by a severe infestation.",
        'effects': { 'health': -40 }, 'base_cost': 1500,
        'avg_temp': 28, 'rainfall': 10
    }, // Moderate temp/rain
    {
        'description': "Global supply chain issues have driven up the cost of agricultural inputs.",
        'effects': { 'fertilizer_cost_multiplier': 1.7 },
        'avg_temp': 25, 'rainfall': 20
    }, // Moderate temp/rain
    {
        'description': "A new local supplier has entered the market, driving down fertilizer prices.",
        'effects': { 'fertilizer_cost_multiplier': 0.6 },
        'avg_temp': 24, 'rainfall': 25
    }, // Moderate temp/rain
    {
        'description': "Ideal temperatures and sunshine this week provide excellent growing conditions.",
        'effects': { 'health': +15 },
        'avg_temp': 27, 'rainfall': 18
    }, // Good growing weather
    {
        'description': "Persistent rain has encouraged rapid weed growth across the fields.",
        'effects': { 'health': -12 }, 'base_cost': 400,
        'avg_temp': 23, 'rainfall': 30
    }, // Cooler, wetter
    {
        'description': "Reports indicate a strong demand for maize at the national level.",
        'effects': { 'market_price_multiplier': 1.3 }, // Market events still exist but don't directly affect survival
        'avg_temp': 26, 'rainfall': 17
    }, // Moderate temp/rain
    {
        'description': "A surplus harvest in a neighboring region is expected to flood the market.",
        'effects': { 'market_price_multiplier': 0.75 }, // Market events still exist
        'avg_temp': 25, 'rainfall': 20
    }, // Moderate temp/rain
    {
        'description': "The week passes without any major environmental or market changes.",
        'effects': {},
        'avg_temp': 25, 'rainfall': 20
    } // Baseline moderate weather
];
