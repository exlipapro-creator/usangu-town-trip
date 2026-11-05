import { 
  AppUser, Vehicle, Trailer, Driver, Technician, Trip, BreakdownReport, 
  WorkOrder, Part, StockMovement, SpareRequest, FuelTransaction, 
  GpsPosition, VehicleInspection, IncidentReport, AuditLogEntry, BackgroundJob,
  TripStatus, WorkOrderStage, RoleType
} from '../types';
import { 
  INITIAL_USERS, INITIAL_VEHICLES, INITIAL_TRAILERS, INITIAL_DRIVERS, 
  INITIAL_TECHNICIANS, INITIAL_TRIPS, INITIAL_PARTS, INITIAL_STOCK_MOVEMENTS, 
  INITIAL_SPARE_REQUESTS, INITIAL_WORK_ORDERS, INITIAL_BREAKDOWNS, 
  INITIAL_FUEL_TRANSACTIONS, INITIAL_GPS_POSITIONS, INITIAL_INSPECTIONS, 
  INITIAL_INCIDENTS, INITIAL_AUDIT_LOGS, INITIAL_BACKGROUND_JOBS 
} from '../data/mockData';

const STORAGE_KEY = 'usangu_town_trip_state_v1';

export interface AppState {
  currentUser: AppUser;
  vehicles: Vehicle[];
  trailers: Trailer[];
  drivers: Driver[];
  technicians: Technician[];
  trips: Trip[];
  parts: Part[];
  stockMovements: StockMovement[];
  spareRequests: SpareRequest[];
  workOrders: WorkOrder[];
  breakdowns: BreakdownReport[];
  fuelTransactions: FuelTransaction[];
  gpsPositions: GpsPosition[];
  inspections: VehicleInspection[];
  incidents: IncidentReport[];
  auditLogs: AuditLogEntry[];
  backgroundJobs: BackgroundJob[];
}

export const loadInitialState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }

  return {
    currentUser: INITIAL_USERS[0],
    vehicles: INITIAL_VEHICLES,
    trailers: INITIAL_TRAILERS,
    drivers: INITIAL_DRIVERS,
    technicians: INITIAL_TECHNICIANS,
    trips: INITIAL_TRIPS,
    parts: INITIAL_PARTS,
    stockMovements: INITIAL_STOCK_MOVEMENTS,
    spareRequests: INITIAL_SPARE_REQUESTS,
    workOrders: INITIAL_WORK_ORDERS,
    breakdowns: INITIAL_BREAKDOWNS,
    fuelTransactions: INITIAL_FUEL_TRANSACTIONS,
    gpsPositions: INITIAL_GPS_POSITIONS,
    inspections: INITIAL_INSPECTIONS,
    incidents: INITIAL_INCIDENTS,
    auditLogs: INITIAL_AUDIT_LOGS,
    backgroundJobs: INITIAL_BACKGROUND_JOBS
  };
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error persisting state:', e);
  }
};

export const isVehicleAvailable = (vehicle: Vehicle): { available: boolean; reason?: string } => {
  if (vehicle.status === 'breakdown') {
    return { available: false, reason: 'Vehicle is currently recorded under breakdown' };
  }
  if (vehicle.status === 'under_maintenance') {
    return { available: false, reason: 'Vehicle is actively undergoing workshop maintenance' };
  }
  if (vehicle.status === 'awaiting_inspection') {
    return { available: false, reason: 'Vehicle is awaiting mandatory QA safety inspection' };
  }
  if (vehicle.status === 'suspended' || vehicle.status === 'retired') {
    return { available: false, reason: 'Vehicle is suspended or decommissioned' };
  }
  if (vehicle.hasCriticalDefect) {
    return { available: false, reason: `Critical safety defect: ${vehicle.criticalDefectReason || 'Unresolved defect'}` };
  }
  if (vehicle.currentTripId) {
    return { available: false, reason: 'Vehicle is currently assigned to an active trip' };
  }
  return { available: true };
};

export const isTrailerAvailable = (trailer: Trailer): boolean => {
  return trailer.status === 'available' && !trailer.attachedToVehicleId;
};

export const isDriverAvailable = (driver: Driver): boolean => {
  return driver.status === 'available';
};

export const createAuditEntry = (
  user: AppUser,
  action: string,
  resource: string,
  resourceId: string,
  details: string,
  previousState?: string,
  newState?: string
): AuditLogEntry => {
  return {
    id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    actor: user.name,
    role: user.department,
    action,
    resource,
    resourceId,
    details,
    previousState,
    newState
  };
};
