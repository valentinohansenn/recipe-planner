/**
 * Formats minutes into a human-readable time string
 * @param minutes - The number of minutes
 * @returns Formatted time string (e.g., "1 hour 30 min", "45 min", "2 hours")
 */
export function formatTime(minutes: number | undefined): string {
    if (!minutes) return "0 min";

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return hours === 1 ? "1 hour" : `${hours} hours`;
    }

    const hourText = hours === 1 ? "1 hour" : `${hours} hours`;
    return `${hourText} ${remainingMinutes} min`;
}



