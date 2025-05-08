import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import SignIn from './/auth/SignIn'
// --- Game Configuration ---
const NUM_ROUNDS = 6; // Number of growth stages/weeks in the simulation
const INITIAL_MARKET_PRICE_RANGE = [20000, 40000]; // KES per ton (Still kept for potential future use or context, but not used in current outcome)
const DEFAULT_INITIAL_TEMP = 25; // Default temp for round 1 before event
const DEFAULT_INITIAL_RAINFALL = 20; // Default rainfall for round 1 before event
const BASE_SURVIVAL_RATE_PER_STAGE = 95; // Base percentage of maize units that survive each stage under ideal conditions
const DEFAULT_INITIAL_HEALTH = 100; // Default health to start with once germination occurs

// --- Growth Stages Mapping ---
const GROWTH_STAGES = [
    "Germination",
    "Seedling",
    "Vegetative Growth",
    "Flowering",
    "Grain Filling",
    "Maturity (Harvest-Ready)"
];

// --- Emojis for Visualization ---
const EMOJI = {
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
const DECISIONS = [
    { 'description': 'Irrigate Farm', 'base_cost_per_unit': 0.05, 'effects': { 'moisture': +45 } }, // Cost per maize unit
    { 'description': 'Apply Fertilizer', 'base_cost_per_unit': 0.10, 'effects': { 'fertilizer_applied': 0.01 } }, // Cost per maize unit, amount applied per unit
    { 'description': 'Spray Pesticide', 'base_cost_per_unit': 0.08, 'effects': { 'health': +30 } }, // Cost per maize unit
    { 'description': 'Weed the Fields', 'base_cost_per_unit': 0.06, 'effects': { 'health': +15 } }, // Cost per maize unit
    { 'description': 'Do Nothing', 'base_cost_per_unit': 0, 'effects': {} },
    { 'description': 'Improve Drainage', 'base_cost_per_unit': 0.07, 'effects': { 'moisture': -10 } } // Cost per maize unit
];

// Helper to find a decision object by its description
const getDecisionByDescription = (description) => {
    return DECISIONS.find(decision => decision.description === description);
};


// --- Events ---
// Events now include weather and primarily affect stats
const EVENTS = [
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

// Helper function to calculate decision cost
const calculateDecisionCost = (decision, maizeUnits, fertilizerCostMultiplier) => {
    let cost = 0;
    if ('base_cost' in decision) {
        cost = decision.base_cost;
    } else if ('base_cost_per_unit' in decision) {
        cost = decision.base_cost_per_unit * maizeUnits;
        // Adjust fertilizer cost if applying fertilizer
        if ('fertilizer_applied' in decision.effects) {
            cost *= fertilizerCostMultiplier;
        }
    }
    return cost;
};

// Helper function to apply event effects
const applyEventEffects = (stats, event) => {
    const newStats = { ...stats };
    const statChanges = {};
    let eventCost = 0;

    // Apply weather effects
    newStats.current_temp = event.avg_temp;
    newStats.current_rainfall = event.rainfall;
    statChanges['current_temp'] = event.avg_temp; // Record weather for summary
    statChanges['current_rainfall'] = event.rainfall; // Record weather for summary


    if ('effects' in event) {
        for (const stat in event.effects) {
            const value = event.effects[stat];
            if (stat in newStats) {
                const initialValue = newStats[stat];
                newStats[stat] += value;
                // Clamp stats
                if (stat === 'moisture' || stat === 'health') {
                    newStats[stat] = Math.max(0, Math.min(100, newStats[stat]));
                }
                statChanges[stat] = newStats[stat] - initialValue;
            } else if (stat === 'fertilizer_cost_multiplier') {
                newStats.fertilizer_cost_multiplier *= value;
                statChanges['fertilizer_cost_multiplier'] = value; // Store the factor change
            } else if (stat === 'market_price_multiplier') {
                newStats.market_price_multiplier *= value;
                statChanges['market_price_multiplier'] = value; // Store the factor change
            }
        }
    }

    if ('base_cost' in event) {
        eventCost = event.base_cost;
        const initialMoney = newStats.money;
        newStats.money -= eventCost;
        statChanges['money'] = (statChanges['money'] || 0) + (newStats.money - initialMoney);
    }


    return { newStats, statChanges, eventCost };
};

// Helper function to apply decision effects
const applyDecisionEffects = (stats, decision, maizeUnits) => {
    const newStats = { ...stats };
    const statChanges = {};
    let totalCostIncurred = 0;

    const cost = calculateDecisionCost(decision, maizeUnits, stats.fertilizer_cost_multiplier);

    if (newStats.money >= cost) {
        const initialMoney = newStats.money;
        newStats.money -= cost;
        totalCostIncurred = cost;
        statChanges['money'] = newStats.money - initialMoney;

        if ('effects' in decision) {
            for (const stat in decision.effects) {
                const value = decision.effects[stat];
                if (stat in newStats) {
                    const initialValue = newStats[stat];
                    newStats[stat] += value;
                    // Clamp stats
                    if (stat === 'moisture' || stat === 'health') {
                        newStats[stat] = Math.max(0, Math.min(100, newStats[stat]));
                    }
                    statChanges[stat] = (statChanges[stat] || 0) + (newStats[stat] - initialValue);
                } else if (stat === 'fertilizer_applied') {
                    const fertilizerNeededPerUnit = value; // Amount applied per maize unit
                    const totalFertilizerNeeded = fertilizerNeededPerUnit * maizeUnits;
                    if (newStats.fertilizer >= totalFertilizerNeeded) {
                        const initialFertilizer = newStats.fertilizer;
                        newStats.fertilizer -= totalFertilizerNeeded;
                        statChanges['fertilizer'] = (statChanges['fertilizer'] || 0) + (newStats.fertilizer - initialFertilizer);

                        // Applying fertilizer boosts health (simplified: fixed boost per amount applied per unit)
                        const initialHealth = newStats.health;
                        newStats.health += (fertilizerNeededPerUnit / 0.01) * 5; // Example: +5 health per 0.01 kg/unit
                        newStats.health = Math.max(0, Math.min(100, newStats.health));
                        statChanges['health'] = (statChanges['health'] || 0) + (newStats.health - initialHealth);
                    } else {
                        // Not enough fertilizer
                        // Indicate this in the summary or decision description
                    }
                }
            }
        }
    } else {
        // Not enough money - decision fails
        totalCostIncurred = 0; // No cost incurred if failed
        statChanges['money'] = 0; // No money change if failed
        // No other stat changes occur if money is insufficient
    }

    return { newStats, totalCostIncurred, statChanges };
};

// Helper function to calculate percentage
// Keeping this outside as it's a general utility
const calculatePercentage = (part, whole) => {
    if (whole === 0) return 0;
    return (part / whole) * 100;
};

// Helper function to capitalize the first letter of a string
// Keeping this outside as it's a general utility
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


function Home() {
      const navigate = useNavigate();

    // --- State Management ---
    const [farmStats, setFarmStats] = useState(null);
    const [initialFarmStats, setInitialFarmStats] = useState(null); // State to store initial stats
    const [maizeUnits, setMaizeUnits] = useState(null); // New state for maize units
    const [initialMaizeUnits, setInitialMaizeUnits] = useState(null); // Store initial maize units
    const [currentRound, setCurrentRound] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [decisionSummary, setDecisionSummary] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [currentGrowthStage, setCurrentGrowthStage] = useState(null); // New state for current stage
    // Use one state for the modal that shows both event and decisions
    const [showRoundModal, setShowRoundModal] = useState(false);
    const [gamePhase, setGamePhase] = useState('initial_input'); // 'initial_input', 'playing', 'game_over'

    // State for initial input form
    const [initialMoisture, setInitialMoisture] = useState('');
    // Removed initialHealth state
    const [initialFertilizer, setInitialFertilizer] = useState('');
    const [initialMoney, setInitialMoney] = useState('');
    const [initialMaizeUnitsInput, setInitialMaizeUnitsInput] = useState(''); // Input for maize units
    const [inputError, setInputError] = useState('');
    const [gameError, setGameError] = useState(null); // New state for game errors
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)

    // --- Helper Functions (Defined inside App for scope) ---

    // Helper function to apply simplified AquaCrop logic
    const applyAquaCropLogic = (stats) => {
        const newStats = { ...stats };
        const statChanges = {};

        // Low moisture affects health negatively
        if (newStats.moisture < 60) { // Adjusted threshold
            const initialHealth = newStats.health;
            const healthReduction = (60 - newStats.moisture) * 0.6; // Example: 0.6% penalty per % below 60
            newStats.health -= healthReduction;
            newStats.health = Math.max(0, Math.min(100, newStats.health));
            statChanges['health'] = (statChanges['health'] || 0) + (newStats.health - initialHealth);
        } else if (newStats.moisture > 90) {
            const initialHealth = newStats.health;
            const healthReduction = (newStats.moisture - 90) * 0.2; // Example: 0.2% penalty per % above 90 (waterlogging)
            newStats.health -= healthReduction;
            newStats.health = Math.max(0, Math.min(100, newStats.health));
            statChanges['health'] = (statChanges['health'] || 0) + (newStats.health - initialHealth);
        }


        // Low fertilizer affects health negatively
        // This is a simplification; a real model would track nutrient levels
        // Only apply penalty if fertilizer is low AND no fertilizer was applied this round (more complex check needed)
        // For simplicity here, let's apply a penalty if fertilizer is below a threshold per initial unit
        const fertilizerThresholdPerUnit = 0.05 * currentRound; // Example: Threshold increases each round
        // Ensure initial_maize_units is not zero or null before dividing
        const currentFertilizerPerUnit = (stats.initial_maize_units && stats.initial_maize_units > 0) ? stats.fertilizer / stats.initial_maize_units : 0;
        if (currentFertilizerPerUnit < fertilizerThresholdPerUnit) {
            const initialHealth = newStats.health;
            const healthReduction = (fertilizerThresholdPerUnit - currentFertilizerPerUnit) * 500; // Example: Penalty based on deficit
            newStats.health -= healthReduction;
            newStats.health = Math.max(0, Math.min(100, newStats.health));
            statChanges['health'] = (statChanges['health'] || 0) + (newStats.health - initialHealth);
        }


        // Ensure health stays within bounds
        newStats.health = Math.max(0, Math.min(100, newStats.health));


        return { newStats, statChanges };
    };

    // Helper function to calculate survival rate based on stats and stage
    const calculateSurvivalRate = (stats, currentRound) => {
        let survivalRate = BASE_SURVIVAL_RATE_PER_STAGE; // Start with base rate
        const survivalExplanation = []; // To explain the rate in the summary

        // --- Apply penalties based on stats (Simplified Model) ---

        // Moisture Penalty
        if (stats.moisture < 60) {
            const penalty = (60 - stats.moisture) * 0.5; // Example: 0.5% penalty per % below 60
            survivalRate -= penalty;
            survivalExplanation.push(`Low moisture (${stats.moisture.toFixed(1)}%) reduced survival by ${penalty.toFixed(1)}%.`);
        } else if (stats.moisture > 90) {
            const penalty = (stats.moisture - 90) * 0.2; // Example: 0.2% penalty per % above 90 (waterlogging)
            survivalRate -= penalty;
            survivalExplanation.push(`High moisture (${stats.moisture.toFixed(1)}%) reduced survival by ${penalty.toFixed(1)}% (waterlogging risk).`);
        }

        // Health Penalty
        if (stats.health < 70) {
            const penalty = (70 - stats.health) * 0.7; // Example: 0.7% penalty per % below 70
            survivalRate -= penalty;
            survivalExplanation.push(`Low health (${stats.health.toFixed(1)}%) reduced survival by ${penalty.toFixed(1)}%.`);
        }

        // Fertilizer Penalty (Simplified: penalty if below a threshold per unit)
        // This assumes a certain amount of fertilizer is needed per unit over time.
        // A more complex model would track accumulated nutrients.
        const fertilizerThresholdPerUnit = 0.05 * currentRound; // Example: Threshold increases each round
        // Ensure initial_maize_units is not zero or null before dividing
        const currentFertilizerPerUnit = (stats.initial_maize_units && stats.initial_maize_units > 0) ? stats.fertilizer / stats.initial_maize_units : 0;
        if (currentFertilizerPerUnit < fertilizerThresholdPerUnit) {
            const penalty = (fertilizerThresholdPerUnit - currentFertilizerPerUnit) * 1000; // Example: Large penalty if significantly below threshold
            survivalRate -= penalty;
            survivalExplanation.push(`Low fertilizer levels reduced survival by ${penalty.toFixed(1)}%.`);
        }


        // Temperature Penalty (Example: affects stages differently)
        if (currentRound === 1) { // Germination
            if (stats.current_temp < 20 || stats.current_temp > 35) {
                const penalty = Math.abs(stats.current_temp - (stats.current_temp < 20 ? 20 : 35)) * 1.0;
                survivalRate -= penalty;
                survivalExplanation.push(`Suboptimal temperature (${stats.current_temp}°C) for germination reduced survival by ${penalty.toFixed(1)}%.`);
            }
        } else if (currentRound === 4) { // Flowering
            if (stats.current_temp > 30 || stats.current_temp < 20) { // Flowering is sensitive to heat/cold
                const penalty = Math.abs(stats.current_temp - (stats.current_temp < 20 ? 20 : 30)) * 1.5;
                survivalRate -= penalty;
                survivalExplanation.push(`Suboptimal temperature (${stats.current_temp}°C) during flowering reduced survival by ${penalty.toFixed(1)}%.`);
            }
        } else { // Other stages (less sensitive)
            if (stats.current_temp < 15 || stats.current_temp > 38) {
                const penalty = Math.abs(stats.current_temp - (stats.current_temp < 15 ? 15 : 38)) * 0.5;
                survivalRate -= penalty;
                survivalExplanation.push(`Extreme temperature (${stats.current_temp}°C) reduced survival by ${penalty.toFixed(1)}%.`);
            }
        }

        // Rainfall Impact (Already affects moisture, so indirect impact on survival)
        // We can add direct rainfall impact if needed, e.g., very high rainfall causing physical damage.
        // For now, its effect is primarily through moisture.

        // Clamp survival rate between 0 and 100
        survivalRate = Math.max(0, Math.min(100, survivalRate));

        return { survivalRate, survivalExplanation };
    };


    // --- Game Logic ---

    // Function to start the game with initial conditions
    const startGame = () => {
        setGameError(null); // Clear previous errors
        const moisture = parseInt(initialMoisture);
        // Removed initialHealth input validation
        const fertilizer = parseFloat(initialFertilizer);
        const money = parseFloat(initialMoney);
        const initialUnits = parseInt(initialMaizeUnitsInput); // Get initial maize units

        if (isNaN(moisture) || isNaN(fertilizer) || isNaN(money) || isNaN(initialUnits) ||
            moisture < 0 || moisture > 100 || fertilizer < 0 || money < 0 || initialUnits <= 0) {
            setInputError("Please enter valid initial conditions.");
            return;
        }

        const initialStats = { // Store initial stats
            moisture: moisture,
            health: DEFAULT_INITIAL_HEALTH, // Initialize health with a default value
            fertilizer: fertilizer,
            money: money,
            fertilizer_cost_multiplier: 1.0,
            market_price_multiplier: 1.0, // Kept for context
            current_temp: DEFAULT_INITIAL_TEMP, // Initialize with default weather
            current_rainfall: DEFAULT_INITIAL_RAINFALL, // Initialize with default weather
            initial_maize_units: initialUnits // Store initial units in stats for calculations
        };

        setFarmStats(initialStats);
        setInitialFarmStats(initialStats); // Set initial stats state
        setMaizeUnits(initialUnits); // Set initial maize units
        setInitialMaizeUnits(initialUnits); // Store initial count
        setCurrentRound(1);
        setCurrentGrowthStage(GROWTH_STAGES[0]); // Set initial stage
        setTotalCost(0);
        setDecisionSummary([]);
        setGamePhase('playing');
        setInputError(''); // Clear any previous errors
    };

    // Effect to handle the start of a new round
    useEffect(() => {
        isLoggedIn? navigate('/') :  navigate('/login')
        if (currentRound > 0 && currentRound <= NUM_ROUNDS && farmStats !== null && maizeUnits !== null) {
            setCurrentGrowthStage(GROWTH_STAGES[currentRound - 1]); // Update growth stage
            // Apply random event
            const event = randomChoice(EVENTS);
            setCurrentEvent(event);
            setShowRoundModal(true); // Show the round modal
        } else if (currentRound > NUM_ROUNDS && farmStats !== null && initialMaizeUnits !== null) {
            // Game Over
            setGamePhase('game_over');
        }
    }, [currentRound, farmStats, maizeUnits, initialMaizeUnits]); // Depend on currentRound, farmStats, maizeUnits, initialMaizeUnits


    // Function to handle decision selection
    const handleDecision = (decision) => {
        setGameError(null); // Clear previous game errors
        if (!farmStats || !currentEvent || maizeUnits === null) {
            setGameError("Game state not ready."); // Indicate a state issue
            return; // Should not happen if UI is correct
        }

        try {
            // Apply event effects first, which now includes weather updates and potential cost
            const { newStats: statsAfterEvent, statChanges: eventChanges, eventCost } = applyEventEffects(farmStats, currentEvent);

            // Apply decision effects and get cost
            const { newStats: statsAfterDecision, totalCostIncurred: decisionCost, statChanges: decisionChanges } = applyDecisionEffects(statsAfterEvent, decision, maizeUnits);

            // Calculate total cost for the round
            const totalCostThisRound = eventCost + decisionCost;

            // Apply simplified AquaCrop logic (now defined inside App)
            const { newStats: finalStatsThisRound, statChanges: logicChanges } = applyAquaCropLogic(statsAfterDecision);


            // --- Calculate Survival Rate and Update Maize Units ---
            // Calculate survival rate (now defined inside App)
            const { survivalRate, survivalExplanation } = calculateSurvivalRate(finalStatsThisRound, currentRound);
            const survivingUnits = Math.round(maizeUnits * (survivalRate / 100));
            const unitsLost = maizeUnits - survivingUnits;

            // Update state for the next round
            setFarmStats(finalStatsThisRound);
            setMaizeUnits(survivingUnits); // Update maize units for next round
            setTotalCost(prevCost => prevCost + totalCostThisRound);


            // Combine changes for the summary
            const roundChanges = {};
            // Helper to combine changes, prioritizing later effects
            const combineChanges = (sourceChanges, targetChanges) => {
                for (const stat in sourceChanges) {
                    // For simplicity, later effects overwrite earlier ones for the same stat, except for money (which accumulates cost)
                    if (stat === 'money') {
                        targetChanges[stat] = (targetChanges[stat] || 0) + sourceChanges[stat];
                    } else {
                        targetChanges[stat] = sourceChanges[stat];
                    }
                }
            };

            combineChanges(eventChanges, roundChanges);
            combineChanges(decisionChanges, roundChanges); // Decision changes might overwrite or add
            combineChanges(logicChanges, roundChanges); // Logic changes might overwrite or add


            // Add round summary
            setDecisionSummary(prevSummary => [...prevSummary, {
                week: currentRound,
                stage: currentGrowthStage,
                event: currentEvent.description,
                decision: decision.description + (decisionCost === 0 && calculateDecisionCost(decision, maizeUnits, farmStats.fertilizer_cost_multiplier) > 0 && farmStats.money < calculateDecisionCost(decision, maizeUnits, farmStats.fertilizer_cost_multiplier) ? " (Failed - Not enough money)" : ""), // Indicate if decision failed due to money check before applying
                cost: totalCostThisRound,
                changes: roundChanges,
                weather: { // Include weather in summary
                    temp: currentEvent.avg_temp,
                    rainfall: currentEvent.rainfall
                },
                survival: { // Include survival details
                    initialUnits: maizeUnits,
                    survivingUnits: survivingUnits,
                    unitsLost: unitsLost,
                    survivalRate: survivalRate,
                    explanation: survivalExplanation // Explanation of factors affecting survival
                }
            }]);

            // Close round modal and advance to the next round
            setShowRoundModal(false);
            setCurrentRound(prevRound => prevRound + 1);

        } catch (error) {
            console.error("Error during handleDecision:", error); // Log to browser console if available
            setGameError(`An error occurred: ${error.message}`); // Display error on UI
        }
    };

    // Helper function for random choice
    const randomChoice = (arr) => {
        return arr[Math.floor(Math.random() * arr.length)];
    };


    // --- Render Logic ---

    // Render initial input form
    if (gamePhase === 'initial_input') {
        return isLoggedIn ?(
            <>
            <div className="bg-green-100 p-4 flex min-h-screen items-center justify-center">
                <div className="bg-white p-8 w-full max-w-md rounded-lg shadow-lg">
                    <h2 className="mb-6 text-green-800 text-center text-2xl font-bold">Start Your Farm</h2>
                    {inputError && <p className="text-red-500 mb-4 text-center">{inputError}</p>}
                    {/* Input for Initial Maize Units */}
                    <div className="mb-4">
                        <label className="text-gray-700 mb-2 block text-sm font-bold" htmlFor="initialMaizeUnits">
                            Initial Number of Maize Units (Seeds) {EMOJI['maize']}
                        </label>
                        <input
                            className="py-2 px-3 text-gray-700 w-full appearance-none rounded border leading-tight shadow focus:outline-none focus:shadow-outline"
                            id="initialMaizeUnits"
                            type="number"
                            value={initialMaizeUnitsInput}
                            onChange={(e) => setInitialMaizeUnitsInput(e.target.value)}
                            min="1"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-gray-700 mb-2 block text-sm font-bold" htmlFor="moisture">
                            Initial Soil Moisture (0-100) {EMOJI['moisture']}
                        </label>
                        <input
                            className="py-2 px-3 text-gray-700 w-full appearance-none rounded border leading-tight shadow focus:outline-none focus:shadow-outline"
                            id="moisture"
                            type="number"
                            value={initialMoisture}
                            onChange={(e) => setInitialMoisture(e.target.value)}
                            min="0"
                            max="100"
                        />
                    </div>
                    {/* Removed Initial Crop Health Input */}
                    <div className="mb-4">
                        <label className="text-gray-700 mb-2 block text-sm font-bold" htmlFor="fertilizer">
                            Initial Fertilizer Available (kg) {EMOJI['fertilizer']}
                        </label>
                        <input
                            className="py-2 px-3 text-gray-700 w-full appearance-none rounded border leading-tight shadow focus:outline-none focus:shadow-outline"
                            id="fertilizer"
                            type="number"
                            value={initialFertilizer}
                            onChange={(e) => setInitialFertilizer(e.target.value)}
                            min="0"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-gray-700 mb-2 block text-sm font-bold" htmlFor="money">
                            Initial Money Available (KES) {EMOJI['money']}
                        </label>
                        <input
                            className="py-2 px-3 text-gray-700 w-full appearance-none rounded border leading-tight shadow focus:outline-none focus:shadow-outline"
                            id="money"
                            type="number"
                            value={initialMoney}
                            onChange={(e) => setInitialMoney(e.target.value)}
                            min="0"
                        />
                    </div>

                    <div className="flex items-center justify-center">
                        <button
                            className="bg-green-500 text-white py-2 px-4 rounded font-bold hover:bg-green-700 focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={startGame}
                        >
                            Start Simulation
                        </button>
                    </div>
                </div>
            </div>
            </>
        ):
        <SignIn />;
    }

    // Render game over screen
    if (gamePhase === 'game_over' && farmStats && initialFarmStats && initialMaizeUnits !== null) { // Ensure initialMaizeUnits is available
        const finalMaizeUnits = maizeUnits !== null ? maizeUnits : 0; // Use final maizeUnits state
        const survivalPercentage = calculatePercentage(finalMaizeUnits, initialMaizeUnits);


        return (
            <div className="bg-green-100 p-4 flex min-h-screen items-center justify-center">
                <div className="bg-white p-8 w-full max-w-2xl rounded-lg shadow-lg">
                    <h2 className="mb-6 text-green-800 text-center text-2xl font-bold">Simulation Complete!</h2>

                    <div className="mb-6">
                        <h3 className="mb-2 text-green-700 text-xl font-semibold">Final Results</h3>
                        <p className="text-gray-700">{EMOJI['maize']} Maize Units Reached Harvest: {finalMaizeUnits}</p>
                        <p className="text-gray-700">{EMOJI['survival']} Survival Rate: {survivalPercentage.toFixed(1)}%</p>
                        <p className="text-gray-700">{EMOJI['money']} Final Money Available: KES {farmStats.money.toFixed(2)}</p>
                        <p className="text-gray-700">{EMOJI['cost']} Total Costs Incurred: KES {totalCost.toFixed(2)}</p>
                    </div>

                    <div className="mb-6">
                        <h3 className="mb-2 text-green-700 text-xl font-semibold">Growth Stage Summary</h3>
                        {decisionSummary.map((summary, index) => (
                            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md">
                                <p className="font-semibold">Week {summary.week}: {summary.stage}</p>
                                <p className="text-gray-600 text-sm">Event: {summary.event}</p>
                                {/* Display weather for the week */}
                                {summary.weather && (
                                    <p className="text-gray-600 text-sm">Weather: {EMOJI['temp']} {summary.weather.temp}°C, {EMOJI['rainfall']} {summary.weather.rainfall} mm</p>
                                )}
                                <p className="text-gray-600 text-sm">Decision: {summary.decision} (Cost: KES {summary.cost.toFixed(2)})</p>
                                <p className="mt-1 font-medium">Survival:</p>
                                {summary.survival && (
                                    <>
                                        <p className="text-gray-600 text-sm">{EMOJI['maize']} Units Entering Stage: {summary.survival.initialUnits}</p>
                                        <p className={`text-sm ${summary.survival.unitsLost > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {EMOJI['loss']} Units Lost: {summary.survival.unitsLost} ({summary.survival.survivalRate.toFixed(1)}% Survival)
                                        </p>
                                        <p className="text-gray-600 text-sm">{EMOJI['maize']} Units Surviving to Next Stage: {summary.survival.survivingUnits}</p>
                                        {summary.survival.explanation.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-gray-700 text-sm font-medium">Factors Affecting Survival:</p>
                                                <ul className="text-gray-600 list-inside list-disc text-sm">
                                                    {summary.survival.explanation.map((exp, i) => <li key={i}>{exp}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                                <p className="mt-1 font-medium">Stat Changes:</p>
                                {Object.keys(summary.changes).length > 0 ? (
                                    Object.entries(summary.changes).map(([stat, change], i) => {
                                        // Handle multiplier display separately
                                        if (stat.includes('multiplier')) {
                                            // Assuming change here is the final multiplier value as updated in combineChanges
                                            const multiplierType = stat.replace('_multiplier', '').replace('_', ' ').trim().capitalize();
                                            // Display the final multiplier value, not the change factor
                                            const finalMultiplier = farmStats ? farmStats[stat] : 'N/A'; // Get final multiplier from farmStats
                                            return <p key={i} className="text-gray-600 text-sm">{multiplierType} Multiplier: {typeof finalMultiplier === 'number' ? `${finalMultiplier.toFixed(2)}x` : finalMultiplier}</p>;
                                        } else if (stat === 'current_temp' || stat === 'current_rainfall') {
                                            // Weather is displayed separately in the summary header for the week
                                            return null; // Don't show weather in stat changes list
                                        }
                                        else {
                                            const statName = stat.replace('_', ' ').trim().capitalize();
                                            return (
                                                <p key={i} className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {statName}: {change >= 0 ? '+' : ''}{stat === 'money' ? `KES ${change.toFixed(2)}` : stat === 'fertilizer' ? `${change.toFixed(2)} kg` : `${change.toFixed(1)}%`}
                                                </p>
                                            );
                                        }
                                    })
                                ) : (
                                    <p className="text-gray-600 text-sm">No significant stat changes this week from event, decision, or logic.</p>
                                )}
                            </div>
                        ))}
                    </div>


                    <div className="flex items-center justify-center">
                        <button
                            className="bg-blue-500 text-white py-2 px-4 rounded font-bold hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={() => setGamePhase('initial_input')} // Restart game
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    // Render playing screen
    return (
        <div className="bg-green-100 flex min-h-screen flex-col"> {/* Use flex-col for vertical layout */}
            {/* Fixed Top Bar for Stats */}
            {farmStats && maizeUnits !== null && ( // Ensure maizeUnits is not null
                <div className="bg-green-800 text-white p-4 top-0 left-0 fixed z-10 flex w-full flex-wrap items-center justify-around shadow-md"> {/* Fixed top bar */}
                    <div className="mx-2 text-center">
                        <p className="text-sm font-semibold">{EMOJI['maize']} Maize Units:</p>
                        <p className="text-lg">{maizeUnits}</p>
                    </div>
                    <div className="mx-2 text-center">
                        <p className="text-sm font-semibold">{EMOJI['moisture']} Moisture:</p>
                        <p className="text-lg">{farmStats.moisture.toFixed(0)}%</p>
                    </div>
                    <div className="mx-2 text-center">
                        <p className="text-sm font-semibold">{EMOJI['health']} Health:</p>
                        <p className="text-lg">{farmStats.health.toFixed(0)}%</p>
                    </div>
                    <div className="mx-2 text-center">
                        <p className="text-sm font-semibold">{EMOJI['fertilizer']} Fertilizer:</p>
                        <p className="text-lg">{farmStats.fertilizer.toFixed(2)} kg</p>
                    </div>
                    <div className="mx-2 text-center">
                        <p className="text-sm font-semibold">{EMOJI['money']} Money:</p>
                        <p className="text-lg">KES {farmStats.money.toFixed(2)}</p>
                    </div>
                    {/* Display Weather Stats */}
                    <div className="mx-2 text-center">
                        <p className="text-sm font-semibold">{EMOJI['temp']} Temp:</p>
                        <p className="text-lg">{farmStats.current_temp}°C</p>
                    </div>
                    <div className="mx-2 text-center">
                        <p className="text-sm font-semibold">{EMOJI['rainfall']} Rainfall:</p>
                        <p className="text-lg">{farmStats.current_rainfall} mm</p>
                    </div>
                    <div className="mx-2 text-center">
                        <p className="text-sm font-semibold">Week:</p>
                        <p className="text-lg">{currentRound} / {NUM_ROUNDS}</p>
                    </div>
                    <div className="mx-2 text-center">
                        <p className="text-sm font-semibold">Stage:</p>
                        <p className="text-lg">{currentGrowthStage}</p>
                    </div>
                </div>
            )}

            {/* Display Game Error Message */}
            {gameError && (
                <div className="top-20 -translate-x-1/2 bg-red-500 text-white p-3 fixed left-1/2 z-50 transform rounded-md shadow-lg">
                    {EMOJI['error']} {gameError}
                </div>
            )}


            {/* Main Content Area for Scenario and Decisions */}
            {showRoundModal && currentEvent && farmStats && maizeUnits !== null && ( // Ensure maizeUnits is not null
                <div className="p-4 mt-20 flex flex-grow items-center justify-center"> {/* Added mt-20 to push content below fixed header */}
                    <div className="bg-white p-6 max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-lg text-center shadow-lg md:max-w-md lg:max-w-lg"> {/* Adjusted max-height */}
                        <h3 className="mb-4 text-green-800 text-xl font-bold">{EMOJI['event']} Week {currentRound}: {currentGrowthStage} Scenario</h3>
                        <p className="text-gray-700 mb-6">{currentEvent.description}</p>

                        <h4 className="mb-4 text-green-700 text-lg font-bold">Choose Your Action:</h4>
                        <div className="gap-4 grid grid-cols-1">
                            {/* Filter decisions to only show relevant ones if needed, or show all if all are always relevant */}
                            {DECISIONS.map((decision, index) => {
                                // Re-calculate cost here for display based on current maize units
                                const displayCost = calculateDecisionCost(decision, maizeUnits, farmStats.fertilizer_cost_multiplier);
                                return (
                                    <button
                                        key={index}
                                        className="bg-yellow-500 text-white py-3 px-4 transform rounded font-bold transition duration-200 ease-in-out hover:bg-yellow-600 hover:scale-105 focus:outline-none focus:shadow-outline"
                                        onClick={() => handleDecision(decision)}
                                    >
                                        {decision.description} (Cost: KES {displayCost.toFixed(2)})
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// Helper function to calculate percentage
// Keeping this outside as it's a general utility
// Helper function to capitalize the first letter of a string
// Keeping this outside as it's a general utility
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


export default Home;
