import mongoose from "mongoose";

/**
 * Strip HTML tags from a string to prevent XSS.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
export function isValidObjectId(id: unknown): id is string {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

/**
 * Validate a required string field. Returns the trimmed value or null.
 */
export function validateRequiredString(
  value: unknown,
  fieldName: string,
  options: { maxLength?: number } = {},
): { value: string } | { error: string } {
  if (!value || typeof value !== "string" || !value.trim()) {
    return { error: `${fieldName} is required` };
  }
  const trimmed = stripHtml(value.trim());
  if (options.maxLength !== undefined && trimmed.length > options.maxLength) {
    return {
      error: `${fieldName} cannot exceed ${options.maxLength} characters`,
    };
  }
  return { value: trimmed };
}

/**
 * Validate an optional string field. Returns trimmed value, undefined, or error.
 */
export function validateOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return undefined;
  return stripHtml(value.trim());
}

/**
 * Validate a number within a range.
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean } = {},
): { value: number } | { error: string } | { value: undefined } {
  const { min, max, required = false } = options;

  if (value === undefined || value === null || value === "") {
    if (required) return { error: `${fieldName} is required` };
    return { value: undefined };
  }

  const num = Number(value);
  if (isNaN(num)) {
    return { error: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && num < min) {
    return { error: `${fieldName} cannot be less than ${min}` };
  }

  if (max !== undefined && num > max) {
    return { error: `${fieldName} cannot be greater than ${max}` };
  }

  return { value: num };
}

/**
 * Validate a field against an allowed list of values.
 */
export function validateEnum(
  value: unknown,
  fieldName: string,
  allowedValues: string[],
  required = true,
): { value: string } | { error: string } | { value: undefined } {
  if (!value || typeof value !== "string") {
    if (required) return { error: `${fieldName} is required` };
    return { value: undefined };
  }
  if (!allowedValues.includes(value)) {
    return {
      error: `${fieldName} must be one of: ${allowedValues.join(", ")}`,
    };
  }
  return { value };
}

/**
 * Validate an ObjectId field.
 */
export function validateObjectId(
  value: unknown,
  fieldName: string,
  required = true,
): { value: string } | { error: string } | { value: undefined } {
  if (!value || typeof value !== "string") {
    if (required) return { error: `${fieldName} is required` };
    return { value: undefined };
  }
  if (!isValidObjectId(value)) {
    return { error: `${fieldName} is not a valid ID` };
  }
  return { value };
}
