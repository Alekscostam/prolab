export function parseBoolean(value) {
    return value !== undefined && value !== null && (value === 1 || value.toUpperCase() === "TRUE");
}