import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

export const GENRES = [
  'Philosophy',
  'Fiction',
  'Non-Fiction',
  'Science',
  'History',
  'Psychology',
  'Poetry',
  'Literature',
  'Technology',
  'Others',
] as const;

export type Genre = typeof GENRES[number];

export const GENRE_ICONS: Record<string, string> = {
  Philosophy: '⚖️',
  Fiction: '✨',
  'Non-Fiction': '📖',
  Science: '🔬',
  History: '🏛️',
  Psychology: '🧠',
  Poetry: '🌿',
  Literature: '📜',
  Technology: '💡',
  Others: '🌐',
};

export const GENRE_DESCRIPTIONS: Record<string, string> = {
  Philosophy: 'Explore the fundamental questions of existence, knowledge, and ethics',
  Fiction: 'Immerse yourself in worlds of imagination and narrative',
  'Non-Fiction': 'Discover truth through factual accounts and analysis',
  Science: 'Unravel the mysteries of the natural world',
  History: 'Journey through the chronicles of human civilization',
  Psychology: 'Understand the depths of the human mind',
  Poetry: 'Experience language at its most distilled and powerful',
  Literature: 'Engage with the great works of human expression',
  Technology: 'Navigate the frontiers of innovation and digital thought',
  Others: 'Discover works that defy easy categorization',
};
