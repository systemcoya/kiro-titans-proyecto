import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina nombres de clase usando clsx y tailwind-merge para resolver conflictos.
 * @param inputs - Valores de clases CSS a combinar
 * @returns Cadena de clases combinadas
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
