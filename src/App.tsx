import React, { useEffect, useRef } from 'react';
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

  // Track the last parameters that were actually processed/synced to context state
  const lastParamsRef = useRef({ schoolId, tabName });

  useEffect(() => {
    const urlChanged = 
      schoolId !== lastParamsRef.current.schoolId || 
      tabName !== lastParamsRef.current.tabName;

    if (urlChanged) {
      // URL parameters changed (via side menu clicking or back/forward browser navigation)
      // Sync URL change DOWN to application context state
      if (schoolId && schoolId !== 'none' && schoolId !== activeSchoolId) {
        setActiveSchoolId(schoolId);
      }
      if (tabName && tabName !== activeTab) {
        setActiveTab(tabName as any);
      }
      // Update our record of last seen URL params
      lastParamsRef.current = { schoolId, tabName };
    } else {
      // URL parameters did not change. Sync in-app context state changes UP to URL path.
      if (activeSchoolId && activeTab) {
        const targetQuery = `/${activeSchoolId}/${activeTab}`;
        if (location.pathname !== targetQuery) {
          navigate(targetQuery, { replace: true });
          // Update our record of last seen URL params to match what we just outputted
          lastParamsRef.current = { schoolId: activeSchoolId, tabName: activeTab };
        }
      }
    }
  }, [schoolId, tabName, activeSchoolId, activeTab, navigate, location.pathname, setActiveSchoolId, setActiveTab]);

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
