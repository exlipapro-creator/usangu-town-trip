import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  History, ShieldCheck, Play, CheckCircle2, 
  Clock, Database, Users, Lock, Search 
} from 'lucide-react';

export const AuditAndAdmin: React.FC = () => {
  const { state, runBackgroundJob } = useApp();
  const [activeTab, setActiveTab] = useState<'audit' | 'jobs' | 'rbac'>('audit');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = state.auditLogs.filter(log => {
    return log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.details.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-amber-500" />
            Audit Governance & Automated Background Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable system audit logs, automated cron tasks, and role-based operational permissions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'audit' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          System Audit Log ({state.auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'jobs' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Background Scheduled Jobs ({state.backgroundJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'rbac' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          RBAC Permissions Matrix
        </button>
      </div>

      {/* AUDIT LOG VIEW */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="flex items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit trail by actor, action, trip ref, or work order #..."
                className="w-full min-h-[44px] bg-slate-950 text-slate-200 text-xs rounded-lg pl-9 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3 px-4">Timestamp (EAT)</th>
                    <th className="py-3 px-4">Actor & Department</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Event Details</th>
                    <th className="py-3 px-4 text-right">Transition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/60 font-sans">
                      <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{log.actor}</div>
                        <div className="text-[10px] text-slate-500">{log.role}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">
                        {log.resource}: {log.resourceId}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs max-w-md">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-right text-[10px] text-slate-500">
                        {log.previousState && log.newState ? (
                          <span>{log.previousState} → {log.newState}</span>
                        ) : (
                          <span>Recorded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Audit Event Cards */}
            <div className="md:hidden divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                        {log.action}
                      </span>
                      <div className="font-mono text-slate-400 text-[10px] mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px] truncate max-w-[140px]">
                      {log.resource}: {log.resourceId}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs">
                    {log.details}
                  </p>

                  <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>By: <strong className="text-white">{log.actor}</strong> ({log.role})</span>
                    {log.previousState && log.newState && (
                      <span className="font-mono text-amber-400 text-[10px]">{log.previousState} → {log.newState}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND JOBS VIEW */}
      {activeTab === 'jobs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Database-Backed Background Job Queue</h3>
              <p className="text-xs text-slate-400">Zero external cloud costs · Runs locally inside application engine</p>
            </div>
          </div>

          <div className="space-y-3">
            {state.backgroundJobs.map(job => (
              <div key={job.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{job.jobName}</span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                      {job.frequency}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded">
                      IDLE / READY
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    <strong>Last Result:</strong> {job.lastResult}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Last Run: {new Date(job.lastRun).toLocaleTimeString()} · Next: {new Date(job.nextRun).toLocaleTimeString()}
                  </div>
                </div>

                <button
                  onClick={() => runBackgroundJob(job.id)}
                  className="w-full md:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer touch-manipulation"
                >
                  <Play className="w-4 h-4" />
                  <span>Execute Task Now</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RBAC MATRIX VIEW */}
      {activeTab === 'rbac' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Role-Based Access Control (RBAC) Governance</h3>
            <p className="text-xs text-slate-400">Separation of duties across Operations, Yard, Workshop, Stores & Safety</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Role Persona</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Operational Authorities</th>
                  <th className="py-2.5 px-3">Restricted Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                <tr className="hover:bg-slate-850">
                  <td className="py-3 px-3 font-bold text-amber-400">Operations Manager</td>
                  <td className="py-3 px-3 text-slate-300">Town Trip Operations</td>
                  <td className="py-3 px-3 text-slate-200">Create trips, approve trips, allocate assets, close completed trips</td>
                  <td className="py-3 px-3 text-slate-500">Cannot issue stock or clear workshop QA releases</td>
                </tr>
                <tr className="hover:bg-slate-850">
                  <td className="py-3 px-3 font-bold text-amber-400">Yard Supervisor</td>
                  <td className="py-3 px-3 text-slate-300">Kurasini Yard Control</td>
                  <td className="py-3 px-3 text-slate-200">Physical vehicle verification, gate dispatch, record returns & odometers</td>
                  <td className="py-3 px-3 text-slate-500">Cannot override critical safety lockouts</td>
                </tr>
                <tr className="hover:bg-slate-850">
                  <td className="py-3 px-3 font-bold text-amber-400">Workshop Supervisor</td>
                  <td className="py-3 px-3 text-slate-300">Central Fleet Workshop</td>
                  <td className="py-3 px-3 text-slate-200">Work order assignment, parts requisition, post-repair QA sign-off & release</td>
                  <td className="py-3 px-3 text-slate-500">Cannot dispatch vehicle directly to town trip</td>
                </tr>
                <tr className="hover:bg-slate-850">
                  <td className="py-3 px-3 font-bold text-amber-400">Stores Officer</td>
                  <td className="py-3 px-3 text-slate-300">Central Stores & Inventory</td>
                  <td className="py-3 px-3 text-slate-200">Stock intake (GRN), requisition approvals, atomic issuance to work orders</td>
                  <td className="py-3 px-3 text-slate-500">Cannot approve stock issue exceeding available stock</td>
                </tr>
                <tr className="hover:bg-slate-850">
                  <td className="py-3 px-3 font-bold text-amber-400">Safety Officer</td>
                  <td className="py-3 px-3 text-slate-300">HSE & Fleet Compliance</td>
                  <td className="py-3 px-3 text-slate-200">Pre/post-trip safety checks, enforce critical defect lockouts, incident investigations</td>
                  <td className="py-3 px-3 text-slate-500">Cannot bypass workshop repair requirements</td>
                </tr>
                <tr className="hover:bg-slate-850">
                  <td className="py-3 px-3 font-bold text-amber-400">Executive Management</td>
                  <td className="py-3 px-3 text-slate-300">Executive Office</td>
                  <td className="py-3 px-3 text-slate-200">Full read-only dashboards, Shunting Ledger, financial summaries</td>
                  <td className="py-3 px-3 text-slate-500">Read-only operational access</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
