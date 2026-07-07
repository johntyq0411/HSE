/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  IncidentReport,
  DistributionCenter,
  WorkingHoursEntry,
  UserRole
} from './types';
import {
  INITIAL_INCIDENTS,
  INITIAL_DCS,
  INITIAL_WORKING_HOURS,
  COUNTRIES
} from './utils';
import Dashboard from './components/Dashboard';
import InspectionForm from './components/InspectionForm';
import DCConfig from './components/DCConfig';
import TicketsLog from './components/TicketsLog';
import {
  LayoutDashboard,
  ClipboardList,
  Sliders,
  Users,
  ShieldCheck,
  Briefcase,
  Layers,
  FileCheck2,
  Trash,
  Globe,
  MapPin,
  PlusCircle,
  Settings
} from 'lucide-react';

export default function App() {
  // 1. CHOOSE ACTIVE USER SESSION CONFIG
  const [userRole, setUserRole] = useState<UserRole>('Superuser');
  const [userCountry, setUserCountry] = useState<string>('Malaysia');

  // 2. PRIMARY CATALOG STATE (With storage hydration fallback)
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [distributionCenters, setDistributionCenters] = useState<DistributionCenter[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHoursEntry[]>([]);

  // 3. NAVIGATION STATE
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'ReportForm' | 'DCConfig' | 'MyTickets'>('Dashboard');
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [dashboardCountry, setDashboardCountry] = useState<string>('Overall');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Sync dashboard filter to active simulated role & country
  useEffect(() => {
    if (userRole !== 'Superuser') {
      setDashboardCountry(userCountry);
    } else {
      setDashboardCountry('Overall');
    }
  }, [userRole, userCountry]);

  // Handle window scroll to toggle top bar background style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Init local storage records
  useEffect(() => {
    try {
      const storedReports = localStorage.getItem('hse_reports');
      if (storedReports) {
        const parsed = JSON.parse(storedReports);
        const mapped = parsed.map((r: any) => ({
          ...r,
          pdpaConsent: r.pdpaConsent !== undefined ? r.pdpaConsent : true
        }));
        setReports(mapped);
      } else {
        const mappedInit = INITIAL_INCIDENTS.map(r => ({ ...r, pdpaConsent: true }));
        setReports(mappedInit);
        localStorage.setItem('hse_reports', JSON.stringify(mappedInit));
      }

      const storedDCs = localStorage.getItem('hse_dcs');
      if (storedDCs) {
        setDistributionCenters(JSON.parse(storedDCs));
      } else {
        setDistributionCenters(INITIAL_DCS);
        localStorage.setItem('hse_dcs', JSON.stringify(INITIAL_DCS));
      }

      const storedHours = localStorage.getItem('hse_working_hours');
      if (storedHours) {
        const parsed = JSON.parse(storedHours) as WorkingHoursEntry[];
        const filtered = parsed.filter(wh => !(wh.year === 2026 && wh.month === 'May'));
        setWorkingHours(filtered);
        localStorage.setItem('hse_working_hours', JSON.stringify(filtered));
      } else {
        setWorkingHours(INITIAL_WORKING_HOURS);
        localStorage.setItem('hse_working_hours', JSON.stringify(INITIAL_WORKING_HOURS));
      }
    } catch (e) {
      console.error('Storage hydration failed', e);
    }
  }, []);

  // Sync to LS upon changes
  const saveReportsState = (updated: IncidentReport[]) => {
    setReports(updated);
    localStorage.setItem('hse_reports', JSON.stringify(updated));
  };

  const saveDCsState = (updated: DistributionCenter[]) => {
    setDistributionCenters(updated);
    localStorage.setItem('hse_dcs', JSON.stringify(updated));
  };

  const saveWorkingHoursState = (updated: WorkingHoursEntry[]) => {
    setWorkingHours(updated);
    localStorage.setItem('hse_working_hours', JSON.stringify(updated));
  };

  // HANDLERS
  const handleSaveReport = (newOrEdit: IncidentReport) => {
    const exists = reports.some(r => r.id === newOrEdit.id);
    let nextReports = [...reports];
    if (exists) {
      nextReports = nextReports.map(r => r.id === newOrEdit.id ? newOrEdit : r);
    } else {
      nextReports.unshift(newOrEdit);
    }
    saveReportsState(nextReports);
    setActiveEditId(null);
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this safety log item permanently?')) {
      const updated = reports.filter(r => r.id !== id);
      saveReportsState(updated);
      if (activeEditId === id) setActiveEditId(null);
    }
  };

  const handleAddDC = (dcInput: Omit<DistributionCenter, 'id'>) => {
    const newDC: DistributionCenter = {
      ...dcInput,
      id: 'dc-' + Date.now()
    };
    const updated = [...distributionCenters, newDC];
    saveDCsState(updated);
  };

  const handleToggleDCStatus = (id: string) => {
    const updated = distributionCenters.map(dc => {
      if (dc.id === id) {
        return { ...dc, status: dc.status === 'active' ? 'inactive' : 'active' as const };
      }
      return dc;
    });
    saveDCsState(updated);
  };

  const handleSaveWorkingHours = (entry: WorkingHoursEntry) => {
    // Check if item already exists under the same combo
    const existsIdx = workingHours.findIndex(
      wh => wh.country === entry.country && wh.year === entry.year && wh.month === entry.month
    );
    let nextHrs = [...workingHours];
    if (existsIdx > -1) {
      nextHrs[existsIdx] = entry;
    } else {
      nextHrs.push(entry);
    }
    saveWorkingHoursState(nextHrs);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] text-slate-800 font-sans antialiased pb-28 md:pb-12 selection:bg-red-50">
      
      {/* STICKY GLOBAL HEADER CONTAINER */}
      <header className="sticky top-0 z-40 w-full shadow-xs">
        {/* 1. TOP DOCKS: ACTIVE CLIENT ROLE SIMULATOR & DKSH HEADER */}
        <div className={`transition-all duration-300 ${isScrolled ? 'bg-[#BE0028] border-b border-red-800 shadow-sm py-2' : 'bg-white border-b border-gray-200 py-4'}`}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="text-center md:text-left">
              <h1 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${isScrolled ? 'text-white' : 'text-[#BE0028]'}`} style={{ fontFamily: 'Georgia, serif' }}>
                HSE CAPA Production System
              </h1>
              <p className={`text-[10px] uppercase tracking-widest font-mono font-bold mt-0.5 transition-colors duration-300 ${isScrolled ? 'text-red-100' : 'text-slate-500'}`}>
                Health, Safety, Environment, & Compliance Assurance
              </p>
            </div>

            {/* ROLE SIMULATOR PANEL (Simulates secure SSO credentials) */}
            <div className={`hidden md:flex px-4 py-2 rounded-lg flex-wrap items-center justify-center md:justify-start gap-3 transition-colors duration-300 ${isScrolled ? 'bg-red-950/40 border border-red-700/50' : 'bg-[#F4F4F4] border border-gray-200'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isScrolled ? 'text-red-100' : 'text-slate-500'}`}>Role Test Environment:</span>
              <div className="flex gap-1.5">
                <select
                  value={userRole}
                  onChange={(e) => {
                    const role = e.target.value as UserRole;
                    setUserRole(role);
                  }}
                  className={`text-[11px] font-bold border rounded px-2 py-0.5 focus:outline-none transition-colors duration-300 ${isScrolled ? 'border-red-700 bg-red-950/60 text-white' : 'border-gray-300 bg-white text-slate-700'}`}
                >
                  <option value="Superuser">🔑 Role: Super User (Full Region access)</option>
                  <option value="Level2">👔 Role: Country HSE Manager (Lvl 2 / Write)</option>
                  <option value="Reporter">📝 Role: Reporter (Step 4 Audit only)</option>
                </select>

                <select
                  value={userCountry}
                  disabled={userRole === 'Reporter'}
                  onChange={(e) => setUserCountry(e.target.value)}
                  className={`text-[11px] font-bold border rounded px-2 py-0.5 focus:outline-none transition-colors duration-300 ${isScrolled ? 'border-red-700 bg-red-950/60 text-white disabled:opacity-30' : 'border-gray-300 bg-white text-slate-700 disabled:opacity-50 disabled:bg-gray-100'} disabled:cursor-not-allowed`}
                >
                  {COUNTRIES.map(cty => (
                    <option key={cty} value={cty}>Market: {cty}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DKSH CORPORATE LOGO SVG */}
            <div className={`flex items-center justify-center md:justify-end gap-4 border-t pt-4 w-full md:w-auto md:border-t-0 md:pt-0 md:border-l md:pl-5 transition-colors duration-300 ${isScrolled ? 'border-red-700/60' : 'border-gray-200'}`}>
              <div className="text-right text-xs">
                <span className={`transition-colors duration-300 ${isScrolled ? 'text-red-200' : 'text-gray-400'}`}>Welcome, </span>
                <strong className={`transition-colors duration-300 ${isScrolled ? 'text-white' : 'text-slate-800'}`}>{userRole === 'Superuser' ? 'Global Admin' : `Coord (${userCountry})`}</strong>
              </div>
              <div className={`flex items-center justify-center select-none p-1 rounded transition-colors duration-300 ${isScrolled ? 'bg-transparent border border-transparent' : 'bg-white border border-slate-100 shadow-xs'}`} style={{ minHeight: '40px' }}>
                <svg 
                  viewBox="0 0 165 54" 
                  className="rounded object-contain shrink-0" 
                  style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Left side red/white semi-circle */}
                  <path d="M 35,6 A 21,21 0 0 0 35,48 Z" fill={isScrolled ? "white" : "#BE0028"} />
                  {/* Right side white/red semi-circle making the circle complete and robust on any background */}
                  <path d="M 35,6 A 21,21 0 0 1 35,48 Z" fill={isScrolled ? "#BE0028" : "white"} />
                  
                  {/* Palm tree branches scaled down slightly (0.72x) to fit fully inside the circle bounds */}
                  <g transform="translate(35, 27) scale(0.72)">
                    {/* Left branches (white or background color in red-scrolled header) */}
                    <path d="M0,0 C -2,-10 -6,-19 -9,-23 C -5,-15 -2,-8 0,0" fill={isScrolled ? "#BE0028" : "white"} />
                    <path d="M0,0 C -5,-9 -12,-16 -17,-19 C -10,-12 -3,-6 0,0" fill={isScrolled ? "#BE0028" : "white"} />
                    <path d="M0,0 C -8,-7 -17,-11 -22,-13 C -14,-8 -5,-4 0,0" fill={isScrolled ? "#BE0028" : "white"} />
                    <path d="M0,0 C -10,-4 -20,-4 -24,-6 C -16,-3 -6,-2 0,0" fill={isScrolled ? "#BE0028" : "white"} />
                    <path d="M0,0 C -10,-1 -21,-1 -25,0 C -17,1 -7,1 0,0" fill={isScrolled ? "#BE0028" : "white"} />
                    
                    {/* Right branches (red or scrolled-white header) */}
                    <path d="M0,0 C 2,-10 6,-19 9,-23 C 5,-15 2,-8 0,0" fill={isScrolled ? "white" : "#BE0028"} />
                    <path d="M0,0 C 5,-9 12,-16 17,-19 C 10,-12 3,-6 0,0" fill={isScrolled ? "white" : "#BE0028"} />
                    <path d="M0,0 C 8,-7 17,-11 22,-13 C 14,-8 5,-4 0,0" fill={isScrolled ? "white" : "#BE0028"} />
                    <path d="M0,0 C 10,-4 20,-4 24,-6 C 16,-3 6,-2 0,0" fill={isScrolled ? "white" : "#BE0028"} />
                    <path d="M0,0 C 10,-1 21,-1 25,0 C 17,1 7,1 0,0" fill={isScrolled ? "white" : "#BE0028"} />
                  </g>
                  
                  {/* Bold red/white DKSH text */}
                  <text x="68" y="38" fill={isScrolled ? "white" : "#BE0028"} fontSize="31" fontWeight="900" fontFamily="'Noto Sans', Arial, sans-serif" letterSpacing="-1.5px">DKSH</text>
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* 2. SUB NAVIGATION RAILS (DKSH CRM horizontal links style) */}
        <div className="hidden md:block bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center gap-4">
          
          <div className="flex gap-6 overflow-x-auto scrollbar-none w-full md:w-auto">
            {[
              { id: 'RegionalDashboard', label: 'Regional dashboard' },
              { id: 'CountryDashboard', label: 'Country dashboard' },
              { id: 'MyTickets', label: 'My HSE Tickets Log' },
              { id: 'NewTicket', label: 'New ticket' },
              { id: 'DCConfig', label: 'Masters (DC Config)' }
            ].map((tab) => {
              let active = false;
              if (tab.id === 'RegionalDashboard') {
                active = activeTab === 'Dashboard' && dashboardCountry === 'Overall';
              } else if (tab.id === 'CountryDashboard') {
                active = activeTab === 'Dashboard' && dashboardCountry !== 'Overall';
              } else if (tab.id === 'MyTickets') {
                active = activeTab === 'MyTickets';
              } else if (tab.id === 'NewTicket') {
                active = activeTab === 'ReportForm' && activeEditId === null;
              } else if (tab.id === 'DCConfig') {
                active = activeTab === 'DCConfig';
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'RegionalDashboard') {
                      setActiveTab('Dashboard');
                      setDashboardCountry('Overall');
                    } else if (tab.id === 'CountryDashboard') {
                      setActiveTab('Dashboard');
                      setDashboardCountry(userCountry === 'Overall' ? 'Malaysia' : userCountry);
                    } else if (tab.id === 'MyTickets') {
                      setActiveTab('MyTickets');
                    } else if (tab.id === 'NewTicket') {
                      setActiveTab('ReportForm');
                      setActiveEditId(null);
                    } else if (tab.id === 'DCConfig') {
                      setActiveTab('DCConfig');
                    }
                  }}
                  className={`text-[15px] py-3.5 px-1 transition relative font-medium cursor-pointer whitespace-nowrap ${
                    active
                      ? 'text-dksh-red font-bold after:content-[""] after:absolute before:duration-200 after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-dksh-red'
                      : 'text-gray-500 hover:text-dksh-red'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-dksh-gray uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active: {dashboardCountry === 'Overall' ? 'All Region' : `${dashboardCountry}`}</span>
          </div>

        </div>
      </div>
    </header>

      {/* 3. CORE ROUTER STAGE */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 main-content-stage" id="main-content-stage-container">
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start" id="desktop-layout-wrapper">
          
          {/* Main Display Core Container */}
          <div className={`${activeTab === 'ReportForm' ? 'xl:col-span-9' : 'xl:col-span-12'}`} id="main-display-core-container">
            
            {activeTab === 'Dashboard' && (
              <Dashboard
                userRole={userRole}
                userCountry={userCountry}
                setUserRole={setUserRole}
                setUserCountry={setUserCountry}
                reports={reports}
                workingHours={workingHours}
                onSaveWorkingHours={handleSaveWorkingHours}
                filterCountry={dashboardCountry}
                setFilterCountry={setDashboardCountry}
              />
            )}

            {activeTab === 'ReportForm' && (
              <InspectionForm
                userRole={userRole}
                userCountry={userCountry}
                distributionCenters={distributionCenters}
                onSaveReport={handleSaveReport}
                activeReportId={activeEditId}
                onClearActiveId={() => setActiveEditId(null)}
                allExistingReports={reports}
              />
            )}

            {activeTab === 'DCConfig' && (
              <DCConfig
                userRole={userRole}
                distributionCenters={distributionCenters}
                onAddDC={handleAddDC}
                onToggleStatus={handleToggleDCStatus}
              />
            )}

            {activeTab === 'MyTickets' && (
              <TicketsLog
                reports={reports}
                onSelectReport={(report) => {
                  if (report.status === 'draft') {
                    setActiveEditId(report.id);
                    setActiveTab('ReportForm');
                  }
                }}
                onDeleteReport={handleDeleteReport}
              />
            )}

          </div>

          {/* SIDE DRAFT CATALOG: Visible only when form active */}
          {activeTab === 'ReportForm' && (
            <div className="xl:col-span-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-xl space-y-4" id="active-drafts-catalog-container">
              
              <div className="border-b pb-3.5">
                <h4 className="font-bold text-xs text-gray-900 uppercase tracking-widest flex items-center gap-1">
                  <FileCheck2 className="w-4 h-4 text-dksh-red" /> Active Drafts Catalog
                </h4>
                <p className="text-[10px] text-gray-400 mt-1">
                  Draft submissions logged in offline/local storage. Click to edit/load below.
                </p>
              </div>

              {/* Roster list drafts */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {reports
                  .filter(r => r.status === 'draft')
                  .map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setActiveEditId(r.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer text-left transition ${
                        activeEditId === r.id
                          ? 'bg-red-50/50 border-red-200 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start text-[10px] text-slate-400 font-mono mb-1.5">
                        <span>{r.date}</span>
                        <span className="bg-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded uppercase font-bold text-[8px]">
                          {r.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {r.occurrenceTitle || 'Untitled Draft Log'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">
                        Category: {r.category} | {r.location || r.country}
                      </div>

                      {/* Delete layout button */}
                      <div className="flex justify-between items-center border-t border-slate-200/50 mt-3.5 pt-2 text-[9px] font-bold text-dksh-red">
                        <span>Click to load draft</span>
                        <button
                          onClick={(e) => handleDeleteReport(r.id, e)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded transition"
                          title="Delete draft"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                {reports.filter(r => r.status === 'draft').length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6 italic font-medium">
                    No open drafts found in memory. Press 'Save Draft' during reporting to record.
                  </p>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 py-2 shadow-lg">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {[
            { id: 'RegionalDashboard', label: 'Regional', icon: Globe },
            { id: 'CountryDashboard', label: 'Country', icon: MapPin },
            { id: 'MyTickets', label: 'Tickets', icon: ClipboardList },
            { id: 'NewTicket', label: 'New', icon: PlusCircle },
            { id: 'DCConfig', label: 'Masters', icon: Settings }
          ].map((tab) => {
            let active = false;
            if (tab.id === 'RegionalDashboard') {
              active = activeTab === 'Dashboard' && dashboardCountry === 'Overall';
            } else if (tab.id === 'CountryDashboard') {
              active = activeTab === 'Dashboard' && dashboardCountry !== 'Overall';
            } else if (tab.id === 'MyTickets') {
              active = activeTab === 'MyTickets';
            } else if (tab.id === 'NewTicket') {
              active = activeTab === 'ReportForm' && activeEditId === null;
            } else if (tab.id === 'DCConfig') {
              active = activeTab === 'DCConfig';
            }

            const IconComponent = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'RegionalDashboard') {
                    setActiveTab('Dashboard');
                    setDashboardCountry('Overall');
                  } else if (tab.id === 'CountryDashboard') {
                    setActiveTab('Dashboard');
                    setDashboardCountry(userCountry === 'Overall' ? 'Malaysia' : userCountry);
                  } else if (tab.id === 'MyTickets') {
                    setActiveTab('MyTickets');
                  } else if (tab.id === 'NewTicket') {
                    setActiveTab('ReportForm');
                    setActiveEditId(null);
                  } else if (tab.id === 'DCConfig') {
                    setActiveTab('DCConfig');
                  }
                }}
                className={`flex flex-col items-center justify-center py-1 rounded-lg transition-all min-h-[48px] ${
                  active
                    ? 'text-dksh-red font-bold'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <IconComponent className={`w-5 h-5 mb-1 ${active ? 'text-dksh-red' : 'text-gray-400'}`} />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
