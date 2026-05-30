import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface NoSchoolSelectedProps {
  title: string;
}

export default function NoSchoolSelected({ title }: NoSchoolSelectedProps) {
  return (
    <div id="no-active-school-fallback" className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/65 rounded-xl text-center shadow-sm min-h-[400px]">
      <div className="bg-indigo-50 p-4.5 rounded-full text-indigo-600 mb-4 shadow-inner flex items-center justify-center">
        <ShieldAlert className="w-10 h-10 stroke-[1.8]" />
      </div>
      <h3 className="text-lg font-extrabold text-[#111]">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-2">
        To view and manage this interface, choose a registered school from the dropdown list in the sidebar, or set up a new school first in the dashboard.
      </p>
    </div>
  );
}
