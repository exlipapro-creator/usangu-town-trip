import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelTransaction } from '../../types';
import { 
  Fuel, AlertTriangle, Plus, CheckCircle2, 
  ArrowUpRight, Search, Gauge, DollarSign, X, Check
} from 'lucide-react';

interface FuelManagementProps {
  initialOpenRecord?: boolean;
}

export const FuelManagement: React.FC<FuelManagementProps> = ({
  initialOpenRecord = false
}) => {
  const { state, recordFuelTransaction } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterException, setFilterException] = useState<boolean>(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(initialOpenRecord);

  // Form: Record Fuel
  const [vehicleId, setVehicleId] = useState(state.vehicles[0]?.id || '');
  const [litres, setLitres] = useState<number>(100);
  const [unitPrice, setUnitPrice] = useState<number>(3150);
  const [sourceType, setSourceType] = useState<'company_yard_tank' | 'external_station'>('company_yard_tank');
  const [stationName, setStationName] = useState('Usangu Central Yard Dispenser #1');
  const [odoReading, setOdoReading] = useState<number>(
    (state.vehicles[0]?.currentOdometer || 100000) + 120
  );
  const [driverId, setDriverId] = useState(state.drivers[0]?.id || '');
  const [notes, setNotes] = useState('Full tank top-up for town shunting operations.');
  const [recordError, setRecordError] = useState<string | null>(null);

  const totalLitres = state.fuelTransactions.reduce((acc, f) => acc + f.litres, 0);
  const totalCost = state.fuelTransactions.reduce((acc, f) => acc + f.totalCostTZS, 0);
  const exceptions = state.fuelTransactions.filter(f => f.hasException);

  const validConsumptions = state.fuelTransactions
    .filter(f => f.consumptionLitersPer100Km && f.consumptionLitersPer100Km > 0)
    .map(f => f.consumptionLitersPer100Km as number);
  const fleetAvgConsumption = validConsumptions.length > 0
    ? (validConsumptions.reduce((a, b) => a + b, 0) / validConsumptions.length).toFixed(1)
    : '42.0';

  const filteredTransactions = state.fuelTransactions.filter(f => {
    const vehicle = state.vehicles.find(v => v.id === f.vehicleId);
    const matchesSearch = f.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.supplierOrStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle?.fleetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterException) return matchesSearch && f.hasException;
    return matchesSearch;
  });

  const handleVehicleChange = (vId: string) => {
    setVehicleId(vId);
    const veh = state.vehicles.find(v => v.id === vId);
    if (veh) {
      setOdoReading(veh.currentOdometer + 150);
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecordError(null);

    const res = recordFuelTransaction({
      vehicleId,
      litres,
      unitPriceTZS: unitPrice,
      sourceType,
      supplierOrStation: stationName,
      odometerReading: odoReading,
      driverId,
      notes
    });

    if (!res.success) {
      setRecordError(res.error || 'Failed to record fuel issue');
    } else {
      setIsRecordModalOpen(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <Fuel className="w-6 h-6 text-amber-500" />
            Fuel Management & Burn Rate Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal yard bulk tanks, Puma / Total commercial stations, odometer verification and L/100km controls.
          </p>
        </div>

        <button
          onClick={() => {
            setRecordError(null);
            setIsRecordModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Fuel Transaction</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Fuel Issued</div>
          <div className="text-2xl font-black text-white mt-1">
            {totalLitres.toLocaleString()} <span className="text-xs font-normal text-slate-400">Litres</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {state.fuelTransactions.length} recorded fuelings
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Fuel Spend</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
            TZS {(totalCost / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Avg: TZS 3,175 / Litre
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold uppercase">Fleet Burn Rate</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            {fleetAvgConsumption} <span className="text-xs font-normal text-slate-400">L / 100km</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            High-idle heavy port shunting baseline
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold uppercase">Consumption Anomalies</div>
          <div className="text-2xl font-black text-yellow-400 mt-1 font-mono">
            {exceptions.length} <span className="text-xs font-normal text-slate-400">Flagged</span>
          </div>
          <div className="text-[11px] text-yellow-500/80 mt-2">
            Exceeds 45 L/100km or odo anomaly
          </div>
        </div>
      </div>

      {/* Exception Alert Banner (if any) */}
      {exceptions.length > 0 && (
        <div className="bg-yellow-950/30 border border-yellow-800/80 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-yellow-400 font-bold text-xs uppercase flex items-center gap-1.5 tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Unusual Fuel Burn Rate Exceptions ({exceptions.length})
            </span>
            <button
              onClick={() => setFilterException(!filterException)}
              className="text-xs text-yellow-300 hover:underline font-semibold"
            >
              {filterException ? 'Show All Transactions' : 'Filter Anomalies Only'}
            </button>
          </div>
          <p className="text-xs text-yellow-200/80">
            Usangu automated audit flagged consumption rates exceeding 45 L/100km or zero-distance issues for physical inspection.
          </p>
        </div>
      )}

      {/* Transactions Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Tx #, Station, Fleet # (e.g. FL-2026-0310, Puma, US-TRK-01)..."
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterException(!filterException)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                filterException 
                  ? 'bg-yellow-500 text-slate-950' 
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              Exceptions Only ({exceptions.length})
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Tx Reference</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Volume (Litres)</th>
                  <th className="py-3.5 px-4">Cost (TZS)</th>
                  <th className="py-3.5 px-4">Station / Source</th>
                  <th className="py-3.5 px-4">Odometer & Net Km</th>
                  <th className="py-3.5 px-4">Consumption Rate</th>
                  <th className="py-3.5 px-4">Driver / Issuer</th>
                  <th className="py-3.5 px-4 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTransactions.map((tx) => {
                  const vehicle = state.vehicles.find(v => v.id === tx.vehicleId);
                  const driver = state.drivers.find(d => d.id === tx.driverId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {tx.transactionReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{vehicle?.fleetNumber}</div>
                        <div className="text-[11px] text-slate-400">{vehicle?.registrationNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                        {tx.litres} L
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        <div>TZS {tx.totalCostTZS.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">@{tx.unitPriceTZS}/L</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-semibold text-slate-200">{tx.supplierOrStation}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{tx.sourceType.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <div>Odo: {tx.odometerReading.toLocaleString()} km</div>
                        {tx.distanceTravelledKm && (
                          <div className="text-slate-400 text-[11px] font-sans">
                            Run: {tx.distanceTravelledKm} km
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {tx.consumptionLitersPer100Km ? (
                          <span className={tx.consumptionLitersPer100Km > 45 ? 'text-yellow-400' : 'text-emerald-400'}>
                            {tx.consumptionLitersPer100Km} L/100km
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-sans italic">Baseline</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                        <div>Driver: {driver?.name || 'Assigned'}</div>
                        <div className="text-slate-500">By: {tx.issuedBy}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.hasException ? (
                          <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 text-yellow-400" />
                            EXCEPTION
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            VERIFIED
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

      {/* RECORD FUEL TRANSACTION MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-500" />
                Record Fuel Issue & Odometer Capture
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-5 space-y-4 text-xs">
              {recordError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded text-red-200">
                  {recordError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Prime Mover</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                  >
                    {state.vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.fleetNumber} ({v.registrationNumber}) [Odo: {v.currentOdometer}km]
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assigned Driver</label>
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                  >
                    {state.drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.staffId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fuel Volume (Litres)</label>
                  <input
                    type="number"
                    min={1}
                    value={litres}
                    onChange={(e) => setLitres(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 text-white font-mono font-bold text-sm rounded-lg p-2.5 border border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Price per Litre (TZS)</label>
                  <input
                    type="number"
                    min={1}
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 text-white font-mono font-bold text-sm rounded-lg p-2.5 border border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Dispenser Source</label>
                  <select
                    value={sourceType}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setSourceType(type);
                      setStationName(type === 'company_yard_tank' ? 'Usangu Central Yard Dispenser #1' : 'Puma Energy Kurasini Port Junction');
                    }}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                  >
                    <option value="company_yard_tank">Usangu Central Yard Bulk Tank</option>
                    <option value="external_station">External Commercial Station</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Station / Tank Reference</label>
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    required
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Current Odometer Reading (km)</label>
                <input
                  type="number"
                  value={odoReading}
                  onChange={(e) => setOdoReading(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 text-white font-mono font-bold text-sm rounded-lg p-2.5 border border-slate-800"
                />
                <span className="text-[10px] text-slate-500">
                  Must be equal to or greater than the vehicle's last recorded odometer reading.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Operational Notes / POS Slip #</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-400">Total Transaction Cost:</span>
                <span className="font-bold text-amber-400 text-sm">
                  TZS {(litres * unitPrice).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Commit Fuel Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
