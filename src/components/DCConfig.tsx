/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DistributionCenter, UserRole } from '../types';
import { COUNTRIES } from '../utils';
import { Plus, ToggleLeft, ToggleRight, Building, Check, KeySquare, HelpCircle } from 'lucide-react';

interface DCConfigProps {
  userRole: UserRole;
  distributionCenters: DistributionCenter[];
  onAddDC: (dc: Omit<DistributionCenter, 'id'>) => void;
  onToggleStatus: (id: string) => void;
}

export default function DCConfig({
  userRole,
  distributionCenters,
  onAddDC,
  onToggleStatus
}: DCConfigProps) {
  const [newDcName, setNewDcName] = useState('');
  const [newDcCountry, setNewDcCountry] = useState(COUNTRIES[0]);
  const [newDcManager, setNewDcManager] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDcName.trim()) {
      setFeedback('DC Name is mandatory.');
      return;
    }

    onAddDC({
      name: newDcName,
      country: newDcCountry,
      manager: newDcManager || 'Assigned HSE Coordinator',
      status: 'active'
    });

    setNewDcName('');
    setNewDcManager('');
    setFeedback('Successfully added new Distribution Center to site catalog!');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Only Regional HSE Manager (Superuser) is authorized to configure master DC list
  const isAuthorized = userRole === 'Superuser';

  return (
    <div className="space-y-8">
      
      {/* Alert Block regarding Role playing */}
      <div className="bg-[#5A5D60] text-white p-6 rounded-2xl border border-slate-500 flex justify-between items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <KeySquare className="w-5 h-5 text-red-200" />
            <h3 className="font-bold text-sm tracking-tight uppercase">Config Auths: Regional HSE Manager (Super User) Only</h3>
          </div>
          <p className="text-xs text-slate-100">
            Current logged in role has authorization: <strong className={isAuthorized ? 'text-emerald-300 font-bold' : 'text-rose-300'}>{userRole.toUpperCase()}</strong>
          </p>
        </div>
        <div className="text-xs text-red-200 font-mono">
          {!isAuthorized ? 'READ ONLY LIMIT' : 'FULL RW WRITE'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ADD PANEL (Left, 4 Columns) - Restricted */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl self-start">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Building className="text-dksh-red w-5 h-5" />
            <h4 className="font-bold text-sm text-gray-900">Add New Distribution Center (DC)</h4>
          </div>

          {!isAuthorized ? (
            <div className="bg-rose-50 text-rose-800 text-xs p-4 rounded-xl border border-rose-100 space-y-2">
              <p className="font-semibold">⚠️ Access Restricted (Regional HSE Manager Required)</p>
              <p>As per the spreadsheet requirements: <em>"*Super users have the accessibility to add on DC list and user / any relevant information."</em></p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Please use the Role Switcher dropdown in the top header to elevate your role to "Superuser" to test this configuration workflow!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {feedback && (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-100 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" /> {feedback}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">DC / Site Name *</label>
                <input
                  type="text"
                  value={newDcName}
                  onChange={(e) => setNewDcName(e.target.value)}
                  placeholder="E.g. DC Shah Alam Section 15"
                  className="w-full text-xs font-semibold border rounded-lg p-2.5 focus:ring-1 focus:ring-dksh-red bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Country Zone</label>
                <select
                  value={newDcCountry}
                  onChange={(e) => setNewDcCountry(e.target.value)}
                  className="w-full text-xs font-semibold border rounded-lg p-2.5 focus:ring-1 focus:ring-dksh-red bg-white"
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">DC Manager / Safety Lead Name</label>
                <input
                  type="text"
                  value={newDcManager}
                  onChange={(e) => setNewDcManager(e.target.value)}
                  placeholder="E.g. Tan Boon Seng"
                  className="w-full text-xs font-semibold border rounded-lg p-2.5 focus:ring-1 focus:ring-dksh-red bg-gray-50/50"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-dksh-red hover:bg-dksh-dark-red text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Add to DC Catalog List
              </button>
            </form>
          )}
        </div>

        {/* LIST TABLE PANEL (Right, 7 Columns) */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl">
          <div className="border-b pb-3 mb-4">
            <h4 className="font-bold text-sm text-gray-900">Current Site Distribution Centers</h4>
            <p className="text-[11px] text-gray-500">Listed nodes representing active safe logistics facilities.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-xs text-left divide-y divide-gray-100">
              <thead className="bg-gray-50 font-bold text-gray-600">
                <tr>
                  <th className="px-4 py-2.5">Site Name</th>
                  <th className="px-4 py-2.5">Country</th>
                  <th className="px-4 py-2.5">Safety PIC</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  {isAuthorized && <th className="px-4 py-2.5 text-center">Toggle</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {distributionCenters.map((dc) => (
                  <tr key={dc.id} className={dc.status === 'inactive' ? 'opacity-50' : ''}>
                    <td className="px-4 py-3 font-semibold text-gray-950">{dc.name}</td>
                    <td className="px-4 py-3">{dc.country}</td>
                    <td className="px-4 py-3 text-gray-500 italic">{dc.manager}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        dc.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {dc.status}
                      </span>
                    </td>
                    {isAuthorized && (
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(dc.id)}
                          className="hover:bg-gray-100 p-1 rounded transition"
                          title="Toggle Active status"
                        >
                          {dc.status === 'active' ? (
                            <ToggleRight className="w-6 h-6 text-dksh-red mx-auto" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-400 mx-auto" />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Guidelines notes */}
          <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-dashed flex gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-500">
              <p className="font-bold uppercase tracking-wider mb-1">Spreadsheet Note Guidelines</p>
              <p>Adding DC entries synchronizes immediately with Step 1 location dropdown lists. Toggle inactive status to retire older staging bays from newer inspection reports.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
