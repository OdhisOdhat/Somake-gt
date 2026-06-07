export interface ThemePalette {
  name: string;
  themeClass: string;
  primary: string; // Tailwind class
  primaryHover: string;
  text: string;
  textHover: string;
  bg: string;
  bgLight: string;
  border: string;
  borderActive: string;
  ring: string;
  badge: string;
}

export const getThemePalette = (color?: string): ThemePalette => {
  switch (color) {
    case 'emerald':
      return {
        name: 'Emerald Green',
        themeClass: 'emerald',
        primary: 'bg-emerald-600',
        primaryHover: 'hover:bg-emerald-700',
        text: 'text-emerald-600',
        textHover: 'hover:text-emerald-800',
        bg: 'bg-emerald-50',
        bgLight: 'bg-emerald-55/40',
        border: 'border-emerald-200',
        borderActive: 'border-emerald-500',
        ring: 'ring-emerald-500/15',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-150'
      };
    case 'rose':
      return {
        name: 'Warm Rose',
        themeClass: 'rose',
        primary: 'bg-rose-600',
        primaryHover: 'hover:bg-rose-700',
        text: 'text-rose-600',
        textHover: 'hover:text-rose-800',
        bg: 'bg-rose-50',
        bgLight: 'bg-rose-50/40',
        border: 'border-rose-200',
        borderActive: 'border-rose-500',
        ring: 'ring-rose-500/15',
        badge: 'bg-rose-50 text-rose-700 border-rose-150'
      };
    case 'amber':
      return {
        name: 'Bright Amber',
        themeClass: 'amber',
        primary: 'bg-amber-600',
        primaryHover: 'hover:bg-amber-700',
        text: 'text-amber-600',
        textHover: 'hover:text-amber-800',
        bg: 'bg-amber-50',
        bgLight: 'bg-amber-50/40',
        border: 'border-amber-200',
        borderActive: 'border-amber-500',
        ring: 'ring-amber-500/15',
        badge: 'bg-amber-50 text-amber-700 border-amber-150'
      };
    case 'sky':
      return {
        name: 'Ocean Sky Blue',
        themeClass: 'sky',
        primary: 'bg-sky-600',
        primaryHover: 'hover:bg-sky-700',
        text: 'text-sky-600',
        textHover: 'hover:text-sky-800',
        bg: 'bg-sky-50',
        bgLight: 'bg-sky-50/40',
        border: 'border-sky-200',
        borderActive: 'border-sky-500',
        ring: 'ring-sky-500/15',
        badge: 'bg-sky-50 text-sky-700 border-sky-150'
      };
    case 'violet':
      return {
        name: 'Regal Violet',
        themeClass: 'violet',
        primary: 'bg-violet-600',
        primaryHover: 'hover:bg-violet-700',
        text: 'text-violet-600',
        textHover: 'hover:text-violet-800',
        bg: 'bg-violet-50',
        bgLight: 'bg-violet-50/40',
        border: 'border-violet-200',
        borderActive: 'border-violet-500',
        ring: 'ring-violet-500/15',
        badge: 'bg-violet-50 text-violet-700 border-violet-150'
      };
    default: // indigo
      return {
        name: 'Vibrant Indigo',
        themeClass: 'indigo',
        primary: 'bg-indigo-600',
        primaryHover: 'hover:bg-indigo-700',
        text: 'text-indigo-600',
        textHover: 'hover:text-indigo-800',
        bg: 'bg-indigo-50',
        bgLight: 'bg-indigo-55/40',
        border: 'border-indigo-200',
        borderActive: 'border-indigo-500',
        ring: 'ring-indigo-500/15',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-150'
      };
  }
};

export const CBE_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Kiswahili Lugha",
  "Integrated Science",
  "Social Studies",
  "Agriculture & Nutrition",
  "Creative Arts & Sports",
  "Christian Religious Education (CRE)",
  "Islamic Religious Education (IRE)",
  "Hindu Religious Education (HRE)",
  "Pre-Technical Studies",
  "Health Education",
  "Computer Science / Digital Literacy"
];

export const CAMBRIDGE_SUBJECTS = [
  "Mathematics",
  "English Language",
  "English Literature",
  "Biology",
  "Chemistry",
  "Physics",
  "Computer Science / ICT",
  "History",
  "Geography",
  "Global Perspectives",
  "Art & Design",
  "Music & Drama",
  "Business Studies",
  "Economics",
  "French",
  "German",
  "Spanish"
];

