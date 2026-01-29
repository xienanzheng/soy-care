import { differenceInYears, differenceInMonths, differenceInWeeks, differenceInDays } from 'date-fns';

export interface PetAge {
  years: number;
  months: number;
  weeks: number;
  days: number;
  formatted: string;
  short: string;
}

export function calculatePetAge(dateOfBirth: string | undefined | null): PetAge | null {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  const now = new Date();

  if (isNaN(dob.getTime()) || dob > now) return null;

  const years = differenceInYears(now, dob);
  const months = differenceInMonths(now, dob) % 12;
  const totalDays = differenceInDays(now, dob);
  const weeks = differenceInWeeks(now, dob);
  const days = totalDays % 7;

  // Format age string
  let formatted = '';
  let short = '';

  if (years > 0) {
    formatted = `${years} ${years === 1 ? 'year' : 'years'}`;
    short = `${years}y`;
    if (months > 0) {
      formatted += `, ${months} ${months === 1 ? 'month' : 'months'}`;
      short += ` ${months}m`;
    }
  } else if (months > 0) {
    formatted = `${months} ${months === 1 ? 'month' : 'months'}`;
    short = `${months}m`;
    if (weeks > months * 4) {
      const extraWeeks = weeks - months * 4;
      if (extraWeeks > 0) {
        formatted += `, ${extraWeeks} ${extraWeeks === 1 ? 'week' : 'weeks'}`;
      }
    }
  } else if (weeks > 0) {
    formatted = `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    short = `${weeks}w`;
  } else {
    formatted = `${totalDays} ${totalDays === 1 ? 'day' : 'days'}`;
    short = `${totalDays}d`;
  }

  return {
    years,
    months: differenceInMonths(now, dob),
    weeks,
    days: totalDays,
    formatted,
    short,
  };
}

export function formatPetAge(dateOfBirth: string | undefined | null): string {
  const age = calculatePetAge(dateOfBirth);
  return age?.formatted ?? '';
}

export function formatPetAgeShort(dateOfBirth: string | undefined | null): string {
  const age = calculatePetAge(dateOfBirth);
  return age?.short ?? '';
}
