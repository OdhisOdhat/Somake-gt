import React, { useEffect } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  useNavigate, 
  useParams, 
  useLocation 
} from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import MainLayout from './components/MainLayout';
import LandingPage from './components/LandingPage';

function SyncRouteState() {
  const { 
    activeSchoolId, 
    setActiveSchoolId, 
    activeTab, 
    setActiveTab, 
    schools 
  } = useAppContext();
  const { schoolId, tabName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync URL params to global application state
  useEffect(() => {
    if (schoolId && schoolId !== 'none' && schoolId !== activeSchoolId) {
      setActiveSchoolId(schoolId);
    }
    if (tabName && tabName !== activeTab) {
      setActiveTab(tabName as any);
    }
  }, [schoolId, tabName, activeSchoolId, activeTab, setActiveSchoolId, setActiveTab]);

  // Sync state changes in UI context back to dynamic URL path
  useEffect(() => {
    if (activeSchoolId && activeTab) {
      const targetQuery = `/${activeSchoolId}/${activeTab}`;
      if (location.pathname !== targetQuery) {
        navigate(targetQuery, { replace: true });
      }
    }
  }, [activeSchoolId, activeTab, navigate, location.pathname]);

  return null;
}

function DefaultRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        <div className="text-xs font-bold text-slate-400">Entering Landing Hub...</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page for visitors */}
          <Route path="/" element={<LandingPage />} />

          {/* Coordinate Layout views using URL parameters Route mapping */}
          <Route path="/:schoolId/:tabName" element={
            <>
              <SyncRouteState />
              <MainLayout />
            </>
          } />

          {/* Catch-all route to resolve redirects seamlessly */}
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
