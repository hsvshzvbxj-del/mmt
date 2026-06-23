import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export function formatDateTime(date: string | Date) {
  if (!date) return '';
  return new Date(date).toLocaleString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function getInitials(name: string) {
  if (!name) return '؟';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2);
}

export function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    job: 'bg-blue-100 text-blue-700',
    project: 'bg-purple-100 text-purple-700',
    consulting: 'bg-green-100 text-green-700',
    partnership: 'bg-orange-100 text-orange-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}

export function timeAgo(date: string | Date) {
  if (!date) return '';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'منذ لحظات';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return formatDate(date);
}
