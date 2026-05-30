import React, { useState } from 'react';
import { 
  BarChart3, 
  Building, 
  Users, 
  UserCheck, 
  BookOpen, 
  Calendar, 
  Coins, 
  GraduationCap, 
  ChevronDown, 
  Plus, 
  LogOut 
} from 'lucide-react';
import { School } from '../types';

interface SkoolaSidebarProps {
  schools: School[];
  activeSchoolId: string;
  setActiveSchoolId: (id: string) => void;
  activeTab: 'dashboard' | 'schools' | 'students' | 'staff' | 'classes' | 'attendance' | 'fees';
  setActiveTab: (tab: any) => void;
  onNewSchoolClick: () => void;
  userEmail: string;
  onSignOut: () => void;
}

export default function SkoolaSidebar({
  schools,
  activeSchoolId,
  setActiveSchoolId,
  activeTab,
  setActiveTab,
  onNewSchoolClick,
  userEmail,
  onSignOut
}: SkoolaSidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activeSchool = schools.find(s => s.id === activeSchoolId);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'schools', label: 'Schools', icon: Building },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fees', icon: Coins }
  ] as const;

  return (
    <aside id="skoola-main-sidebar" className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
        <div className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md">
          <GraduationCap className="w-5 h-5 line-clamp-1" />
        </div>
        <span className="text-xl font-extrabold text-[#1e1b4b] tracking-tight">Skoola</span>
      </div>

      {/* Selector Dropdown Container */}
      <div className="p-4 border-b border-slate-100 relative">
        <button
          id="school-select-dropdown-trigger"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-[#f8fafc]/80 border border-slate-200 hover:border-slate-300 rounded-xl text-left text-xs font-semibold text-slate-700 transition-all shadow-sm"
        >
          <span className="truncate">
            {activeSchool ? activeSchool.name : 'No schools yet'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div 
            id="school-dropdown-menu" 
            className="absolute left-4 right-4 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto">
              {schools.length === 0 ? (
                <div className="px-3 py-2 text-center text-[11px] text-slate-400">
                  No registered schools
                </div>
              ) : (
                schools.map(sch => (
                  <button
                    key={sch.id}
                    onClick={() => {
                      setActiveSchoolId(sch.id);
                      setDropdownOpen(false);
                      // Auto route to dashboard on selection
                      setActiveTab('dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                      sch.id === activeSchoolId
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate font-bold">{sch.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{sch.curriculum}</div>
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-slate-100 p-1 bg-slate-50">
              <button
                id="btn-sidebar-new-school"
                onClick={() => {
                  onNewSchoolClick();
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                New School
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Account bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="truncate text-xs font-bold text-slate-700 tracking-tight">
          {userEmail}
        </div>
        <button
          id="btn-sidebar-signout"
          onClick={onSignOut}
          className="mt-2.5 w-full flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-all shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
