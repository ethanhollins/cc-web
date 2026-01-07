import moment from "moment-timezone";

/**
 * The default timezone used across the application
 */
export const DEFAULT_TIMEZONE = "Australia/Sydney";

/**
 * Converts a date to the application's default timezone and formats it
 * @param date - The date to convert (Date object or string)
 * @param timezone - The timezone to convert to (defaults to Australia/Sydney)
 * @returns ISO 8601 formatted string in the specified timezone
 */
export function toTimezone(date: Date | string, timezone: string = DEFAULT_TIMEZONE): string {
  return moment.tz(date, timezone).format();
}

/**
 * Parses a date string in the application's default timezone
 * @param dateString - The date string to parse
 * @param timezone - The timezone to parse in (defaults to Australia/Sydney)
 * @returns Moment object in the specified timezone
 */
export function parseInTimezone(dateString: string, timezone: string = DEFAULT_TIMEZONE): moment.Moment {
  return moment.tz(dateString, timezone);
}
