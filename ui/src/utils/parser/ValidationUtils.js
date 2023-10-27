export function parseBoolean(value) {
    return value !== undefined && value !== null && value === 'true';
}