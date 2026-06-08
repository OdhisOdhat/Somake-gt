import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogOut,
  Lock,
  Sun,
  Moon,
  Bell
} from 'lucide-react';
import { School } from '../types';
import { useAppContext } from '../context/AppContext';

interface SkoolaSidebarProps {
  schools: School[];
  activeSchoolId: string;
  setActiveSchoolId: (id: string) => void;
  activeTab: 'dashboard' | 'schools' | 'students' | 'staff' | 'classes' | 'attendance' | 'fees' | 'exams';
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
  const navigate = useNavigate();
  const { userRole, showToast, darkMode, toggleDarkMode, staff, selectedTeacherId } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activeSchool = schools.find(s => s.id === activeSchoolId);

  const isSuperAdmin = userRole === 'super_admin';
  const activeTeacherProfile = staff?.find(st => st.id === selectedTeacherId);
  const isAppointedSchoolAdmin = userRole === 'teacher' && activeTeacherProfile && (activeTeacherProfile.role === 'Head Teacher' || activeTeacherProfile.role === 'Registrar');
  const canSwitchSchools = isSuperAdmin || isAppointedSchoolAdmin;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'schools', label: 'Schools', icon: Building },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fees', icon: Coins },
    { id: 'exams', label: 'Exams & Alerts', icon: Bell }
  ] as const;

  const isTabLocked = (tabId: string) => {
    if (userRole === 'super_admin') return false;
    if (userRole === 'teacher') {
      if (tabId === 'schools' && isAppointedSchoolAdmin) {
        return false;
      }
      return ['schools', 'staff', 'fees'].includes(tabId);
    }
    if (userRole === 'parent_student') {
      return ['schools', 'students', 'staff', 'attendance'].includes(tabId);
    }
    return false;
  };

  return (
    <aside id="skoola-main-sidebar" className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
        <div className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md">
          <GraduationCap className="w-5 h-5 line-clamp-1" />
        </div>
        <span className="text-xl font-extrabold text-slate-900 tracking-tight">Skoola</span>
      </div>

      {/* Selector Dropdown Container */}
      <div className="p-4 border-b border-slate-100 relative">
        <button
          id="school-select-dropdown-trigger"
          onClick={() => {
            if (!canSwitchSchools) {
              showToast("Access Restricted: Other staff are restricted to their assigned school profile and cannot switch.", "error");
              return;
            }
            setDropdownOpen(!dropdownOpen);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all shadow-sm ${
            canSwitchSchools 
              ? 'bg-slate-100/80 border border-slate-200 hover:border-slate-305 text-slate-700 cursor-pointer' 
              : 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span className="truncate flex items-center gap-1.5 font-bold">
            {!canSwitchSchools && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            {activeSchool ? activeSchool.name : 'No schools yet'}
          </span>
          {canSwitchSchools ? (
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-300" />
          )}
        </button>

        {dropdownOpen && canSwitchSchools && (
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
                      navigate(`/${sch.id}/dashboard`);
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
            {isSuperAdmin && (
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
            )}
          </div>
        )}
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          const locked = isTabLocked(item.id);
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                if (locked) {
                  showToast(`Access Restricted: [${item.label}] requires elevated ${userRole === 'teacher' ? 'Super Administrator' : 'Staff'} privileges.`, 'error');
                  return;
                }
                navigate(`/${activeSchoolId || 'none'}/${item.id}`);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                locked
                  ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50/50'
                  : isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              disabled={false} // Click handler handles showing the error alert to tell the user what's happening
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${locked ? 'text-slate-350' : isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {locked && <Lock className="w-3 h-3 text-slate-400 shrink-0 ml-1" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Account bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="truncate text-xs font-bold text-slate-700 tracking-tight pr-2">
            {userEmail}
          </div>
          
          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 px-2 rounded-xl bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-505 shrink-0" />
                <span className="text-[10px] pr-0.5">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700 shrink-0 font-bold" />
                <span className="text-[10px] pr-0.5 text-slate-700">Dark</span>
              </>
            )}
          </button>
        </div>
        
        <button
          id="btn-sidebar-signout"
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-[11px] font-bold text-slate-550 hover:text-slate-700 transition-all shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
