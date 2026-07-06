/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IncidentReport, BodyPartKey } from '../types';
import { exportReportToPDF } from '../utils/pdfGenerator';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  FileCheck2,
  FileWarning,
  Activity,
  CheckCircle,
  HelpCircle,
  X,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ListTodo,
  FileDown,
  Users,
  Info
} from 'lucide-react';

interface TicketsLogProps {
  reports: IncidentReport[];
  onSelectReport: (report: IncidentReport) => void;
  onDeleteReport: (id: string, e: React.MouseEvent) => void;
}

const BODY_PART_LABELS: Record<BodyPartKey, string> = {
  head: 'Head',
  eye: 'Eyes',
  face: 'Face',
  ear: 'Ears',
  throat_neck: 'Throat & Neck',
  tooth_teeth: 'Tooth/Teeth',
  shoulder: 'Shoulder',
  lungs: 'Lungs',
  breast: 'Breast/Chest',
  back: 'Back',
  elbow: 'Elbow',
  abdomen_pelvis: 'Abdomen & Pelvis',
  arm: 'Arm',
  hip_leg: 'Hip & Leg',
  hand_wrist: 'Hand & Wrist',
  finger: 'Fingers',
  groin: 'Groin',
  knee: 'Knee',
  foot_ankle: 'Foot & Ankle',
  toe: 'Toes'
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  suddenEvent: '1. Sudden, unexpected, or unintended event',
  externalCause: '2. Caused by an external agent or physical force',
  injuryCausedByEvent: '3. Personal injury or illness was caused by the event',
  causalLink: '4. Causal link established between event and injury',
  occurredInWorkEnvironment: '5. Event occurred in the workplace/work environment',
  workRelated: '6. Incident is work-related (DKSH course of employment)',
  resultsInDeath: '7. Results in Death',
  recoveryMoreThan6Months: '8. Results in significant injury/illness with recovery > 6 months',
  absenceMoreThanOneDay: '9. Results in absence from work for > 1 calendar day (LTI)',
  restrictedWorkOrChangeRole: '10. Results in restricted work or temporary transfer/change of role',
  lossOfConsciousness: '11. Results in loss of consciousness',
  medicalTreatmentBeyondFirstAid: '12. Requires medical treatment beyond first aid (MTC)',
  significantInjuryDiagnosedByPhysician: '13. Significant injury/illness diagnosed by physician',
  firstAidOnly: '14. First-aid treatment only (FAC)',
  equipmentOrPropertyDamage: '15. Caused equipment or property damage (PD)',
  potentialToCauseInjury: '16. Had potential to cause injury/illness (Near Miss)',
  hazardObservationPotentialHarm: '17. Hazard observation with potential for harm'
};

export default function TicketsLog({ reports, onSelectReport, onDeleteReport }: TicketsLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'investigating' | 'closed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Selected non-draft report for full-page overlay modal
  const [activeEnlargedReport, setActiveEnlargedReport] = useState<IncidentReport | null>(null);

  // Filter reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.occurrenceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: 'draft' | 'investigating' | 'closed') => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
            Draft
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Investigating (Level 2)
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Closed & Verified
          </span>
        );
    }
  };

  const handleRowClick = (r: IncidentReport) => {
    if (r.status === 'draft') {
      // Drafts: Resume right where user left off
      onSelectReport(r);
    } else {
      // Non-drafts: Prompt all details in a single page (modal)
      setActiveEnlargedReport(r);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary stats */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-dksh-red" />
            My HSE Tickets & Compliance Log
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Complete database of your submitted and active draft tickets. Click any row to view full details or resume edits.
          </p>
        </div>

        {/* Mini stats counters */}
        <div className="flex gap-3">
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 text-center">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</div>
            <div className="text-base font-extrabold text-slate-800">{reports.length}</div>
          </div>
          <div className="bg-amber-50/50 px-3.5 py-2 rounded-xl border border-amber-100/70 text-center">
            <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Investigating</div>
            <div className="text-base font-extrabold text-amber-700">
              {reports.filter(r => r.status === 'investigating').length}
            </div>
          </div>
          <div className="bg-emerald-50/50 px-3.5 py-2 rounded-xl border border-emerald-100/70 text-center">
            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Closed</div>
            <div className="text-base font-extrabold text-emerald-700">
              {reports.filter(r => r.status === 'closed').length}
            </div>
          </div>
          <div className="bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200/50 text-center">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Drafts</div>
            <div className="text-base font-extrabold text-gray-700">
              {reports.filter(r => r.status === 'draft').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, location, country, category, ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-dksh-red focus:bg-white transition"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-dksh-red focus:bg-white appearance-none cursor-pointer"
            >
              <option value="all">🔍 All Statuses</option>
              <option value="draft">📁 Drafts Only</option>
              <option value="investigating">🚨 Investigating (Level 2)</option>
              <option value="closed">✅ Closed & Verified</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-dksh-red focus:bg-white appearance-none cursor-pointer"
            >
              <option value="all">📂 All Categories</option>
              <option value="Injury">Injury</option>
              <option value="Ill-health">Ill-health</option>
              <option value="Property damaged">Property damaged</option>
              <option value="Near miss">Near miss</option>
              <option value="Hazard Observation">Hazard Observation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container (Responsive) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Mobile View: Card List (touch friendly, beautifully laid out) */}
        <div className="block md:hidden p-4 space-y-4 divide-y divide-gray-100">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 select-none">
            Logged Safety Tickets ({filteredReports.length})
          </div>
          {filteredReports.map((r, rIdx) => (
            <div
              key={r.id}
              onClick={() => handleRowClick(r)}
              className={`pt-4 ${rIdx === 0 ? 'pt-1' : ''} group hover:bg-slate-50/50 transition-colors rounded-lg text-slate-900`}
            >
              <div className="bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 shadow-xs">
                {/* ID & Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-gray-500 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    {r.id}
                  </span>
                  {getStatusBadge(r.status)}
                </div>

                {/* Title */}
                <div>
                  <h4 className="font-black text-slate-900 text-sm leading-snug group-hover:text-dksh-red transition-colors">
                    {r.occurrenceTitle || (
                      <span className="text-gray-400 italic font-normal">Untitled Draft Log</span>
                    )}
                  </h4>
                  {r.status === 'draft' && r.lastStep && (
                    <span className="inline-block text-[9px] text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded font-extrabold mt-1 uppercase tracking-wider">
                      Progress: Step {r.lastStep}/4
                    </span>
                  )}
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100/80 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Market / Site Location</span>
                    <span className="font-bold text-slate-800 block leading-tight">{r.country}</span>
                    <span className="text-[10px] text-gray-500 truncate block mt-0.5 max-w-[140px]">{r.location || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">HSE Category</span>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 mt-0.5">
                      {r.category}
                    </span>
                  </div>
                </div>

                {/* Footer time & Actions with 44px touch targets */}
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100/80 gap-2 flex-wrap">
                  <div className="text-[10px] text-gray-500 font-medium font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{r.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleRowClick(r)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[40px] ${
                        r.status === 'draft'
                          ? 'bg-amber-100 hover:bg-amber-150 text-amber-900 border border-amber-200'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                      }`}
                    >
                      {r.status === 'draft' ? (
                        <>
                          <span>Resume</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-800" />
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-indigo-700" />
                          <span>Enlarge</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => onDeleteReport(r.id, e)}
                      className="p-2.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition min-h-[40px]"
                      title="Delete ticket permanent"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="text-center py-12 text-gray-400 italic">
              <FileWarning className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No safety tickets or drafts matched your filter criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full-Featured High Density Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Occurrence Title</th>
                <th className="px-6 py-4">Market / Site Location</th>
                <th className="px-6 py-4">HSE Category</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Trace Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {filteredReports.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => handleRowClick(r)}
                  className="hover:bg-slate-50/75 cursor-pointer transition group"
                >
                  {/* Ticket ID */}
                  <td className="px-6 py-4 font-mono text-gray-500 text-[11px] font-medium">
                    {r.id}
                  </td>
                  
                  {/* Title */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 group-hover:text-dksh-red transition truncate max-w-[200px]">
                      {r.occurrenceTitle || (
                        <span className="text-gray-400 italic">Untitled Draft Log</span>
                      )}
                    </div>
                    {r.status === 'draft' && r.lastStep && (
                      <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">
                        Progress: Step {r.lastStep}/4
                      </span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{r.country}</div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[150px]">
                      {r.location || 'Not Specified'}
                    </div>
                  </td>

                  {/* HSE Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {r.category}
                    </span>
                  </td>

                  {/* Date Time */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {r.date}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {r.time}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {getStatusBadge(r.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRowClick(r)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                          r.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                        }`}
                        title={r.status === 'draft' ? 'Resume draft editing' : 'Enlarge to view all details'}
                      >
                        {r.status === 'draft' ? (
                          <>
                            <span>Resume</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Enlarge</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => onDeleteReport(r.id, e)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Delete ticket permanent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 italic">
                    <FileWarning className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No safety tickets or drafts matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE SINGLE-PAGE ENLARGED VIEW MODAL FOR NON-DRAFT REPORTS */}
      {/* ========================================================================= */}
      {activeEnlargedReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-start overflow-y-auto p-4 md:p-8 z-[100] animate-fade-in text-gray-900">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-150 overflow-hidden my-4 flex flex-col text-slate-950">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#9D2235] text-white px-2.5 py-1 rounded">
                    HSE Compliance Incident Report
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    ID: {activeEnlargedReport.id}
                  </span>
                  <span className="bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded text-xs font-semibold uppercase">
                    {activeEnlargedReport.category}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {activeEnlargedReport.occurrenceTitle || 'HSE Ticket Details Log'}
                </h1>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportReportToPDF(activeEnlargedReport)}
                  className="bg-[#9D2235] hover:bg-[#801b2a] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  title="Export this transaction as PDF matching input form format"
                >
                  <FileDown className="w-4 h-4" />
                  Export to PDF
                </button>
                <button
                  onClick={() => setActiveEnlargedReport(null)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Close ticket review"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Single Page Comprehensive layout) */}
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[75vh]">
              
              {/* STEP 1: OCCURRENCE CONTEXT */}
              <div className="space-y-4">
                <div className="border-l-4 border-amber-500 bg-amber-50/50 p-4 rounded-r-lg">
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">STEP 1: OCCURRENCE CONTEXT</h3>
                  <p className="text-xs text-amber-700">Official incident metadata and routing parameters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Occurrence Date</span>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {activeEnlargedReport.date}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Occurrence Time</span>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {activeEnlargedReport.time}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Country / Market Location</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {activeEnlargedReport.country}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Site Location DC</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {activeEnlargedReport.location}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Event Category</span>
                    <p className="text-sm font-bold text-[#9D2235] uppercase">
                      {activeEnlargedReport.category}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CC Email Recipients</span>
                    <p className="text-sm font-semibold text-slate-700 truncate" title={activeEnlargedReport.emailToCc}>
                      {activeEnlargedReport.emailToCc || 'No CC list specified'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Current Report Status</span>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        activeEnlargedReport.status === 'draft' 
                          ? 'bg-gray-100 text-gray-700 border border-gray-200' 
                          : activeEnlargedReport.status === 'investigating'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {activeEnlargedReport.status === 'draft' ? 'Draft' : activeEnlargedReport.status === 'investigating' ? 'Investigating (Level 2)' : 'Closed & Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: DETAILS OF PERSON INVOLVED & WITNESS */}
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 bg-indigo-50/50 p-4 rounded-r-lg">
                  <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide">STEP 2: DETAILS OF PERSON INVOLVED & WITNESS</h3>
                  <p className="text-xs text-indigo-700">Roster logs of primary personnel and observers present during the event.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Involved Personnel */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#9D2235]" />
                      2.1 Involved Personnel Roster
                    </h4>
                    {activeEnlargedReport.involvedPersons && activeEnlargedReport.involvedPersons.length > 0 ? (
                      <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-xs bg-white">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 font-bold text-gray-500 border-b border-slate-100">
                              <th className="p-3">Name</th>
                              <th className="p-3">Staff ID</th>
                              <th className="p-3">Department/BU</th>
                              <th className="p-3">Role Type</th>
                              <th className="p-3">Injured</th>
                              <th className="p-3">Event Location</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-gray-700">
                            {activeEnlargedReport.involvedPersons.map((p, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-900">{p.name}</td>
                                <td className="p-3 font-mono text-[11px] text-gray-500">{p.staffId || 'N/A'}</td>
                                <td className="p-3 font-medium text-slate-700">
                                  {p.department}
                                  {p.businessUnit && <span className="text-gray-400 font-normal"> ({p.businessUnit})</span>}
                                </td>
                                <td className="p-3">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    p.isEmployee ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {p.isEmployee ? 'Employee' : 'Other'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    p.isInjured ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {p.isInjured ? 'Yes (Injured)' : 'No (Involved)'}
                                  </span>
                                </td>
                                <td className="p-3 text-gray-500 truncate max-w-[120px]">{p.placeOfEvent || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic bg-white p-4 rounded-lg border border-slate-100">
                        No involved persons registered in roster logs.
                      </p>
                    )}
                  </div>

                  {/* Witnesses */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-600" />
                      2.2 Witness Roster Records
                    </h4>
                    {activeEnlargedReport.witnesses && activeEnlargedReport.witnesses.length > 0 ? (
                      <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-xs bg-white">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 font-bold text-gray-500 border-b border-slate-100">
                              <th className="p-3">Witness Name</th>
                              <th className="p-3">Staff ID</th>
                              <th className="p-3">Department/BU</th>
                              <th className="p-3">Role Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-gray-700">
                            {activeEnlargedReport.witnesses.map((w, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-900">{w.name}</td>
                                <td className="p-3 font-mono text-[11px] text-gray-500">{w.staffId || 'N/A'}</td>
                                <td className="p-3 font-medium text-slate-700">
                                  {w.department}
                                  {w.businessUnit && <span className="text-gray-400 font-normal"> ({w.businessUnit})</span>}
                                </td>
                                <td className="p-3">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    w.isEmployee ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {w.isEmployee ? 'Employee' : 'Other'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic bg-white p-4 rounded-lg border border-slate-100">
                        No witness logs added to this record.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 3: OCCURRENCE DETAIL / RISK CRITERIA */}
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-4 rounded-r-lg">
                  <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">STEP 3: OCCURRENCE DETAIL, RISK CRITERIA & PHYSICAL TRAUMA</h3>
                  <p className="text-xs text-emerald-700">Brief narrative of the incident, compliance checklists, and injury graphics.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left block (Narrative, Injury type, Affected Body Parts) - 7 cols */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Narrative Summary */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                        <FileWarning className="w-4 h-4 text-[#9D2235]" />
                        Occurrence Description Narrative
                      </h4>
                      <p className="text-xs font-bold text-slate-800 bg-amber-50 p-2.5 rounded border border-amber-100">
                        Title: {activeEnlargedReport.occurrenceTitle || 'N/A'}
                      </p>
                      <div className="p-4 bg-white border border-slate-150 rounded-xl text-xs leading-relaxed text-gray-700 whitespace-pre-wrap font-medium">
                        {activeEnlargedReport.eventDescription || 'No detailed narrative provided for this log.'}
                      </div>
                    </div>

                    {/* Injury Details & Affected Body Parts list */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Injury Types Recorded</span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeEnlargedReport.injuryType && activeEnlargedReport.injuryType.length > 0 ? (
                              activeEnlargedReport.injuryType.map((typeStr, i) => (
                                <span key={i} className="bg-[#9D2235] text-white text-[10px] font-extrabold px-2 py-1 rounded shadow-xs">
                                  {typeStr}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">None logged</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">Affected Body Parts</span>
                          <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                            {Object.entries(activeEnlargedReport.affectedBodyParts || {})
                              .filter(([_, value]) => value === true)
                              .map(([key]) => (
                                <div key={key} className="bg-red-50 text-red-700 border border-red-100 rounded-md px-2 py-1 text-[10px] font-bold flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#9D2235]" />
                                  {BODY_PART_LABELS[key as BodyPartKey] || key}
                                </div>
                              ))}
                            {Object.values(activeEnlargedReport.affectedBodyParts || {}).filter(Boolean).length === 0 && (
                              <span className="text-xs text-gray-400 italic">No physical trauma reported.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info layout */}
                      <div className="border border-slate-150 rounded-xl bg-white p-4 flex flex-col items-start justify-center min-h-[180px]">
                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-2">Occurrence Meta</span>
                        <div className="space-y-2 text-xs text-slate-700">
                          <p><strong>Category:</strong> {activeEnlargedReport.category}</p>
                          <p><strong>Location Details:</strong> {activeEnlargedReport.location}</p>
                          <p><strong>Date & Time:</strong> {activeEnlargedReport.date} at {activeEnlargedReport.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right block (Compliance Checklist) - 5 cols */}
                  <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        HSE Compliance Checklist
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        System-evaluated compliance criteria for auditing trails:
                      </p>
                      
                      <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                        {Object.entries(activeEnlargedReport.classification || {}).map(([key, value]) => {
                          let isTrue = false;
                          let valStr = '';

                          if (typeof value === 'boolean') {
                            isTrue = value;
                            valStr = isTrue ? 'YES' : 'NO';
                          } else if (value && typeof value === 'object') {
                            const obj = value as any;
                            isTrue = !!obj.yes;
                            valStr = isTrue ? `YES` : 'NO';
                            if (key === 'absenceMoreThanOneDay' && isTrue && obj.lostTimeDays) {
                              valStr += ` (${obj.lostTimeDays} Days LTI)`;
                            }
                          }

                          // Label mapping
                          const CLASSIFICATION_LABELS: Record<string, string> = {
                            suddenEvent: '1. Sudden, unexpected event',
                            externalCause: '2. Caused by external physical force',
                            injuryCausedByEvent: '3. Personal injury caused by event',
                            causalLink: '4. Causal link established',
                            occurredInWorkEnvironment: '5. Event occurred in workplace',
                            workRelated: '6. Incident is work-related (DKSH)',
                            resultsInDeath: '7. Results in Death',
                            recoveryMoreThan6Months: '8. Recovery > 6 months',
                            absenceMoreThanOneDay: '9. Absence > 1 calendar day (LTI)',
                            restrictedWorkOrChangeRole: '10. Restricted work/role change',
                            lossOfConsciousness: '11. Loss of consciousness',
                            medicalTreatmentBeyondFirstAid: '12. Medical treatment (MTC)',
                            significantInjuryDiagnosedByPhysician: '13. Diagnosed significant injury',
                            firstAidOnly: '14. First-aid treatment only (FAC)',
                            equipmentOrPropertyDamage: '15. Equipment/property damage (PD)',
                            potentialToCauseInjury: '16. Had potential (Near Miss)',
                            hazardObservationPotentialHarm: '17. Hazard observation'
                          };

                          return (
                            <div
                              key={key}
                              className={`flex items-start justify-between gap-3 text-[10px] p-1.5 rounded-lg border transition ${
                                isTrue
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                                  : 'bg-white border-slate-100 text-gray-500'
                              }`}
                            >
                              <span className="leading-tight font-medium">
                                {CLASSIFICATION_LABELS[key] || key}
                              </span>
                              <span className={`font-bold uppercase px-1.5 py-0.5 rounded text-[8px] ${
                                isTrue ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {valStr}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4: INVESTIGATION & ACTIONS */}
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 bg-indigo-50/50 p-4 rounded-r-lg">
                  <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide">STEP 4: INVESTIGATION, CORRECTIVE ACTIONS & SIGN-OFF</h3>
                  <p className="text-xs text-indigo-700">Root cause 5-Why methodology analysis, corrective actions, and sign-off status.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 5-Why Analysis */}
                  {activeEnlargedReport.category !== 'Hazard Observation' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                        <ListTodo className="w-4 h-4 text-indigo-600" />
                        4.1 Root Cause Investigation (5-Why Methodology)
                      </h4>
                      
                      <div className="space-y-2.5 text-xs">
                        {[
                          { num: 1, title: 'Why 1 (Incident Occurred)', val: activeEnlargedReport.investigation?.whyHappened },
                          { num: 2, title: 'Why 2 (Immediate Cause)', val: activeEnlargedReport.investigation?.whyFirstCause },
                          { num: 3, title: 'Why 3 (System Failure)', val: activeEnlargedReport.investigation?.whySystemFailed },
                          { num: 4, title: 'Why 4 (Control Ineffectiveness)', val: activeEnlargedReport.investigation?.whyControlIneffective },
                          { num: 5, title: 'Why 5 (Process or Systemic Gap - Root Cause)', val: activeEnlargedReport.investigation?.whyGapExists }
                        ].map((why) => (
                          <div key={why.num} className="p-2.5 bg-white border border-slate-200/60 rounded-xl">
                            <span className="font-extrabold text-[9px] text-indigo-600 block uppercase tracking-wider mb-0.5">{why.title}</span>
                            <p className="text-gray-700 font-medium leading-relaxed">{why.val || 'Not analyzed.'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CAPA Plan & Verification */}
                  <div className={`space-y-6 ${activeEnlargedReport.category === 'Hazard Observation' ? 'md:col-span-2' : ''}`}>
                    {/* Actions */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        4.2 Proposed Corrective & Preventive Action (CAPA)
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div className="p-2.5 bg-white border border-slate-200/60 rounded-xl">
                          <span className="font-extrabold text-[9px] text-emerald-600 block uppercase tracking-wider mb-0.5">Immediate Corrective Actions</span>
                          <p className="text-gray-700 font-medium">{activeEnlargedReport.actions?.immediateCorrective || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200/60 rounded-xl">
                          <span className="font-extrabold text-[9px] text-emerald-600 block uppercase tracking-wider mb-0.5">Long-Term Preventive Actions</span>
                          <p className="text-gray-700 font-medium">{activeEnlargedReport.actions?.longTermPreventive || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200/60 rounded-xl flex justify-between items-center">
                          <span className="font-extrabold text-[9px] text-gray-500 uppercase tracking-wider">Target Completion Date</span>
                          <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {activeEnlargedReport.actions?.completionDate || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification and Closing */}
                    <div className="bg-emerald-50/20 border border-emerald-150 rounded-2xl p-6 shadow-xs space-y-4">
                      <h4 className="text-xs font-bold text-[#9D2235] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        4.3 Verification & Sign-off Close
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div className="p-2.5 bg-white border border-emerald-100 rounded-xl">
                          <span className="font-extrabold text-[9px] text-emerald-600 block uppercase tracking-wider mb-0.5">Verified By</span>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-bold">{activeEnlargedReport.verification?.verifiedBy || 'Pending verification'}</span>
                            {activeEnlargedReport.verification?.dateOfVerification && (
                              <span className="text-gray-400 font-mono text-[9px]">{activeEnlargedReport.verification.dateOfVerification}</span>
                            )}
                          </div>
                          {activeEnlargedReport.verification?.remarks && (
                            <p className="text-gray-500 text-[10px] mt-1.5 border-t border-slate-150 pt-1.5 italic">
                              Remarks: {activeEnlargedReport.verification.remarks}
                            </p>
                          )}
                        </div>

                        <div className="p-2.5 bg-white border border-emerald-100 rounded-xl">
                          <span className="font-extrabold text-[9px] text-gray-500 block uppercase tracking-wider mb-0.5">4.4 Supplementary Closing Remarks</span>
                          <p className="text-gray-700 italic font-medium">
                            {activeEnlargedReport.closeRemarks || 'No supplementary close notes.'}
                          </p>
                        </div>

                        {/* PDPA Consent Status */}
                        <div className="p-2.5 bg-white border border-rose-100 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                            <span className="font-bold text-rose-950">PDPA Consent Statement</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            activeEnlargedReport.pdpaConsent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {activeEnlargedReport.pdpaConsent ? '✓ Agreed' : '✗ Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t px-6 py-4 flex justify-between items-center gap-4">
              <span className="text-[10px] font-mono text-gray-400">
                Logged in offline safety log catalog on {new Date(activeEnlargedReport.createdAt).toLocaleDateString()}
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 transition"
                >
                  Print Report
                </button>
                <button
                  onClick={() => setActiveEnlargedReport(null)}
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                >
                  Done View
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
