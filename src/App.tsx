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

  // Sync dashboard filter to active simulated role & country
  useEffect(() => {
    if (userRole !== 'Superuser') {
      setDashboardCountry(userCountry);
    } else {
      setDashboardCountry('Overall');
    }
  }, [userRole, userCountry]);

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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F4] text-slate-800 font-sans antialiased pb-28 md:pb-12 selection:bg-red-50">
      
      {/* 1. TOP DOCKS: ACTIVE CLIENT ROLE SIMULATOR & DKSH HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="text-center md:text-left">
            <h1 className="text-xl font-bold tracking-tight text-dksh-red" style={{ fontFamily: 'Georgia, serif' }}>
              HSE CAPA Production System
            </h1>
            <p className="text-[10px] text-dksh-gray uppercase tracking-widest font-mono font-bold mt-0.5">
              Health, Safety, Environment, & Compliance Assurance
            </p>
          </div>

          {/* ROLE SIMULATOR PANEL (Simulates secure SSO credentials) */}
          <div className="hidden md:flex bg-[#F4F4F4] border border-gray-200 px-4 py-2 rounded-lg flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="text-[10px] font-bold text-dksh-gray uppercase tracking-wider">Role Test Environment:</span>
            <div className="flex gap-1.5">
              <select
                value={userRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setUserRole(role);
                }}
                className="text-[11px] font-bold border border-gray-300 rounded bg-white px-2 py-0.5 text-slate-700 focus:outline-none"
              >
                <option value="Superuser">🔑 Role: Super User (Full Region access)</option>
                <option value="Level2">👔 Role: Country HSE Manager (Lvl 2 / Write)</option>
                <option value="Reporter">📝 Role: Reporter (Step 4 Audit only)</option>
              </select>

              <select
                value={userCountry}
                disabled={userRole === 'Reporter'}
                onChange={(e) => setUserCountry(e.target.value)}
                className="text-[11px] font-bold border border-gray-300 rounded bg-white px-2 py-0.5 text-slate-700 focus:outline-none disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {COUNTRIES.map(cty => (
                  <option key={cty} value={cty}>Market: {cty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DKSH CORPORATE LOGO SVG */}
          <div className="flex items-center justify-center md:justify-end gap-4 border-t pt-4 w-full md:w-auto md:border-t-0 md:pt-0 md:border-l md:pl-5 border-gray-200">
            <div className="text-right text-xs">
              <span className="text-gray-400">Welcome, </span>
              <strong className="text-slate-800">{userRole === 'Superuser' ? 'Global Admin' : `Coord (${userCountry})`}</strong>
            </div>
            <div className="flex items-center justify-center select-none p-1 bg-white border border-slate-100 rounded shadow-xs" style={{ minHeight: '40px' }}>
              <svg 
                viewBox="0 0 165 54" 
                className="rounded object-contain shrink-0" 
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Solid official DKSH red background (#BE0028) */}
                <rect width="165" height="54" fill="#BE0028" />
                
                {/* Left side white semi-circle perfectly centered vertically */}
                <path d="M 35,6 A 21,21 0 0 0 35,48 Z" fill="white" />
                
                {/* Palm tree branches scaled down slightly (0.75x) to fit fully inside the circle bounds */}
                <g transform="translate(35, 27) scale(0.75)">
                  {/* Left branches (red, overlaying the white semi-circle background) */}
                  <path d="M0,0 C-2,-12 -12,-20 -21,-20 C-11,-15 -3,-5 0,0" fill="#BE0028" />
                  <path d="M0,0 C2,-12 -5,-23 -13,-25 C-6,-18 -1,-7 0,0" fill="#BE0028" />
                  <path d="M0,0 C6,-10 3,-23 -5,-27 C0,-19 -1,-8 0,0" fill="#BE0028" />
                  
                  {/* Right branches (white, overlaying the red background) */}
                  <path d="M0,0 C10,-8 11,-19 4,-26 C5,-18 2,-8 0,0" fill="white" />
                  <path d="M0,0 C12,-4 15,-12 12,-21 C9,-14 4,-6 0,0" fill="white" />
                  <path d="M0,0 C12,0 17,-4 17,-12 C12,-8 6,-3 0,0" fill="white" />
                </g>
                
                {/* Bold white DKSH text */}
                <text x="68" y="38" fill="white" fontSize="30" fontWeight="900" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" letterSpacing="-1px">DKSH</text>
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SUB NAVIGATION RAILS (DKSH CRM horizontal links style) */}
      <div className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
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
