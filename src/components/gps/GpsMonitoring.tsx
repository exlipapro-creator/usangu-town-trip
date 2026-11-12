import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GpsPosition, GpsTrackingStatus } from '../../types';
import { 
  Navigation, RefreshCw, MapPin, Gauge, Power, 
  Clock, ShieldAlert, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';
import L from 'leaflet';

export const GpsMonitoring: React.FC = () => {
  const { state, refreshGpsTelemetry } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Key Dar es Salaam checkpoints
  const checkpoints = [
    { name: 'Dar Port Gate 4 (TICTS)', lat: -6.8160, lng: 39.2880, type: 'Port Terminal' },
    { name: 'Usangu Central Yard & Workshop (Kurasini)', lat: -6.8530, lng: 39.2782, type: 'Headquarters' },
    { name: 'Bandari Dry Port (TPA)', lat: -6.8390, lng: 39.2810, type: 'Inland Depot' },
    { name: 'Vingunguti ICD (VICD)', lat: -6.8375, lng: 39.2410, type: 'Inland Container Depot' },
    { name: 'Ubungo Freight Station', lat: -6.7860, lng: 39.2080, type: 'Transit Hub' },
  ];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map centered on Dar es Salaam
      const map = L.map(mapContainerRef.current, {
        center: [-6.835, 39.265],
        zoom: 12,
        zoomControl: true
      });

      // OpenStreetMap Tile Layer (Free, OSS per PRD Zero-Cost Rule)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Usangu Telematics',
        maxZoom: 18
      }).addTo(map);

      // Add Checkpoint Markers
      checkpoints.forEach(cp => {
        const depotIcon = L.divIcon({
          className: 'custom-depot-marker',
          html: `<div style="background-color: #0f172a; border: 2px solid #f59e0b; color: #f59e0b; font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap;">🏢 ${cp.name}</div>`,
          iconSize: [120, 24],
          iconAnchor: [60, 12]
        });

        L.marker([cp.lat, cp.lng], { icon: depotIcon })
          .bindPopup(`<b>${cp.name}</b><br><span style="font-size: 11px; color: #64748b;">${cp.type}</span>`)
          .addTo(map);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update vehicle markers whenever positions change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old vehicle markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    state.gpsPositions.forEach(pos => {
      const vehicle = state.vehicles.find(v => v.id === pos.vehicleId);
      const isSelected = selectedVehicleId === pos.vehicleId;

      const getPinColor = (status: GpsTrackingStatus) => {
        switch (status) {
          case 'live': return '#10b981'; // emerald
          case 'delayed': return '#f59e0b'; // amber
          case 'stale': return '#f97316'; // orange
          case 'offline': return '#ef4444'; // red
        }
      };

      const color = getPinColor(pos.trackingStatus);

      const truckIcon = L.divIcon({
        className: 'custom-truck-marker',
        html: `
          <div style="background-color: ${isSelected ? '#f59e0b' : '#0f172a'}; border: 2px solid ${color}; color: #ffffff; font-weight: bold; font-size: 11px; padding: 3px 6px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.6); display: flex; items-center; gap: 4px; white-space: nowrap; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: all 0.2s;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: ${color}; margin-top: 3px;"></span>
            <span>${vehicle?.fleetNumber || pos.deviceId}</span>
            ${pos.speedKmh > 0 ? `<span style="color: #38bdf8; font-size: 9px;">${pos.speedKmh}k</span>` : ''}
          </div>
        `,
        iconSize: [85, 26],
        iconAnchor: [42, 13]
      });

      const marker = L.marker([pos.latitude, pos.longitude], { icon: truckIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedVehicleId(pos.vehicleId);
        });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
          <div style="font-weight: bold; font-size: 13px; color: #b45309;">${vehicle?.fleetNumber} (${vehicle?.registrationNumber})</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">${pos.address}</div>
          <hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <div><b>Speed:</b> ${pos.speedKmh} km/h | <b>Ignition:</b> ${pos.ignition ? 'ON' : 'OFF'}</div>
          <div><b>Telemetry Status:</b> <span style="text-transform: uppercase; font-weight: bold; color: ${color};">${pos.trackingStatus}</span></div>
          <div><b>Last Telemetry:</b> ${new Date(pos.timestamp).toLocaleTimeString()}</div>
        </div>
      `);

      markersRef.current[pos.vehicleId] = marker;
    });
  }, [state.gpsPositions, selectedVehicleId, state.vehicles]);

  // Focus map on selected vehicle
  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const pos = state.gpsPositions.find(p => p.vehicleId === vehicleId);
    if (pos && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([pos.latitude, pos.longitude], 14, { duration: 1 });
      const marker = markersRef.current[vehicleId];
      if (marker) marker.openPopup();
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    refreshGpsTelemetry();
    setTimeout(() => setIsSyncing(false), 600);
  };

  const filteredPositions = state.gpsPositions.filter(p => {
    if (statusFilter === 'all') return true;
    return p.trackingStatus === statusFilter;
  });

  const selectedPos = state.gpsPositions.find(p => p.vehicleId === selectedVehicleId);
  const selectedVehicle = state.vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto flex flex-col min-h-screen lg:min-h-0 lg:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-amber-500" />
            GPS Telematics & Fleet Visibility
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Normalised provider adapter interface (Tramigo / Teltonika / Cartrack) mapped on OpenStreetMap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer touch-manipulation"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Poll Provider Feeds</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Map + Telemetry Sidebar) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaflet Map Container */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative flex flex-col min-h-[360px] sm:min-h-[440px]">
          {/* Map Top Bar */}
          <div className="p-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs z-10">
            <div className="flex items-center gap-2 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Live (&lt;5m)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Delayed (5-30m)
              </span>
              <span className="flex items-center gap-1 text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Stale (&gt;30m)
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Offline
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Free OpenStreetMap Data • Zero Map API Charges
            </div>
          </div>

          {/* Leaflet DOM mounting target */}
          <div ref={mapContainerRef} className="w-full flex-1 z-0 min-h-[400px]" />
        </div>

        {/* Telemetry Devices Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="space-y-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                Fleet Telematics Feeds ({state.gpsPositions.length})
              </h3>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 text-slate-300 text-[11px] rounded px-2 py-1 border border-slate-800"
              >
                <option value="all">All States</option>
                <option value="live">Live Only</option>
                <option value="delayed">Delayed</option>
                <option value="stale">Stale</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Vehicle List */}
            <div className="space-y-2 overflow-y-auto pr-1 max-h-[380px]">
              {filteredPositions.map(pos => {
                const vehicle = state.vehicles.find(v => v.id === pos.vehicleId);
                const isSelected = selectedVehicleId === pos.vehicleId;

                return (
                  <div
                    key={pos.deviceId}
                    onClick={() => handleSelectVehicle(pos.vehicleId)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md' 
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{vehicle?.fleetNumber}</span>
                      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                        pos.trackingStatus === 'live' ? 'bg-emerald-500/20 text-emerald-400' :
                        pos.trackingStatus === 'delayed' ? 'bg-amber-500/20 text-amber-400' :
                        pos.trackingStatus === 'stale' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {pos.trackingStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {pos.address}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-blue-400" />
                        {pos.speedKmh} km/h
                      </span>
                      <span className="flex items-center gap-1">
                        <Power className={`w-3 h-3 ${pos.ignition ? 'text-emerald-400' : 'text-slate-600'}`} />
                        {pos.ignition ? 'Ignition ON' : 'OFF'}
                      </span>
                      <span>{new Date(pos.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Vehicle Card */}
          {selectedPos && selectedVehicle && (
            <div className="mt-3 pt-3 border-t border-slate-800 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 shrink-0">
              <div className="font-bold text-amber-400 flex items-center justify-between">
                <span>{selectedVehicle.fleetNumber} ({selectedVehicle.registrationNumber})</span>
                <span className="text-slate-400 text-[10px] font-mono">{selectedPos.deviceId}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Coords: {selectedPos.latitude}, {selectedPos.longitude}
              </div>
              <div className="text-[10px] text-slate-500">
                Provider Adapter: Tramigo / Teltonika FMB Server • Battery: {selectedPos.batteryLevel || 95}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
