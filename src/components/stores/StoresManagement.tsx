import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Part, SpareRequest, StockMovement } from '../../types';
import { 
  Package, AlertTriangle, Plus, CheckCircle2, 
  ArrowDownLeft, ArrowUpRight, Search, Filter, 
  X, Check, History, Layers
} from 'lucide-react';

export const StoresManagement: React.FC = () => {
  const { 
    state, 
    receiveStock, 
    approveSpareRequest, 
    issueSparePart, 
    adjustStock 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalogue' | 'requisitions' | 'ledger'>('catalogue');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Form: Receive Stock
  const [rcvPartId, setRcvPartId] = useState(state.parts[0]?.id || '');
  const [rcvQty, setRcvQty] = useState<number>(10);
  const [rcvCost, setRcvCost] = useState<number>(85000);
  const [rcvDoc, setRcvDoc] = useState('GRN-2026-0450 (Dar Auto Spares Ltd)');
  const [rcvReason, setRcvReason] = useState('Monthly town fleet fast-moving consumable replenishment');
  const [receiveError, setReceiveError] = useState<string | null>(null);

  // Form: Adjust Stock
  const [adjPartId, setAdjPartId] = useState(state.parts[0]?.id || '');
  const [adjNewQty, setAdjNewQty] = useState<number>(5);
  const [adjReason, setAdjReason] = useState('Physical stocktake count reconciliation');

  // Issue error state
  const [issueError, setIssueError] = useState<string | null>(null);

  const lowStockParts = state.parts.filter(p => p.currentStock <= p.minimumStock);

  const filteredParts = state.parts.filter(p => {
    const matchesSearch = p.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.partCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());
    if (categoryFilter === 'all') return matchesSearch;
    return matchesSearch && p.category === categoryFilter;
  });

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReceiveError(null);

    const res = receiveStock({
      partId: rcvPartId,
      quantity: rcvQty,
      unitCostTZS: rcvCost,
      referenceDoc: rcvDoc,
      reason: rcvReason
    });

    if (!res.success) {
      setReceiveError(res.error || 'Failed to receive stock');
    } else {
      setIsReceiveModalOpen(false);
    }
  };

  const handleIssueSubmit = (reqId: string) => {
    setIssueError(null);
    const res = issueSparePart(reqId);
    if (!res.success) {
      setIssueError(res.error || 'Failed to issue part');
    }
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(adjPartId, adjNewQty, adjReason);
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            Central Stores & Spare Parts Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transaction-backed perpetual stock ledger, work order requisitions, and zero-deficit controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setReceiveError(null);
              setIsReceiveModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Receive Inventory (GRN)</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockParts.length > 0 && (
        <div className="bg-red-950/30 border border-red-800/80 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-red-400 font-bold text-xs uppercase flex items-center gap-1.5 tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Low Stock Replenishment Alert ({lowStockParts.length} Critical Items)
            </span>
            <span className="text-slate-400 text-[11px]">Threshold triggered by automated job engine</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {lowStockParts.map(p => (
              <div key={p.id} className="bg-slate-900/90 p-2.5 rounded border border-red-900/40 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">{p.partName}</div>
                  <div className="text-[10px] text-slate-400">{p.partCode} • {p.storageLocation}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-red-400">{p.currentStock} {p.unitOfMeasure}</div>
                  <div className="text-[10px] text-slate-500">Min: {p.minimumStock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requisition Error Alert (if any) */}
      {issueError && (
        <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <span>{issueError}</span>
          </div>
          <button onClick={() => setIssueError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
              activeTab === 'catalogue' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Parts Catalogue ({state.parts.length})
          </button>
          <button
            onClick={() => setActiveTab('requisitions')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
              activeTab === 'requisitions' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Requisitions Queue ({state.spareRequests.filter(s => s.status === 'pending_approval' || s.status === 'approved').length} Active)
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
              activeTab === 'ledger' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stock Movement Ledger ({state.stockMovements.length})
          </button>
        </div>

        {activeTab === 'catalogue' && (
          <div className="flex items-center gap-2 pr-2">
            <button
              onClick={() => setIsAdjustModalOpen(true)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700"
            >
              Audited Stocktake Adjustment
            </button>
          </div>
        )}
      </div>

      {/* CATALOGUE VIEW */}
      {activeTab === 'catalogue' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search part code, description, shelf location..."
                className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 text-slate-300 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Braking">Braking</option>
              <option value="Filters & Oils">Filters & Oils</option>
              <option value="Tyres & Wheels">Tyres & Wheels</option>
              <option value="Electrical">Electrical</option>
              <option value="Suspension">Suspension</option>
            </select>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3.5 px-4">Part Code</th>
                    <th className="py-3.5 px-4">Part Name & Specification</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Available Stock</th>
                    <th className="py-3.5 px-4">Min Threshold</th>
                    <th className="py-3.5 px-4">Unit Cost (TZS)</th>
                    <th className="py-3.5 px-4">Storage Location</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredParts.map((p) => {
                    const isLow = p.currentStock <= p.minimumStock;
                    return (
                      <tr key={p.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {p.partCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{p.partName}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {p.category}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-sm font-bold">
                          <span className={isLow ? 'text-red-400 font-black' : 'text-emerald-400'}>
                            {p.currentStock} {p.unitOfMeasure}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {p.minimumStock} {p.unitOfMeasure}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-200">
                          TZS {p.unitCostTZS.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                          {p.storageLocation}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isLow ? (
                            <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                              OPTIMAL
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REQUISITIONS VIEW */}
      {activeTab === 'requisitions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Req Ref</th>
                  <th className="py-3.5 px-4">Work Order / Vehicle</th>
                  <th className="py-3.5 px-4">Requested Part</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Justification</th>
                  <th className="py-3.5 px-4">Current Central Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Storekeeper Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {state.spareRequests.map((req) => {
                  const part = state.parts.find(p => p.id === req.partId);
                  const vehicle = state.vehicles.find(v => v.id === req.vehicleId);
                  const wo = state.workOrders.find(w => w.id === req.workOrderId);
                  const canIssue = (part?.currentStock || 0) >= req.quantityRequested;

                  return (
                    <tr key={req.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{req.requestReference}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{vehicle?.fleetNumber}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{wo?.workOrderReference}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{part?.partName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{part?.partCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-sm font-bold text-white">
                        {req.quantityRequested} {part?.unitOfMeasure}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-xs line-clamp-1">
                        {req.justification}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={canIssue ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          {part?.currentStock} {part?.unitOfMeasure}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          req.status === 'issued' ? 'bg-emerald-500/20 text-emerald-300' :
                          req.status === 'approved' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === 'pending_approval' && (
                            <button
                              onClick={() => approveSpareRequest(req.id)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                            >
                              Approve
                            </button>
                          )}
                          {req.status === 'approved' && (
                            <button
                              onClick={() => handleIssueSubmit(req.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              Issue Stock
                            </button>
                          )}
                          {req.status === 'issued' && (
                            <span className="text-[11px] text-slate-500 italic">Dispatched</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOCK MOVEMENT LEDGER VIEW */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              Perpetual Stock Transaction History
            </div>
            <span className="text-xs text-slate-400">All inventory balances derive strictly from these ledger events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Tx Ref</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Part Details</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Quantity Changed</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Reference Document</th>
                  <th className="py-3 px-4">Responsible User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {state.stockMovements.map((sm) => {
                  const part = state.parts.find(p => p.id === sm.partId);
                  const isPositive = sm.quantity > 0;

                  return (
                    <tr key={sm.id} className="hover:bg-slate-850 font-mono text-[11px]">
                      <td className="py-3 px-4 font-bold text-amber-400">{sm.movementReference}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(sm.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-200 font-sans">
                        <div className="font-semibold">{part?.partName}</div>
                        <div className="text-[10px] text-slate-500">{part?.partCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          sm.movementType === 'receipt' ? 'bg-emerald-500/20 text-emerald-300' :
                          sm.movementType === 'issue' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {sm.movementType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                          {isPositive ? `+${sm.quantity}` : sm.quantity} {part?.unitOfMeasure}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-bold">
                        {sm.balanceAfter} {part?.unitOfMeasure}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans text-xs">
                        {sm.referenceDoc || sm.reason}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans text-xs">
                        {sm.performedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECEIVE STOCK MODAL (GRN) */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                Goods Received Note (GRN) Inward Intake
              </h3>
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceiveSubmit} className="p-5 space-y-4 text-xs">
              {receiveError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded text-red-200">
                  {receiveError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Catalogued Spare Part / Oil</label>
                <select
                  value={rcvPartId}
                  onChange={(e) => setRcvPartId(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                >
                  {state.parts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.partCode} - {p.partName} (Current: {p.currentStock} {p.unitOfMeasure})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Received Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={rcvQty}
                    onChange={(e) => setRcvQty(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 text-white font-mono font-bold text-xs rounded-lg p-2.5 border border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unit Cost (TZS)</label>
                  <input
                    type="number"
                    min={0}
                    value={rcvCost}
                    onChange={(e) => setRcvCost(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 text-white font-mono font-bold text-xs rounded-lg p-2.5 border border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Supplier Delivery Note / Invoice Ref</label>
                <input
                  type="text"
                  value={rcvDoc}
                  onChange={(e) => setRcvDoc(e.target.value)}
                  required
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Receiving Notes / Justification</label>
                <input
                  type="text"
                  value={rcvReason}
                  onChange={(e) => setRcvReason(e.target.value)}
                  required
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Record GRN & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-base">Audited Stocktake Adjustment</h3>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Part</label>
              <select
                value={adjPartId}
                onChange={(e) => setAdjPartId(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
              >
                {state.parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.partCode} - {p.partName} (Current: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Verified Physical Count</label>
              <input
                type="number"
                min={0}
                value={adjNewQty}
                onChange={(e) => setAdjNewQty(Number(e.target.value))}
                className="w-full bg-slate-950 text-white font-mono font-bold text-sm rounded-lg p-2 border border-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Audit Reason</label>
              <input
                type="text"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustSubmit}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
