import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getEffectiveDate = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // إذا كانت الساعة قبل 6 مساءً (18:00)، نستخدم تاريخ الأمس
  if (hour < 18) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
  
  // إذا كانت الساعة 6 مساءً أو بعدها، نستخدم تاريخ اليوم
  return now.toISOString().split('T')[0];
};
