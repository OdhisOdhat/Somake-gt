import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Bus, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  FileText, 
  Calendar,
  Layers,
  Check,
  Plus
} from 'lucide-react';

export default function LandingPage() {
  const { 
    schools, 
    students, 
    staff, 
    schoolClasses,
    feeRecords,
    setActiveSchoolId,
    setActiveTab,
    setShowSchoolModal
  } = useAppContext();

  const navigate = useNavigate();
  const [selectedDemoCurriculum, setSelectedDemoCurriculum] = useState<'CBE' | 'Cambridge'>('CBE');

  // Compute stats metrics
  const totalSchools = schools.length;
  const totalStudents = students.length;
  const totalStaff = staff.length;
  const totalClasses = schoolClasses.length;

  const handleLaunchSchool = (schoolId: string) => {
    setActiveSchoolId(schoolId);
    setActiveTab('dashboard');
    navigate(`/${schoolId}/dashboard`);
  };

  const handleCreateNewSchool = () => {
    setShowSchoolModal(true);
    // Switch to schools path so modal can overlay
    if (schools.length > 0) {
      navigate(`/${schools[0].id}/schools`);
    } else {
      // Just toggle state and navigate
      navigate(`/none/schools`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-505 selection:text-white flex flex-col relative overflow-hidden">
      
      {/* Decorative Grid Gradients */}
      <div className="absolute top-0 left-0 w-full h-[650px] bg-[linear-gradient(to_bottom,rgba(15,23,42,0.6)_0%,rgba(15,23,42,1)_100%)] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_20%,rgba(99,102,241,0.18)_0%,transparent_50%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-indigo-550/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-48 right-1/4 w-80 h-80 bg-violet-550/10 rounded-full blur-[100px]" />
      </div>

      {/* Header Sticky Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-indigo-400/20">
              <GraduationCap className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <span className="font-display text-lg font-black tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text">
                Somake <span className="text-indigo-450 text-sm font-semibold tracking-wide ml-0.5 px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-900">ERP</span>
              </span>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-sans">Multi-Curriculum Cloud</p>
            </div>
          </div>

          {/* Quick Real-Time Network Active Count */}
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-800/80 px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active System: <strong className="text-white font-black">{totalSchools}</strong> School Networks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Pupils: <strong className="text-slate-200">{totalStudents}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Staff Core: <strong className="text-slate-200">{totalStaff}</strong></span>
            </div>
          </div>

          {/* Action Call to Portal */}
          <div className="flex items-center gap-3">
            {schools.length > 0 ? (
              <button
                onClick={() => handleLaunchSchool(schools[0].id)}
                className="group relative inline-flex items-center gap-1.5 text-xs font-bold font-sans tracking-wide bg-gradient-to-r from-indigo-600 to-indigo-550 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer hover:shadow-indigo-500/20 transition-all duration-300"
              >
                Go to Portal
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleCreateNewSchool}
                className="group inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-550 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg hover:shadow-indigo-500/20 transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Register School
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-6 w-full">
        
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-28 text-center flex flex-col items-center max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-900 text-indigo-300 text-xs font-black tracking-wide uppercase px-4 py-2 rounded-full mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-indigo-400" />
            Empowering Kenya CBE & Cambridge Systems With Gemini AI
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6">
            The Intelligent ERP For <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-100 bg-clip-text text-transparent">
              Next-Gen School Networks
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal tracking-wide mb-10">
            Streamline educational administration. Enroll pupils, manage staff registries, 
            run automated Kenya Competency-Based Education (CBE) grading rubrics, post class material in LMS, 
            and let Gemini AI write professional evaluation remarks instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4.5 w-full justify-center">
            {schools.length > 0 ? (
              <button
                onClick={() => handleLaunchSchool(schools[0].id)}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 font-display text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer"
              >
                Launch Enterprise Portal
                <ArrowRight className="w-4 h-4 text-indigo-600 font-bold group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleCreateNewSchool}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-display text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl shadow-xl transition-all duration-300 cursor-pointer"
              >
                Create Virtual School
                <Plus className="w-4 h-4 text-indigo-650" />
              </button>
            )}

            <button
              onClick={() => {
                const element = document.getElementById("demo-sandbox");
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-sans text-xs sm:text-sm font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-850 hover:text-white border border-slate-700/80 hover:border-slate-600 px-8 py-4 rounded-xl transition-all duration-300 cursor-pointer"
            >
              Explore Live Database
            </button>
          </div>

          {/* Quick System Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-left max-w-3xl w-full">
            <div className="bg-slate-950/40 border border-slate-850/80 p-4.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">Multi-Curriculum</span>
              </div>
              <p className="text-xs text-slate-400">Adaptive configurations for CBE Kenya and British Cambridge.</p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850/80 p-4.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wide">Gemini AI Engine</span>
              </div>
              <p className="text-xs text-slate-400">Instant AI-generated reporting comments matching graded rubrics.</p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850/80 p-4.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">Host Cloud Sync</span>
              </div>
              <p className="text-xs text-slate-400">Local fast data state combined with robust Express background sync.</p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850/80 p-4.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">Dynamic Sandbox</span>
              </div>
              <p className="text-xs text-slate-400">Instant learning loop, automated submissions and parent evaluation.</p>
            </div>
          </div>

        </section>

        {/* INTERACTIVE DEMO ACCENT WIDGET */}
        <section id="demo-sandbox" className="pb-24 scroll-mt-24">
          <div className="bg-slate-950/80 border border-slate-850/90 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Background glowing blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-505/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex flex-col lg:flex-row gap-8 justify-between items-start relative z-10">
              
              {/* Product interactive preview copy */}
              <div className="lg:max-w-md space-y-5">
                <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 pr-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">LIVE WIDGET</span>
                  ERP State Explorer
                </div>
                
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
                  Adaptive Curriculum Grading Systems
                </h2>
                
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Toggle curriculum view controls. Our platform automatically switches rubrics 
                  and views without friction: Kenyan basic schools harness Competency-Based Education ratings, 
                  while secondary networks implement standard Cambridge scales.
                </p>

                {/* Curriculum switchers */}
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex gap-1.5 w-fit">
                  <button
                    onClick={() => setSelectedDemoCurriculum('CBE')}
                    className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedDemoCurriculum === 'CBE' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                        : 'text-slate-400 hover:text-white bg-slate-950/35 hover:bg-slate-900'
                    }`}
                  >
                    Kenyan CBE Rubric
                  </button>
                  <button
                    onClick={() => setSelectedDemoCurriculum('Cambridge')}
                    className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedDemoCurriculum === 'Cambridge' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                        : 'text-slate-400 hover:text-white bg-slate-950/35 hover:bg-slate-900'
                    }`}
                  >
                    Cambridge Standard
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-white">
                        {selectedDemoCurriculum === 'CBE' ? 'Kenyan Formative Level Ratings' : 'Academic Grade Marks'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {selectedDemoCurriculum === 'CBE' 
                          ? 'Grades on EE (Exceeding), ME (Meeting), AE (Approaching), BE (Below).'
                          : 'Tracks exam scores from 0-100% paired with grade thresholds (A* through U).'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-white">Integrated Gemini AI Evaluations</h4>
                      <p className="text-[11px] text-slate-400">
                        Instantly produces tailored draft report card remarks contextually based on these selected grades.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Mockup Card Block */}
              <div className="w-full lg:max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex flex-col min-h-[340px]">
                
                {/* Header mock controls */}
                <div className="bg-slate-950/80 px-4.5 py-3 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[10px] font-mono font-bold text-slate-500 ml-2">skoola-mockup-frame.io</span>
                  </div>
                  <span className="text-[9.5px] bg-indigo-950 text-indigo-300 font-bold border border-indigo-900 px-2 py-0.5 rounded font-mono">
                    {selectedDemoCurriculum === 'CBE' ? 'CURRICULUM: CBE (KENYA)' : 'CURRICULUM: CAMBRIDGE'}
                  </span>
                </div>

                {/* Simulated Content Area */}
                <div className="p-5 flex-1 space-y-4 font-sans text-xs">
                  
                  {/* Top quick stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Evaluation Mode</span>
                      <span className="text-white font-black text-sm mt-1">
                        {selectedDemoCurriculum === 'CBE' ? 'Formative Levels' : 'Raw Percentages'}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Remarks remarks</span>
                      <span className="text-emerald-400 font-bold text-sm mt-1 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                        AI remarks
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">System Handshake</span>
                      <span className="text-indigo-400 font-bold text-sm mt-1">Ready</span>
                    </div>
                  </div>

                  {/* Grading Rubric interactive table simulation */}
                  <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="font-bold text-white text-xs">Simulated Grading Sheet</span>
                      <span className="text-[11px] text-slate-400">Class 4 Term Assessment</span>
                    </div>

                    {selectedDemoCurriculum === 'CBE' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                          <div>
                            <p className="font-bold text-slate-200">Wambua Maina</p>
                            <p className="text-[10px] text-slate-450">Mathematics & Art</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              EE - Exceeding Expectations
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                          <div>
                            <p className="font-bold text-slate-200">Adhiambo Atieno</p>
                            <p className="text-[10px] text-slate-450">Kiswahili & Language</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                              ME - Meeting Expectations
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                          <div>
                            <p className="font-bold text-slate-200">Liam Thompson</p>
                            <p className="text-[10px] text-slate-450">Combined Physics</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-black text-sm">94%</span>
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                              A* Grade
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                          <div>
                            <p className="font-bold text-slate-200">Sophia Mwangi</p>
                            <p className="text-[10px] text-slate-450">General Chemistry</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-black text-sm">78%</span>
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
                              B Grade
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Simulated remarks */}
                    <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-900/50 flex items-start gap-2 text-[11px] text-indigo-200 font-sans italic leading-relaxed">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white not-italic font-black text-[10px] uppercase tracking-wide block mb-1">
                          Gemini evaluation output draft:
                        </strong>
                        "{selectedDemoCurriculum === 'CBE' 
                          ? 'This pupil demonstrates exceptional capabilities in both understanding concepts and peer application. Excels above expectations on design assignments.'
                          : 'Demonstrates clear excellence in physical theory with clean exam answers. Focuses well and achieves remarkable logical clarity.'}"
                      </div>
                    </div>
                  </div>

                </div>

                {/* CTA launch inside card */}
                {schools.length > 0 && (
                  <div className="bg-slate-950/90 border-t border-slate-850 px-5 py-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      See this fully implemented in the administrative dashboard context.
                    </span>
                    <button
                      onClick={() => handleLaunchSchool(schools[0].id)}
                      className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-black py-2 px-4 rounded-xl shadow transition-all cursor-pointer"
                    >
                      Enter Portal View
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ACTIVE SCHOOL NETWORKS SELECTOR */}
        <section className="pb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              School Administration Hubs
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Select one of the registered schools below to enter its local academic ledger, 
              enroll students, review payments, publish virtual class assignments, and manage operations.
            </p>
          </div>

          {totalSchools > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map((sch) => {
                // Compute students & staff in this school
                const studentCount = students.filter(s => s.schoolId === sch.id).length;
                const staffCount = staff.filter(s => s.schoolId === sch.id).length;
                
                return (
                  <div 
                    key={sch.id}
                    className="p-5.5 bg-slate-950/40 border border-slate-850 hover:border-indigo-502/60 hover:bg-slate-900/50 rounded-2xl transition-all duration-300 flex flex-col justify-between group shadow-sm"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 bg-indigo-950 border border-indigo-900 rounded-xl flex items-center justify-center text-indigo-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider font-mono">
                          {sch.curriculum}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-display text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {sch.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          Terminal Code: <span className="font-mono text-white text-[10.5px] font-bold">{sch.code}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4.5 pt-3.5 border-t border-slate-850/60">
                        <div>
                          <span className="text-[10px] text-slate-450 block uppercase font-bold tracking-wider">Students</span>
                          <span className="text-slate-200 font-bold font-mono text-xs">{studentCount} Registered</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-450 block uppercase font-bold tracking-wider">Staff Members</span>
                          <span className="text-slate-200 font-bold font-mono text-xs">{staffCount} Enlisted</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5.5">
                      <button
                        onClick={() => handleLaunchSchool(sch.id)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        Launch Portal Manager
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Quick Add School Card */}
              <div 
                onClick={handleCreateNewSchool}
                className="p-5.5 bg-slate-950/20 border-2 border-dashed border-slate-800 hover:border-indigo-505 hover:bg-slate-900/30 rounded-2xl transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] group"
              >
                <div className="h-11 w-11 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-450 group-hover:bg-indigo-950 group-hover:border-indigo-900 group-hover:text-indigo-400 transition-all mb-3 shadow-inner">
                  <Plus className="w-5 h-5" />
                </div>
                <h4 className="font-display text-xs sm:text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                  Register New Campus Network
                </h4>
                <p className="text-[11.5px] text-slate-500 max-w-[210px] mt-1.5 mx-auto leading-normal">
                  Expand the Somake ERP system by setting up a fresh workspace.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-8 text-center max-w-sm mx-auto space-y-4 shadow-xl">
              <div className="bg-indigo-950 text-indigo-400 border border-indigo-900 p-3.5 rounded-full w-14 h-14 mx-auto flex items-center justify-center shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200 text-sm">No Registered Networks Found</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Our workspace environment is freshly deployed. Initialize your very first school to experience the dashboard.
                </p>
              </div>
              <button
                onClick={handleCreateNewSchool}
                className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2.5 rounded-xl uppercase tracking-wider font-sans transition-all cursor-pointer shadow-md"
              >
                Start Free Registration
              </button>
            </div>
          )}
        </section>

        {/* FEATURES GRID SECTION */}
        <section className="pb-24 pt-4 border-t border-slate-850/60">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase block mb-1">
              Comprehensive Platform
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              Enterprise School ERP Capabilities
            </h3>
            <p className="text-slate-405 text-xs sm:text-sm mt-2">
              Everything next-gen schools require to automate administrative and learning processes, 
              built for accuracy and ease of use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            
            {/* AI remarks */}
            <div className="bg-slate-950/40 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="space-y-3.5">
                <div className="h-9 w-9 rounded-xl bg-violet-950 text-violet-400 border border-violet-900 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-violet-400 fill-violet-400/20" />
                </div>
                <h4 className="font-display text-sm font-bold text-white">Gemini AI remarks Insights</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate professional, comprehensive, and helpful academic remarks for school report cards. 
                  Saves hundreds of hours for educators while preserving standard performance indicators.
                </p>
              </div>
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mt-4">INCLUDED OUT-OF-THE-BOX</span>
            </div>

            {/* CBE */}
            <div className="bg-slate-950/40 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="space-y-3.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-900 flex items-center justify-center">
                  <GraduationCap className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <h4 className="font-display text-sm font-bold text-white">Kenya Competency-Based Education</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Support Kenya's newest CBA & CBE frameworks. Track students with formative rubric metrics: 
                  Exceeding Expectations (EE), Meeting Expectations (ME), Approaching (AE), and Below Expectations (BE).
                </p>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-4">NATIONALLY ALIGNED</span>
            </div>

            {/* LMS */}
            <div className="bg-slate-950/40 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="space-y-3.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-900 flex items-center justify-center">
                  <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <h4 className="font-display text-sm font-bold text-white">Learning Management System (LMS)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enable teachers to post materials, assignments, and test content. Features automated homework responses, 
                  parent review approval checklists, and digital correction tracking.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-4">Sandbox Integrated</span>
            </div>

            {/* Student Welfare */}
            <div className="bg-slate-950/40 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="space-y-3.5">
                <div className="h-9 w-9 rounded-xl bg-amber-950 text-amber-400 border border-amber-900 flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <h4 className="font-display text-sm font-bold text-white">Registries & Boarding Security</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A high-capacity student registry complete with boarding houses welfare, health reports, behavioral logs, 
                  and warden tracking to ensure student welfare.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-4">WELFARE SHIELD</span>
            </div>

            {/* Fees Track */}
            <div className="bg-slate-950/40 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="space-y-3.5">
                <div className="h-9 w-9 rounded-xl bg-sky-950 text-sky-400 border border-sky-900 flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-sky-400" />
                </div>
                <h4 className="font-display text-sm font-bold text-white">Automated Ledger & Billing</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate student term payment balances, outstanding dues, and register payments. Instant access to visual report billing status, 
                  and automated email parent reminder templates.
                </p>
              </div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-4">FINANCE HUB</span>
            </div>

            {/* Transport Logistics */}
            <div className="bg-slate-950/40 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="space-y-3.5">
                <div className="h-9 w-9 rounded-xl bg-rose-950 text-rose-400 border border-rose-900 flex items-center justify-center">
                  <Bus className="w-4.5 h-4.5 text-rose-400" />
                </div>
                <h4 className="font-display text-sm font-bold text-white">Transit Transport Fleet</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Assign pupil shuttle bus routes, log driver profile contacts, and update active transit stops in real time, 
                  calculating delayed status alerts automatically.
                </p>
              </div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-4">LOGISTICS RADAR</span>
            </div>

          </div>
        </section>

      </main>

      {/* Footer Banner */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs">
          
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-black text-slate-350 tracking-wide text-[11px] uppercase">
              Somake School ERP Networks
            </span>
          </div>

          <div className="flex items-center gap-6 text-slate-450 font-medium">
            <span>System Time: <strong className="text-slate-205 font-mono">2026-05-30 UTC</strong></span>
            <span>Version: <strong className="text-slate-205">v4.8 Prod</strong></span>
            <span>Enterprise Guard Active</span>
          </div>

          <div className="mt-4 md:mt-0 leading-normal text-center md:text-right text-[11px]">
            &copy; 2026 Somake Inc. All Rights Reserved. Built for advanced administrative efficiency.
          </div>

        </div>
      </footer>

    </div>
  );
}
