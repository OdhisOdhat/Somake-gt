import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  FileSpreadsheet, 
  Lock, 
  Edit3, 
  UploadCloud, 
  X, 
  PhoneCall, 
  Mail, 
  MapPin 
} from 'lucide-react';
import { School } from '../types';
import { downloadSchoolTemplate } from '../utils/templateGenerator';
import { useAppContext } from '../context/AppContext';
import { getThemePalette } from '../utils/theme';

interface SchoolsTabProps {
  schools: School[];
  activeSchoolId: string;
  setActiveSchoolId: (id: string) => void;
  setActiveTab: (tab: any) => void;
  onNewSchoolClick: () => void;
  onDeleteSchool: (id: string) => void;
}

export default function SchoolsTab({
  schools,
  activeSchoolId,
  setActiveSchoolId,
  setActiveTab,
  onNewSchoolClick,
  onDeleteSchool
}: SchoolsTabProps) {
  const navigate = useNavigate();
  const { userRole, staff, selectedTeacherId, handleUpdateSchoolProfile, showToast } = useAppContext();

  const isSuperAdmin = userRole === 'super_admin';
  const activeTeacherProfile = staff?.find(st => st.id === selectedTeacherId);
  const isAppointedSchoolAdmin = userRole === 'teacher' && activeTeacherProfile && (activeTeacherProfile.role === 'Head Teacher' || activeTeacherProfile.role === 'Registrar');
  const canAddSchool = isSuperAdmin || isAppointedSchoolAdmin;

  // Edit / Customization States
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    logoUrl: '',
    slogan: '',
    themeColor: ''
  });
  const [isDragOver, setIsDragOver] = useState(false);

  const startEditSchool = (sch: School) => {
    setEditingSchool(sch);
    setEditForm({
      name: sch.name,
      phone: sch.phone || '',
      email: sch.email || '',
      address: sch.address || '',
      logoUrl: sch.logoUrl || '',
      slogan: sch.slogan || '',
      themeColor: sch.themeColor || 'indigo'
    });
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Maximum image size is 2MB!', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setEditForm(prev => ({ ...prev, logoUrl: uploadEvent.target?.result as string }));
        showToast('Logo chosen successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file!', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Maximum image size is 2MB!', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setEditForm(prev => ({ ...prev, logoUrl: uploadEvent.target?.result as string }));
        showToast('Logo uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    if (!editForm.name) {
      showToast('School name cannot be empty!', 'error');
      return;
    }
    handleUpdateSchoolProfile(editingSchool.id, editForm);
    setEditingSchool(null);
  };

  return (
    <div id="skoola-schools-tab-root" className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1e1b4b] tracking-tight">Schools</h2>
          <p className="text-xs text-slate-500 mt-0.5">Customize, select, and manage schools in your network</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {isSuperAdmin && (
            <button
              onClick={downloadSchoolTemplate}
              className="border border-emerald-200 bg-emerald-55/40 hover:bg-emerald-100/70 text-emerald-800 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Download XLSX Template
            </button>
          )}

          {canAddSchool ? (
            <button
              id="btn-schools-add-school"
              onClick={onNewSchoolClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer animate-in fade-in"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
              New school
            </button>
          ) : (
            <div className="border border-slate-200 p-2 text-slate-400 bg-slate-50/50 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" />
              New school restricted
            </div>
          )}
        </div>
      </div>

      {/* Grid or Blank State */}
      {schools.length === 0 ? (
        <div 
          id="blank-state-no-schools" 
          className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/70 rounded-2xl text-center min-h-[350px] shadow-sm"
        >
          <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-4 flex items-center justify-center">
            <Building className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-extrabold text-[#111] mb-1">No schools yet. Click "New school"</h3>
          <p className="text-xs text-slate-450 mt-0.5">to get started.</p>
        </div>
      ) : (
        <div id="grid-schools-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schools.map(sch => {
            const isActive = sch.id === activeSchoolId;
            const canCustomizeSchool = isSuperAdmin || (isAppointedSchoolAdmin && (!activeTeacherProfile?.schoolId || activeTeacherProfile.schoolId === sch.id));
            const schPalette = getThemePalette(sch.themeColor);
            
            return (
              <div 
                key={sch.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between relative ${
                  isActive ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-250 hover:border-slate-350'
                }`}
              >
                {isActive && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-150">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" /> Selected
                  </span>
                )}

                <div className="space-y-4">
                  {/* Title and Logo emblem */}
                  <div className="flex items-start gap-3">
                    {sch.logoUrl ? (
                      <img 
                      src={sch.logoUrl} 
                      alt={`${sch.name} Logo`} 
                      className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-slate-50 shrink-0 shadow-xs" 
                      referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-55 text-indigo-700 flex items-center justify-center font-black text-lg border border-indigo-100 shrink-0 uppercase">
                        {sch.name.substring(0, 1)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-[14px] font-black text-slate-900 line-clamp-2 pr-12">{sch.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{sch.code}</span>
                        {sch.themeColor && sch.themeColor !== 'indigo' && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${schPalette.badge}`}>
                            🎨 {schPalette.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {sch.slogan && (
                    <div className="bg-slate-50 border-l-2 border-slate-300 p-2 text-slate-500 italic text-[11px] font-semibold rounded-r-lg">
                      "{sch.slogan}"
                    </div>
                  )}

                  {/* Attributes list */}
                  <div className="space-y-2.5 text-xs text-slate-600 border-t border-b border-slate-100 py-3.5 leading-relaxed font-semibold">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold mb-0.5">Curriculum Pathway:</span>
                      <strong className="text-indigo-950 font-extrabold">{sch.curriculum}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{sch.phone || 'No phone set'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-indigo-600 underline font-medium truncate">{sch.email || 'No email set'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="text-slate-500 italic font-medium leading-tight line-clamp-1">{sch.address || 'No location set'}</span>
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="flex items-center justify-between gap-2.5 pt-4 mt-2">
                  <button
                    onClick={() => {
                      setActiveSchoolId(sch.id);
                      navigate(`/${sch.id}/dashboard`);
                    }}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                    <span>{isActive ? 'Manage' : 'Select'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {canCustomizeSchool && (
                      <button
                        onClick={() => startEditSchool(sch)}
                        className="p-2 border border-indigo-150 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-xl transition-all cursor-pointer"
                        title="Customize School Profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isSuperAdmin ? (
                      <button
                        onClick={() => onDeleteSchool(sch.id)}
                        title="Delete school profile"
                        className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="p-2 border border-slate-100 text-slate-300 rounded-xl cursor-not-allowed" title="Deletion Restricted to Global Admins">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Customize School Profile Modal */}
      {editingSchool && (
        <div id="modal-customize-school" className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingSchool(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-5 text-left">
              <h3 className="text-base font-black text-[#1e1b4b] flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" /> Customize School Profile
              </h3>
              <p className="text-xs text-slate-500 font-medium">Update brand identity, logo, and address for <span className="font-extrabold text-slate-700">{editingSchool.name}</span>.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-semibold text-left">
              {isSuperAdmin && (
                <div id="super-admin-branding-notify" className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[11px] text-amber-800 leading-normal font-semibold">
                  ✨ <strong>Super Admin Delegation Mode:</strong> You are customizing and branding this school portal profile metadata directly on behalf of the registered School Administrator.
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">School Registered Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-hidden rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Phone Contact</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-hidden rounded-xl font-bold text-slate-705"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Email Contact</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-hidden rounded-xl font-bold text-slate-705"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Address Location</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-hidden rounded-xl font-bold text-slate-705"
                  placeholder="e.g. Westlands, Nairobi"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Motto / Slogan</label>
                  <input
                    type="text"
                    value={editForm.slogan}
                    onChange={e => setEditForm({ ...editForm, slogan: e.target.value })}
                    placeholder="e.g. Strive for Academic Excellence"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-hidden rounded-xl font-bold text-slate-705"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">Portal Accent Theme</label>
                  <select
                    value={editForm.themeColor}
                    onChange={e => setEditForm({ ...editForm, themeColor: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-hidden rounded-xl font-bold text-slate-705"
                  >
                    <option value="indigo">Indigo (Skoola Default)</option>
                    <option value="emerald">Royal Emerald</option>
                    <option value="rose">Warm Rose</option>
                    <option value="amber">Bright Amber</option>
                    <option value="sky">Ocean Sky Blue</option>
                    <option value="violet">Regal Violet</option>
                  </select>
                </div>
              </div>

              {/* Logo Drag-and-Drop Area */}
              <div>
                <label className="text-[10px] uppercase font-black text-slate-450 mb-1 block">School Logo Emblem</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4.5 text-center transition-all ${
                    isDragOver ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/55 hover:bg-slate-50'
                  }`}
                >
                  {editForm.logoUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={editForm.logoUrl}
                        alt="Selected Logo Preview"
                        className="w-16 h-16 object-contain rounded-xl shadow-xs border bg-white p-1"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, logoUrl: '' }))}
                        className="text-rose-600 hover:text-rose-700 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="w-8 h-8 text-indigo-500" />
                      <p className="text-[11px] font-bold text-slate-500">
                        Drag and drop your logo file here, or{' '}
                        <label className="text-indigo-600 hover:underline cursor-pointer">
                          browse files
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileChange}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold">Supports PNG, JPG, JPEG up to 2MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 text-right pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
                  className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
