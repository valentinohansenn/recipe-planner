/**
 * Unit Conversion Utilities
 * Handles conversion between US Imperial and Metric systems
 * With comprehensive edge case handling
 */

export type UnitSystem = 'us' | 'metric';

// High-precision fraction constants
const FRACTIONS = {
    ONE_QUARTER: 1 / 4,
    ONE_THIRD: 1 / 3,
    ONE_HALF: 1 / 2,
    TWO_THIRDS: 2 / 3,
    THREE_QUARTERS: 3 / 4,
    ONE_EIGHTH: 1 / 8,
    THREE_EIGHTHS: 3 / 8,
    FIVE_EIGHTHS: 5 / 8,
    SEVEN_EIGHTHS: 7 / 8,
} as const;

// Unicode fraction mapping
const UNICODE_FRACTIONS: Record<string, number> = {
    '¼': FRACTIONS.ONE_QUARTER,
    '½': FRACTIONS.ONE_HALF,
    '¾': FRACTIONS.THREE_QUARTERS,
    '⅓': FRACTIONS.ONE_THIRD,
    '⅔': FRACTIONS.TWO_THIRDS,
    '⅛': FRACTIONS.ONE_EIGHTH,
    '⅜': FRACTIONS.THREE_EIGHTHS,
    '⅝': FRACTIONS.FIVE_EIGHTHS,
    '⅞': FRACTIONS.SEVEN_EIGHTHS,
    '⅕': 1 / 5,
    '⅖': 2 / 5,
    '⅗': 3 / 5,
    '⅘': 4 / 5,
    '⅙': 1 / 6,
    '⅚': 5 / 6,
};

// Text fraction mapping
const TEXT_FRACTIONS: Record<string, number> = {
    '1/4': FRACTIONS.ONE_QUARTER,
    '1/3': FRACTIONS.ONE_THIRD,
    '1/2': FRACTIONS.ONE_HALF,
    '2/3': FRACTIONS.TWO_THIRDS,
    '3/4': FRACTIONS.THREE_QUARTERS,
    '1/8': FRACTIONS.ONE_EIGHTH,
    '3/8': FRACTIONS.THREE_EIGHTHS,
    '5/8': FRACTIONS.FIVE_EIGHTHS,
    '7/8': FRACTIONS.SEVEN_EIGHTHS,
    '1/5': 1 / 5,
    '2/5': 2 / 5,
    '3/5': 3 / 5,
    '4/5': 4 / 5,
    '1/6': 1 / 6,
    '5/6': 5 / 6,
};

interface ConversionData {
    toMetric: number;
    metricUnit: string;
    displayName?: string;
}

interface ReverseConversionData {
    toUS: number;
    usUnit: string;
    displayName?: string;
}

// Volume conversions (US measurements)
const volumeConversions: Record<string, ConversionData> = {
    // Cups
    'cup': { toMetric: 240, metricUnit: 'ml', displayName: 'cup' },
    'cups': { toMetric: 240, metricUnit: 'ml', displayName: 'cups' },
    'c': { toMetric: 240, metricUnit: 'ml', displayName: 'cup' },

    // Tablespoons
    'tablespoon': { toMetric: 14.787, metricUnit: 'ml', displayName: 'tablespoon' },
    'tablespoons': { toMetric: 14.787, metricUnit: 'ml', displayName: 'tablespoons' },
    'tbsp': { toMetric: 14.787, metricUnit: 'ml', displayName: 'tbsp' },
    'tbs': { toMetric: 14.787, metricUnit: 'ml', displayName: 'tbsp' },
    'tb': { toMetric: 14.787, metricUnit: 'ml', displayName: 'tbsp' },
    'T': { toMetric: 14.787, metricUnit: 'ml', displayName: 'tbsp' },

    // Teaspoons
    'teaspoon': { toMetric: 4.929, metricUnit: 'ml', displayName: 'teaspoon' },
    'teaspoons': { toMetric: 4.929, metricUnit: 'ml', displayName: 'teaspoons' },
    'tsp': { toMetric: 4.929, metricUnit: 'ml', displayName: 'tsp' },
    't': { toMetric: 4.929, metricUnit: 'ml', displayName: 'tsp' },

    // Fluid ounces
    'fluid ounce': { toMetric: 29.574, metricUnit: 'ml', displayName: 'fl oz' },
    'fluid ounces': { toMetric: 29.574, metricUnit: 'ml', displayName: 'fl oz' },
    'fl oz': { toMetric: 29.574, metricUnit: 'ml', displayName: 'fl oz' },
    'fl. oz': { toMetric: 29.574, metricUnit: 'ml', displayName: 'fl oz' },
    'fl.oz': { toMetric: 29.574, metricUnit: 'ml', displayName: 'fl oz' },
    'floz': { toMetric: 29.574, metricUnit: 'ml', displayName: 'fl oz' },

    // Pints (US)
    'pint': { toMetric: 473.176, metricUnit: 'ml', displayName: 'pint' },
    'pints': { toMetric: 473.176, metricUnit: 'ml', displayName: 'pints' },
    'pt': { toMetric: 473.176, metricUnit: 'ml', displayName: 'pt' },

    // Quarts (US)
    'quart': { toMetric: 946.353, metricUnit: 'ml', displayName: 'quart' },
    'quarts': { toMetric: 946.353, metricUnit: 'ml', displayName: 'quarts' },
    'qt': { toMetric: 946.353, metricUnit: 'ml', displayName: 'qt' },

    // Gallons (US)
    'gallon': { toMetric: 3785.41, metricUnit: 'ml', displayName: 'gallon' },
    'gallons': { toMetric: 3785.41, metricUnit: 'ml', displayName: 'gallons' },
    'gal': { toMetric: 3785.41, metricUnit: 'ml', displayName: 'gal' },
};

// Weight conversions
const weightConversions: Record<string, ConversionData> = {
    // Ounces
    'ounce': { toMetric: 28.3495, metricUnit: 'g', displayName: 'ounce' },
    'ounces': { toMetric: 28.3495, metricUnit: 'g', displayName: 'ounces' },
    'oz': { toMetric: 28.3495, metricUnit: 'g', displayName: 'oz' },

    // Pounds
    'pound': { toMetric: 453.592, metricUnit: 'g', displayName: 'pound' },
    'pounds': { toMetric: 453.592, metricUnit: 'g', displayName: 'pounds' },
    'lb': { toMetric: 453.592, metricUnit: 'g', displayName: 'lb' },
    'lbs': { toMetric: 453.592, metricUnit: 'g', displayName: 'lbs' },
    '#': { toMetric: 453.592, metricUnit: 'g', displayName: 'lb' },
};

// Temperature conversions
const temperatureUnits = new Set([
    'f', 'fahrenheit', '°f', 'degf', 'deg f',
    'c', 'celsius', '°c', 'degc', 'deg c'
]);

// Metric to US conversions
const metricToVolume: Record<string, ReverseConversionData> = {
    'ml': { toUS: 1 / 240, usUnit: 'cup', displayName: 'ml' },
    'milliliter': { toUS: 1 / 240, usUnit: 'cup', displayName: 'ml' },
    'milliliters': { toUS: 1 / 240, usUnit: 'cup', displayName: 'ml' },
    'millilitre': { toUS: 1 / 240, usUnit: 'cup', displayName: 'ml' },
    'millilitres': { toUS: 1 / 240, usUnit: 'cup', displayName: 'ml' },
    'mL': { toUS: 1 / 240, usUnit: 'cup', displayName: 'ml' },

    'l': { toUS: 1000 / 240, usUnit: 'cup', displayName: 'L' },
    'liter': { toUS: 1000 / 240, usUnit: 'cup', displayName: 'L' },
    'liters': { toUS: 1000 / 240, usUnit: 'cup', displayName: 'L' },
    'litre': { toUS: 1000 / 240, usUnit: 'cup', displayName: 'L' },
    'litres': { toUS: 1000 / 240, usUnit: 'cup', displayName: 'L' },
    'L': { toUS: 1000 / 240, usUnit: 'cup', displayName: 'L' },
};

const metricToWeight: Record<string, ReverseConversionData> = {
    'g': { toUS: 1 / 28.3495, usUnit: 'oz', displayName: 'g' },
    'gram': { toUS: 1 / 28.3495, usUnit: 'oz', displayName: 'g' },
    'grams': { toUS: 1 / 28.3495, usUnit: 'oz', displayName: 'g' },
    'gr': { toUS: 1 / 28.3495, usUnit: 'oz', displayName: 'g' },

    'kg': { toUS: 1000 / 28.3495, usUnit: 'oz', displayName: 'kg' },
    'kilogram': { toUS: 1000 / 28.3495, usUnit: 'oz', displayName: 'kg' },
    'kilograms': { toUS: 1000 / 28.3495, usUnit: 'oz', displayName: 'kg' },
    'kilo': { toUS: 1000 / 28.3495, usUnit: 'oz', displayName: 'kg' },
    'kilos': { toUS: 1000 / 28.3495, usUnit: 'oz', displayName: 'kg' },
};

/**
 * Parse a number that might include fractions, decimals, or ranges
 */
function parseNumber(input: string): number | null {
    const trimmed = input.trim();

    // Handle empty string
    if (!trimmed) return null;

    // Check for unicode fractions
    if (UNICODE_FRACTIONS[trimmed]) {
        return UNICODE_FRACTIONS[trimmed];
    }

    // Check for text fractions
    if (TEXT_FRACTIONS[trimmed]) {
        return TEXT_FRACTIONS[trimmed];
    }

    // Handle mixed numbers like "1 1/2" or "1½"
    const mixedUnicode = trimmed.match(/^(\d+)\s*([¼½¾⅓⅔⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚])$/);
    if (mixedUnicode) {
        const whole = parseInt(mixedUnicode[1], 10);
        const fraction = UNICODE_FRACTIONS[mixedUnicode[2]];
        return whole + fraction;
    }

    const mixedText = trimmed.match(/^(\d+)\s+(\d+\/\d+)$/);
    if (mixedText) {
        const whole = parseInt(mixedText[1], 10);
        const [numerator, denominator] = mixedText[2].split('/').map(Number);
        if (denominator === 0) return null;
        return whole + (numerator / denominator);
    }

    // Handle simple fractions like "3/4"
    if (trimmed.includes('/')) {
        const parts = trimmed.split('/');
        if (parts.length === 2) {
            const numerator = parseFloat(parts[0]);
            const denominator = parseFloat(parts[1]);
            if (denominator === 0) return null;
            return numerator / denominator;
        }
    }

    // Handle ranges like "1-2" or "1 - 2" (take average)
    const rangeMatch = trimmed.match(/^(\d+\.?\d*)\s*-\s*(\d+\.?\d*)$/);
    if (rangeMatch) {
        const low = parseFloat(rangeMatch[1]);
        const high = parseFloat(rangeMatch[2]);
        return (low + high) / 2;
    }

    // Handle regular decimals
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Formats a number to a readable string with appropriate fractions
 */
function formatNumber(num: number, forceDecimals = false): string {
    // Handle negative numbers
    if (num < 0) return '0';

    // Handle very small numbers
    if (num < 0.01 && num > 0) return '< 0.01';

    // Handle very large numbers
    if (num >= 10000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }

    // For large numbers, use one decimal
    if (num >= 100) {
        return num.toFixed(1).replace(/\.0$/, '');
    }

    const whole = Math.floor(num);
    const fraction = num - whole;

    // If it's essentially a whole number
    if (fraction < 0.01) {
        return whole.toString();
    }

    // If forced to use decimals or the fraction doesn't match common fractions
    if (forceDecimals) {
        return num.toFixed(2).replace(/\.?0+$/, '');
    }

    // Try to match common fractions (with tolerance)
    const tolerance = 0.02;

    if (Math.abs(fraction - FRACTIONS.ONE_EIGHTH) < tolerance) {
        return whole > 0 ? `${whole}⅛` : '⅛';
    }
    if (Math.abs(fraction - FRACTIONS.ONE_QUARTER) < tolerance) {
        return whole > 0 ? `${whole}¼` : '¼';
    }
    if (Math.abs(fraction - FRACTIONS.ONE_THIRD) < tolerance) {
        return whole > 0 ? `${whole}⅓` : '⅓';
    }
    if (Math.abs(fraction - FRACTIONS.THREE_EIGHTHS) < tolerance) {
        return whole > 0 ? `${whole}⅜` : '⅜';
    }
    if (Math.abs(fraction - FRACTIONS.ONE_HALF) < tolerance) {
        return whole > 0 ? `${whole}½` : '½';
    }
    if (Math.abs(fraction - FRACTIONS.FIVE_EIGHTHS) < tolerance) {
        return whole > 0 ? `${whole}⅝` : '⅝';
    }
    if (Math.abs(fraction - FRACTIONS.TWO_THIRDS) < tolerance) {
        return whole > 0 ? `${whole}⅔` : '⅔';
    }
    if (Math.abs(fraction - FRACTIONS.THREE_QUARTERS) < tolerance) {
        return whole > 0 ? `${whole}¾` : '¾';
    }
    if (Math.abs(fraction - FRACTIONS.SEVEN_EIGHTHS) < tolerance) {
        return whole > 0 ? `${whole}⅞` : '⅞';
    }

    // Default to one decimal place
    return num.toFixed(1).replace(/\.0$/, '');
}

/**
 * Convert temperature between Fahrenheit and Celsius
 */
function convertTemperature(value: number, fromUnit: string, toUnit: string): number {
    const from = fromUnit.toLowerCase().replace(/[°\s.]/g, '');
    const to = toUnit.toLowerCase().replace(/[°\s.]/g, '');

    if (from === 'f' || from === 'fahrenheit') {
        if (to === 'c' || to === 'celsius') {
            return (value - 32) * 5 / 9;
        }
    } else if (from === 'c' || from === 'celsius') {
        if (to === 'f' || to === 'fahrenheit') {
            return (value * 9 / 5) + 32;
        }
    }

    return value;
}

/**
 * Extract unit from amount string
 */
function extractUnit(amount: string): string {
    // Match unit at the end of the string
    const unitMatch = amount.match(/[a-zA-Z°#.]+\s*$/);
    return unitMatch ? unitMatch[0].trim().toLowerCase() : '';
}

/**
 * Choose the best US unit for display based on the converted value
 */
function chooseBestUSUnit(value: number, baseUnit: 'volume' | 'weight'): { value: number; unit: string } {
    if (baseUnit === 'volume') {
        // Very small: use teaspoons
        if (value < 1 / 16) { // Less than 1 tablespoon
            const tsp = value * 48; // 1 cup = 48 tsp
            if (tsp < 0.1) return { value: value * 768, unit: 'drops' }; // Extreme case
            return { value: tsp, unit: tsp === 1 ? 'tsp' : 'tsp' };
        }
        // Small: use tablespoons
        if (value < 0.25) { // Less than 1/4 cup
            const tbsp = value * 16; // 1 cup = 16 tbsp
            return { value: tbsp, unit: tbsp === 1 ? 'tbsp' : 'tbsp' };
        }
        // Medium: use cups
        if (value < 4) {
            return { value, unit: value === 1 ? 'cup' : 'cups' };
        }
        // Large: use quarts
        if (value < 16) {
            const quarts = value / 4;
            return { value: quarts, unit: quarts === 1 ? 'quart' : 'quarts' };
        }
        // Very large: use gallons
        const gallons = value / 16;
        return { value: gallons, unit: gallons === 1 ? 'gallon' : 'gallons' };
    } else { // weight
        // Use ounces for < 16 oz
        if (value < 16) {
            return { value, unit: 'oz' };
        }
        // Use pounds for >= 16 oz
        const pounds = value / 16;
        return { value: pounds, unit: pounds === 1 ? 'lb' : 'lbs' };
    }
}

/**
 * Choose the best metric unit for display based on the converted value
 */
function chooseBestMetricUnit(value: number, baseUnit: 'ml' | 'g'): { value: number; unit: string } {
    if (baseUnit === 'ml') {
        if (value >= 1000) {
            return { value: value / 1000, unit: 'L' };
        }
        return { value, unit: 'ml' };
    } else { // grams
        if (value >= 1000) {
            return { value: value / 1000, unit: 'kg' };
        }
        return { value, unit: 'g' };
    }
}

/**
 * Converts an ingredient amount from one unit system to another
 */
export function convertAmount(
    amount: string,
    fromSystem: UnitSystem,
    toSystem: UnitSystem
): string {
    // If systems are the same, return as is
    if (fromSystem === toSystem) return amount;

    // Handle empty or invalid input
    if (!amount || typeof amount !== 'string') return amount;

    const trimmed = amount.trim();
    if (!trimmed) return amount;

    // Extract number and unit using improved regex
    // Matches: "2 cups", "1.5ml", "1 1/2 tsp", "2-3 tbsp", etc.
    const match = trimmed.match(/^([\d./\s\-¼½¾⅓⅔⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚]+)\s*(.*)$/);
    if (!match) return amount;

    const [, numPart, unitPart] = match;
    const unit = unitPart.toLowerCase().trim();

    // Parse the number
    const value = parseNumber(numPart);
    if (value === null || value <= 0) return amount;

    // Check for temperature conversion
    const unitNormalized = unit.replace(/[°\s.]/g, '');
    if (temperatureUnits.has(unitNormalized)) {
        let targetUnit: string;
        if (fromSystem === 'us' && toSystem === 'metric') {
            targetUnit = '°C';
            const converted = convertTemperature(value, 'f', 'c');
            return `${Math.round(converted)}${targetUnit}`;
        } else if (fromSystem === 'metric' && toSystem === 'us') {
            targetUnit = '°F';
            const converted = convertTemperature(value, 'c', 'f');
            return `${Math.round(converted)}${targetUnit}`;
        }
    }

    // Convert US to Metric
    if (fromSystem === 'us' && toSystem === 'metric') {
        // Check volume conversions
        if (volumeConversions[unit]) {
            const { toMetric, metricUnit } = volumeConversions[unit];
            const convertedValue = value * toMetric;
            const best = chooseBestMetricUnit(convertedValue, metricUnit as 'ml' | 'g');
            return `${formatNumber(best.value)} ${best.unit}`;
        }

        // Check weight conversions
        if (weightConversions[unit]) {
            const { toMetric, metricUnit } = weightConversions[unit];
            const convertedValue = value * toMetric;
            const best = chooseBestMetricUnit(convertedValue, metricUnit as 'ml' | 'g');
            return `${formatNumber(best.value)} ${best.unit}`;
        }
    }

    // Convert Metric to US
    if (fromSystem === 'metric' && toSystem === 'us') {
        // Check volume conversions
        if (metricToVolume[unit]) {
            const { toUS } = metricToVolume[unit];
            const convertedValue = value * toUS;
            const best = chooseBestUSUnit(convertedValue, 'volume');
            return `${formatNumber(best.value)} ${best.unit}`;
        }

        // Check weight conversions
        if (metricToWeight[unit]) {
            const { toUS } = metricToWeight[unit];
            const convertedValue = value * toUS;
            const best = chooseBestUSUnit(convertedValue, 'weight');
            return `${formatNumber(best.value)} ${best.unit}`;
        }
    }

    // If no conversion found, return original
    return amount;
}

/**
 * Detect if an amount string contains US units
 */
export function containsUSUnits(amount: string): boolean {
    if (!amount || typeof amount !== 'string') return false;
    const unit = extractUnit(amount);
    if (!unit) return false;

    // Check temperature
    const unitNormalized = unit.replace(/[°\s.]/g, '');
    if (unitNormalized === 'f' || unitNormalized === 'fahrenheit') return true;

    return !!(volumeConversions[unit] || weightConversions[unit]);
}

/**
 * Detect if an amount string contains metric units
 */
export function containsMetricUnits(amount: string): boolean {
    if (!amount || typeof amount !== 'string') return false;
    const unit = extractUnit(amount);
    if (!unit) return false;

    // Check temperature
    const unitNormalized = unit.replace(/[°\s.]/g, '');
    if (unitNormalized === 'c' || unitNormalized === 'celsius') return true;

    return !!(metricToVolume[unit] || metricToWeight[unit]);
}

/**
 * Scale a number by a multiplier, returning the result
 */
export function scaleNumber(input: string, multiplier: number): number | null {
    const value = parseNumber(input);
    if (value === null) return null;
    return value * multiplier;
}

/**
 * Format a scaled number back to a readable string
 */
export function formatScaledNumber(scaledValue: number): string {
    return formatNumber(scaledValue);
}
