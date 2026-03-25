
import React from 'react';
import { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Makanan', icon: '🍎', color: 'bg-orange-200' },
  { id: 'toys', name: 'Mainan', icon: '🧸', color: 'bg-blue-200' },
  { id: 'school', name: 'Sekolah', icon: '📚', color: 'bg-green-200' },
  { id: 'gift', name: 'Hadiah', icon: '🎁', color: 'bg-pink-200' },
  { id: 'saving', name: 'Tabungan', icon: '💰', color: 'bg-yellow-200' },
  { id: 'other', name: 'Lainnya', icon: '✨', color: 'bg-purple-200' },
];

// Added style prop to FlowerIcon to allow custom CSS properties (like animationDirection) from parent components
export const FlowerIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="currentColor">
    <path d="M50 35c-5-15-25-15-25 0 0 10 15 20 25 30 10-10 25-20 25-30 0-15-20-15-25 0z" />
    <circle cx="50" cy="50" r="10" />
    <path d="M50 65c5 15 25 15 25 0 0-10-15-20-25-30-10 10-25 20-25 30 0 15 20 15 25 0z" />
    <path d="M35 50c-15-5-15-25 0-25 10 0 20 15 30 25-10 10-20 25-30 25-15 0-15-20 0-25z" />
    <path d="M65 50c15 5 15 25 0 25-10 0-20-15-30-25 10-10 20-25 30-25 15 0 15 20 0 25z" />
  </svg>
);
