import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return format(date, 'EEE, MMM dd, yyyy');
}

export function formatFullDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return format(date, 'hh:mm a');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getEventStatusText(status: string): string {
  // Convert snake_case to readable text
  const words = status.split('_');
  const capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalized.join(' ');
}

export function getServiceTypeLabel(serviceType: string): string {
  const service = serviceTypes.find(s => s.value === serviceType);
  return service ? service.label : serviceType;
}

export function getEventTypeLabel(eventType: string): string {
  const type = eventTypes.find(t => t.value === eventType);
  return type ? type.label : eventType;
}

export const eventStatuses = [
  { value: "inquiry", label: "Inquiry" },
  { value: "follow_up", label: "Follow Up" },
  { value: "icm", label: "ICM" },
  { value: "proposal", label: "Proposal" },
  { value: "pay_retainer", label: "Pay Retainer" },
  { value: "pcm", label: "PCM" },
  { value: "2cm", label: "2CM" },
  { value: "fcm", label: "FCM" },
  { value: "gdg", label: "GDG" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

export const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "private_party", label: "Private Party" },
  { value: "non_profit", label: "Non-Profit Event" }
];

export const serviceTypes = [
  { value: "dj_mc", label: "DJ + MC" },
  { value: "live_music", label: "L!VE Music" },
  { value: "djf", label: "DJF" },
  { value: "av", label: "AV + Sound" }
];

export const contactTypes = [
  { value: "client", label: "Client" },
  { value: "team_member", label: "Team Member" },
  { value: "vendor", label: "Vendor" }
];

export const musicPreferences = [
  { value: "wide_variety", label: "Anything! Wide Variety (Oldies to Current)" },
  { value: "country_rock", label: "Country + Classic Rock" },
  { value: "cultural", label: "Cultural (Greek, Indian, Jewish, Persian)" },
  { value: "dance_edm", label: "Dance / EDM" },
  { value: "latin", label: "Latin" },
  { value: "top_40", label: "Top 40's + Throwbacks" }
];
