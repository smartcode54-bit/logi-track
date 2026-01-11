import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format license plate to display format: 12กข-4567
 * Format: [numbers][letters at positions 2-3][numbers]
 * Thai license plate pattern: 1-2 digits, 2 Thai letters, 4-5 digits
 * @param plate - Raw license plate string
 * @returns Formatted license plate with hyphen
 */
export function formatLicensePlate(plate: string): string {
  if (!plate) return "";
  
  // Remove all spaces and hyphens
  const cleaned = plate.replace(/[\s-]/g, "");
  
  // If plate is too short, return as is
  if (cleaned.length < 4) return plate;
  
  // Thai license plate format examples:
  // "1กข2345" -> "1กข-2345"
  // "12กข4567" -> "12กข-4567"
  // "123กข45678" -> "123กข-45678"
  
  // Pattern: Find 2 consecutive Thai letters (positions 2-3 typically)
  // Look for pattern: [digits][2 Thai letters][digits]
  const thaiLetterPattern = /([0-9]+)([ก-ฮ]{2})([0-9]+)/;
  const match = cleaned.match(thaiLetterPattern);
  
  if (match) {
    // Found pattern: digits + 2 Thai letters + digits
    const [, digits, letters, numbers] = match;
    return `${digits}${letters}-${numbers}`;
  }
  
  // Fallback: Try to find any 2 consecutive letters (Thai or English)
  const letterPattern = /([0-9]+)([ก-ฮa-zA-Z]{2})([0-9]+)/;
  const letterMatch = cleaned.match(letterPattern);
  
  if (letterMatch) {
    const [, digits, letters, numbers] = letterMatch;
    return `${digits}${letters}-${numbers}`;
  }
  
  // If already has hyphen, return as is
  if (plate.includes("-")) {
    return plate;
  }
  
  // Last resort: split after 3 characters if length > 3
  if (cleaned.length > 3) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
  }
  
  return cleaned;
}
