import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AppState, loadInitialState, saveState, isVehicleAvailable, isTrailerAvailable, 
  isDriverAvailable, createAuditEntry 
} from '../services/store';
import { 
  AppUser, Vehicle, Trailer, Driver, Technician, Trip, BreakdownReport, 
  WorkOrder, Part, StockMovement, SpareRequest, FuelTransaction, 
  GpsPosition, VehicleInspection, IncidentReport, AuditLogEntry, BackgroundJob,
  TripStatus, WorkOrderStage, BreakdownSeverity, InspectionItem, InspectionType
} from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AppContextType {
  state: AppState;
  switchUser: (userId: string) => void;
  resetToDemoData: () => void;
  // Trips
  createTrip: (tripData: Omit<Trip, 'id' | 'tripReference' | 'status' | 'createdBy'>) => { success: boolean; error?: string; trip?: Trip };
  approveTripOps: (tripId: string) => { success: boolean; error?: string };
  verifyTripYard: (tripId: string) => { success: boolean; error?: string };
  dispatchTrip: (tripId: string, openingOdometer: number) => { success: boolean; error?: string };
  recordTripReturn: (tripId: string, closingOdometer: number, defectReported: boolean, defectNotes?: string, remarks?: string) => { success: boolean; error?: string };
  closeTrip: (tripId: string) => { success: boolean; error?: string };
  cancelTrip: (tripId: string, reason: string) => { success: boolean; error?: string };
  // Workshop
  reportBreakdown: (data: { vehicleId: string; relatedTripId?: string | null; faultCategory: BreakdownReport['faultCategory']; faultDescription: string; severity: BreakdownSeverity; vehicleLocation: string; immediateAction: string; safetyImplications: string }) => { success: boolean; error?: string };
  createWorkOrder: (data: { vehicleId: string; breakdownId?: string | null; diagnosis: string; priority: WorkOrder['priority']; assignedTechnicianId?: string | null; workDescription: string; expectedCompletion: string }) => { success: boolean; error?: string };
  updateWorkOrderStage: (woId: string, stage: WorkOrderStage, notes?: string) => { success: boolean; error?: string };
  requestSparePart: (data: { workOrderId: string; vehicleId: string; partId: string; quantityRequested: number; justification: string; priority: SpareRequest['priority'] }) => { success: boolean; error?: string };
  releaseVehicleFromWorkshop: (woId: string, inspectionPassed: boolean, inspectionNotes: string) => { success: boolean; error?: string };
  // Stores
  receiveStock: (data: { partId: string; quantity: number; unitCostTZS: number; referenceDoc: string; reason: string }) => { success: boolean; error?: string };
  approveSpareRequest: (requestId: string) => { success: boolean; error?: string };
  issueSparePart: (requestId: string) => { success: boolean; error?: string };
  adjustStock: (partId: string, newQuantity: number, reason: string) => { success: boolean; error?: string };
  // Fuel
  recordFuelTransaction: (data: { vehicleId: string; relatedTripId?: string | null; litres: number; unitPriceTZS: number; sourceType: 'company_yard_tank' | 'external_station'; supplierOrStation: string; odometerReading: number; driverId: string; notes?: string }) => { success: boolean; error?: string };
  // GPS
  refreshGpsTelemetry: () => void;
  // Safety
  submitInspection: (data: { inspectionType: InspectionType; vehicleId: string; relatedTripId?: string | null; odometer: number; items: InspectionItem[]; remarks?: string; correctiveActionRequired?: string }) => { success: boolean; error?: string };
  resolveCriticalDefect: (vehicleId: string) => { success: boolean; error?: string };
  reportIncident: (data: Omit<IncidentReport, 'id' | 'incidentReference' | 'isClosed'>) => { success: boolean; error?: string };
  closeIncident: (incidentId: string, investigationNotes: string) => { success: boolean; error?: string };
  // Background Jobs
  runBackgroundJob: (jobId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadInitialState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const switchUser = (userId: string) => {
    const user = INITIAL_USERS.find(u => u.id === userId);
    if (user) {
      setState(prev => ({
        ...prev,
        currentUser: user,
        auditLogs: [
          createAuditEntry(user, 'USER_SWITCH', 'AUTH', user.id, `Active session switched to ${user.name} (${user.department})`),
          ...prev.auditLogs
        ]
      }));
    }
  };

  const resetToDemoData = () => {
    localStorage.removeItem('usangu_town_trip_state_v1');
    const fresh = loadInitialState();
    setState(fresh);
  };

  // TRIP MANAGEMENT
  const createTrip = (tripData: Omit<Trip, 'id' | 'tripReference' | 'status' | 'createdBy'>) => {
    const vehicle = state.vehicles.find(v => v.id === tripData.assignedVehicleId);
    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const availCheck = isVehicleAvailable(vehicle);
    if (!availCheck.available) {
      return { success: false, error: `Vehicle ${vehicle.fleetNumber} (${vehicle.registrationNumber}) is unavailable: ${availCheck.reason}` };
    }

    const driver = state.drivers.find(d => d.id === tripData.primaryDriverId);
    if (!driver || !isDriverAvailable(driver)) {
      return { success: false, error: `Driver ${driver ? driver.name : 'Unknown'} is currently unavailable or already on a trip` };
    }

    if (tripData.assignedTrailerId) {
      const trailer = state.trailers.find(t => t.id === tripData.assignedTrailerId);
      if (!trailer || !isTrailerAvailable(trailer)) {
        return { success: false, error: `Trailer ${trailer ? trailer.trailerNumber : 'Unknown'} is already in use or under maintenance` };
      }
    }

    const tripNumber = state.trips.length + 105;
    const newTrip: Trip = {
      ...tripData,
      id: 'trip-' + Date.now(),
      tripReference: `TT-2026-0${tripNumber}`,
      status: 'pending_operations_approval',
      createdBy: `${state.currentUser.name} (${state.currentUser.department})`
    };

    const audit = createAuditEntry(
      state.currentUser,
      'TRIP_CREATED',
      'TRIP',
      newTrip.tripReference,
      `Created town trip ${newTrip.tripReference} for vehicle ${vehicle.fleetNumber} (${vehicle.registrationNumber}). Route: ${newTrip.origin} -> ${newTrip.destination}.`
    );

    setState(prev => ({
      ...prev,
      trips: [newTrip, ...prev.trips],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true, trip: newTrip };
  };

  const approveTripOps = (tripId: string) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const vehicle = state.vehicles.find(v => v.id === trip.assignedVehicleId);
    if (vehicle?.hasCriticalDefect) {
      return { success: false, error: `Cannot approve trip: Vehicle ${vehicle.fleetNumber} has an unresolved critical safety defect!` };
    }

    const updatedTrip: Trip = {
      ...trip,
      status: 'pending_yard_verification',
      approvedByOps: state.currentUser.name,
      approvedOpsAt: new Date().toISOString()
    };

    const audit = createAuditEntry(
      state.currentUser,
      'OPERATIONS_APPROVED',
      'TRIP',
      trip.tripReference,
      `Operations approved trip ${trip.tripReference} for route ${trip.origin} to ${trip.destination}`,
      trip.status,
      'pending_yard_verification'
    );

    setState(prev => ({
      ...prev,
      trips: prev.trips.map(t => t.id === tripId ? updatedTrip : t),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const verifyTripYard = (tripId: string) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const vehicle = state.vehicles.find(v => v.id === trip.assignedVehicleId);
    if (vehicle?.hasCriticalDefect) {
      return { success: false, error: `Yard verification blocked: Truck ${vehicle.fleetNumber} has critical defect (${vehicle.criticalDefectReason})` };
    }

    const updatedTrip: Trip = {
      ...trip,
      status: 'approved_for_dispatch',
      verifiedByYard: state.currentUser.name,
      verifiedYardAt: new Date().toISOString()
    };

    const audit = createAuditEntry(
      state.currentUser,
      'YARD_VERIFIED',
      'TRIP',
      trip.tripReference,
      `Yard physical inspection confirmed for vehicle ${vehicle?.fleetNumber} & driver`,
      trip.status,
      'approved_for_dispatch'
    );

    setState(prev => ({
      ...prev,
      trips: prev.trips.map(t => t.id === tripId ? updatedTrip : t),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const dispatchTrip = (tripId: string, openingOdometer: number) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const vehicle = state.vehicles.find(v => v.id === trip.assignedVehicleId);
    if (!vehicle) return { success: false, error: 'Assigned vehicle not found' };

    // Strict dispatch re-check
    if (vehicle.hasCriticalDefect) {
      return { success: false, error: `CRITICAL SAFETY RESTRICTION: Vehicle ${vehicle.fleetNumber} cannot be dispatched. Reason: ${vehicle.criticalDefectReason}` };
    }
    if (vehicle.status === 'breakdown' || vehicle.status === 'under_maintenance') {
      return { success: false, error: `Vehicle ${vehicle.fleetNumber} is currently under workshop repair` };
    }
    if (vehicle.currentTripId && vehicle.currentTripId !== tripId) {
      return { success: false, error: `Vehicle ${vehicle.fleetNumber} is already on another active trip` };
    }

    const now = new Date().toISOString();

    const updatedTrip: Trip = {
      ...trip,
      status: 'in_progress',
      openingOdometer: openingOdometer || vehicle.currentOdometer,
      actualDeparture: now,
      dispatchedBy: state.currentUser.name,
      dispatchedAt: now
    };

    const audit = createAuditEntry(
      state.currentUser,
      'DISPATCH_CONFIRMED',
      'TRIP',
      trip.tripReference,
      `Vehicle ${vehicle.fleetNumber} (${vehicle.registrationNumber}) officially dispatched. Opening odo: ${openingOdometer} km.`,
      trip.status,
      'in_progress'
    );

    setState(prev => ({
      ...prev,
      trips: prev.trips.map(t => t.id === tripId ? updatedTrip : t),
      vehicles: prev.vehicles.map(v => v.id === trip.assignedVehicleId ? {
        ...v,
        currentTripId: trip.id,
        currentOdometer: Math.max(v.currentOdometer, openingOdometer)
      } : v),
      drivers: prev.drivers.map(d => d.id === trip.primaryDriverId ? {
        ...d,
        status: 'on_trip',
        assignedVehicleId: trip.assignedVehicleId
      } : d),
      trailers: prev.trailers.map(tr => tr.id === trip.assignedTrailerId ? {
        ...tr,
        status: 'in_trip',
        attachedToVehicleId: trip.assignedVehicleId
      } : tr),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const recordTripReturn = (
    tripId: string, 
    closingOdometer: number, 
    defectReported: boolean, 
    defectNotes?: string, 
    remarks?: string
  ) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const opening = trip.openingOdometer || 0;
    if (closingOdometer < opening) {
      return { success: false, error: `Invalid closing odometer (${closingOdometer} km) cannot be less than opening odometer (${opening} km)` };
    }

    const distance = closingOdometer - opening;
    const now = new Date().toISOString();

    const updatedTrip: Trip = {
      ...trip,
      status: 'completed',
      closingOdometer,
      distanceKm: distance,
      actualReturn: now,
      receivedByYard: state.currentUser.name,
      receivedYardAt: now,
      closedBy: state.currentUser.name,
      closedAt: now,
      reportedDefectOnReturn: defectReported,
      defectNotes: defectNotes || '',
      returnRemarks: remarks || 'Returned to yard safely.'
    };

    let newBreakdowns = [...state.breakdowns];
    let vehicleStatusUpdates: Partial<Vehicle> = {
      currentTripId: null,
      currentOdometer: closingOdometer
    };

    if (defectReported && defectNotes) {
      const bdRef = `BD-2026-00${state.breakdowns.length + 32}`;
      const newBd: BreakdownReport = {
        id: 'bd-' + Date.now(),
        breakdownReference: bdRef,
        vehicleId: trip.assignedVehicleId,
        relatedTripId: trip.id,
        reportedAt: now,
        reportedBy: `${state.currentUser.name} (Yard Return Receiving)`,
        faultCategory: 'Braking System',
        faultDescription: defectNotes,
        severity: 'high',
        vehicleLocation: 'Kurasini Return Inspection Bay',
        immediateAction: 'Vehicle tagged for workshop inspection upon return.',
        safetyImplications: 'Post-trip defect reported; vehicle held from subsequent dispatches.',
        status: 'reported'
      };
      newBreakdowns = [newBd, ...newBreakdowns];
      vehicleStatusUpdates.status = 'awaiting_inspection';
    }

    const audit = createAuditEntry(
      state.currentUser,
      'TRIP_RETURN_RECORDED',
      'TRIP',
      trip.tripReference,
      `Trip ${trip.tripReference} closed. Distance: ${distance} km. Defect reported: ${defectReported ? 'YES (' + defectNotes + ')' : 'NONE'}.`,
      trip.status,
      'completed'
    );

    setState(prev => ({
      ...prev,
      trips: prev.trips.map(t => t.id === tripId ? updatedTrip : t),
      vehicles: prev.vehicles.map(v => v.id === trip.assignedVehicleId ? {
        ...v,
        ...vehicleStatusUpdates
      } : v),
      drivers: prev.drivers.map(d => d.id === trip.primaryDriverId ? {
        ...d,
        status: 'available',
        assignedVehicleId: null
      } : d),
      trailers: prev.trailers.map(tr => tr.id === trip.assignedTrailerId ? {
        ...tr,
        status: 'available',
        attachedToVehicleId: null
      } : tr),
      breakdowns: newBreakdowns,
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const closeTrip = (tripId: string) => {
    return recordTripReturn(tripId, (state.trips.find(t => t.id === tripId)?.openingOdometer || 0) + 25, false);
  };

  const cancelTrip = (tripId: string, reason: string) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const updatedTrip: Trip = {
      ...trip,
      status: 'cancelled',
      cancellationReason: reason
    };

    const audit = createAuditEntry(
      state.currentUser,
      'TRIP_CANCELLED',
      'TRIP',
      trip.tripReference,
      `Trip cancelled: ${reason}`,
      trip.status,
      'cancelled'
    );

    setState(prev => ({
      ...prev,
      trips: prev.trips.map(t => t.id === tripId ? updatedTrip : t),
      vehicles: prev.vehicles.map(v => v.id === trip.assignedVehicleId ? { ...v, currentTripId: null } : v),
      drivers: prev.drivers.map(d => d.id === trip.primaryDriverId ? { ...d, status: 'available', assignedVehicleId: null } : d),
      trailers: prev.trailers.map(tr => tr.id === trip.assignedTrailerId ? { ...tr, status: 'available', attachedToVehicleId: null } : tr),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  // WORKSHOP MANAGEMENT
  const reportBreakdown = (data: {
    vehicleId: string;
    relatedTripId?: string | null;
    faultCategory: BreakdownReport['faultCategory'];
    faultDescription: string;
    severity: BreakdownSeverity;
    vehicleLocation: string;
    immediateAction: string;
    safetyImplications: string;
  }) => {
    const vehicle = state.vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const bdRef = `BD-2026-00${state.breakdowns.length + 35}`;
    const newBd: BreakdownReport = {
      id: 'bd-' + Date.now(),
      breakdownReference: bdRef,
      vehicleId: data.vehicleId,
      relatedTripId: data.relatedTripId,
      reportedAt: new Date().toISOString(),
      reportedBy: `${state.currentUser.name} (${state.currentUser.department})`,
      faultCategory: data.faultCategory,
      faultDescription: data.faultDescription,
      severity: data.severity,
      vehicleLocation: data.vehicleLocation,
      immediateAction: data.immediateAction,
      safetyImplications: data.safetyImplications,
      status: 'reported'
    };

    const isCrit = data.severity === 'critical';
    const audit = createAuditEntry(
      state.currentUser,
      'BREAKDOWN_REPORTED',
      'WORKSHOP',
      bdRef,
      `Reported ${data.severity.toUpperCase()} fault on ${vehicle.fleetNumber}: ${data.faultDescription}.`
    );

    setState(prev => ({
      ...prev,
      breakdowns: [newBd, ...prev.breakdowns],
      vehicles: prev.vehicles.map(v => v.id === data.vehicleId ? {
        ...v,
        status: isCrit ? 'breakdown' : 'under_maintenance',
        hasCriticalDefect: isCrit ? true : v.hasCriticalDefect,
        criticalDefectReason: isCrit ? data.faultDescription : v.criticalDefectReason
      } : v),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const createWorkOrder = (data: {
    vehicleId: string;
    breakdownId?: string | null;
    diagnosis: string;
    priority: WorkOrder['priority'];
    assignedTechnicianId?: string | null;
    workDescription: string;
    expectedCompletion: string;
  }) => {
    const vehicle = state.vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const woRef = `WO-2026-00${state.workOrders.length + 91}`;
    const newWo: WorkOrder = {
      id: 'wo-' + Date.now(),
      workOrderReference: woRef,
      vehicleId: data.vehicleId,
      breakdownId: data.breakdownId,
      diagnosis: data.diagnosis,
      priority: data.priority,
      assignedTechnicianId: data.assignedTechnicianId,
      workDescription: data.workDescription,
      createdAt: new Date().toISOString(),
      expectedCompletion: data.expectedCompletion,
      stage: 'diagnosed',
      downtimeHours: 1.0
    };

    const audit = createAuditEntry(
      state.currentUser,
      'WORK_ORDER_CREATED',
      'WORKSHOP',
      woRef,
      `Work order created for ${vehicle.fleetNumber}: ${data.workDescription}`
    );

    setState(prev => ({
      ...prev,
      workOrders: [newWo, ...prev.workOrders],
      vehicles: prev.vehicles.map(v => v.id === data.vehicleId ? {
        ...v,
        status: 'under_maintenance',
        activeWorkOrderId: newWo.id
      } : v),
      breakdowns: prev.breakdowns.map(b => b.id === data.breakdownId ? {
        ...b,
        status: 'work_order_created'
      } : b),
      technicians: prev.technicians.map(t => t.id === data.assignedTechnicianId ? {
        ...t,
        activeWorkOrdersCount: t.activeWorkOrdersCount + 1,
        status: 'busy'
      } : t),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const updateWorkOrderStage = (woId: string, stage: WorkOrderStage, notes?: string) => {
    const wo = state.workOrders.find(w => w.id === woId);
    if (!wo) return { success: false, error: 'Work order not found' };

    const updatedWo: WorkOrder = {
      ...wo,
      stage,
      repairNotes: notes ? (wo.repairNotes ? `${wo.repairNotes}\n[${new Date().toLocaleTimeString()}]: ${notes}` : notes) : wo.repairNotes
    };

    const audit = createAuditEntry(
      state.currentUser,
      'WORK_ORDER_STAGE_UPDATE',
      'WORKSHOP',
      wo.workOrderReference,
      `Work order stage moved to: ${stage.replace('_', ' ').toUpperCase()}`,
      wo.stage,
      stage
    );

    setState(prev => ({
      ...prev,
      workOrders: prev.workOrders.map(w => w.id === woId ? updatedWo : w),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const requestSparePart = (data: {
    workOrderId: string;
    vehicleId: string;
    partId: string;
    quantityRequested: number;
    justification: string;
    priority: SpareRequest['priority'];
  }) => {
    const part = state.parts.find(p => p.id === data.partId);
    if (!part) return { success: false, error: 'Part not found in central catalogue' };

    const srRef = `SR-2026-01${state.spareRequests.length + 57}`;
    const newSr: SpareRequest = {
      id: 'sr-' + Date.now(),
      requestReference: srRef,
      workOrderId: data.workOrderId,
      vehicleId: data.vehicleId,
      partId: data.partId,
      quantityRequested: data.quantityRequested,
      quantityApproved: 0,
      quantityIssued: 0,
      requestingTechnicianId: state.currentUser.id,
      requestedAt: new Date().toISOString(),
      justification: data.justification,
      priority: data.priority,
      status: 'pending_approval'
    };

    const audit = createAuditEntry(
      state.currentUser,
      'SPARE_REQUEST_SUBMITTED',
      'STORES',
      srRef,
      `Requested ${data.quantityRequested}x ${part.partName} for Work Order against vehicle`
    );

    setState(prev => ({
      ...prev,
      spareRequests: [newSr, ...prev.spareRequests],
      workOrders: prev.workOrders.map(w => w.id === data.workOrderId ? {
        ...w,
        stage: 'awaiting_spare_parts'
      } : w),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const releaseVehicleFromWorkshop = (woId: string, inspectionPassed: boolean, inspectionNotes: string) => {
    const wo = state.workOrders.find(w => w.id === woId);
    if (!wo) return { success: false, error: 'Work order not found' };

    if (!inspectionPassed) {
      return { success: false, error: 'Vehicle release rejected: QA Inspection failed. Outstanding defects must be resolved first.' };
    }

    const now = new Date().toISOString();
    const updatedWo: WorkOrder = {
      ...wo,
      stage: 'released',
      inspectionPassed: true,
      inspectionNotes,
      inspectedBy: state.currentUser.name,
      releasedBy: state.currentUser.name,
      releasedAt: now,
      actualCompletion: now
    };

    const vehicle = state.vehicles.find(v => v.id === wo.vehicleId);

    const audit = createAuditEntry(
      state.currentUser,
      'VEHICLE_RELEASE_APPROVED',
      'WORKSHOP',
      wo.workOrderReference,
      `Vehicle ${vehicle?.fleetNumber} inspected and authorized for release by Workshop Supervisor: ${inspectionNotes}`,
      wo.stage,
      'released'
    );

    setState(prev => ({
      ...prev,
      workOrders: prev.workOrders.map(w => w.id === woId ? updatedWo : w),
      vehicles: prev.vehicles.map(v => v.id === wo.vehicleId ? {
        ...v,
        status: 'active',
        activeWorkOrderId: null,
        hasCriticalDefect: false,
        criticalDefectReason: undefined
      } : v),
      breakdowns: prev.breakdowns.map(b => b.id === wo.breakdownId ? {
        ...b,
        status: 'resolved'
      } : b),
      technicians: prev.technicians.map(t => t.id === wo.assignedTechnicianId ? {
        ...t,
        activeWorkOrdersCount: Math.max(0, t.activeWorkOrdersCount - 1),
        status: t.activeWorkOrdersCount - 1 <= 0 ? 'available' : 'busy'
      } : t),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  // STORES & INVENTORY
  const receiveStock = (data: {
    partId: string;
    quantity: number;
    unitCostTZS: number;
    referenceDoc: string;
    reason: string;
  }) => {
    const part = state.parts.find(p => p.id === data.partId);
    if (!part) return { success: false, error: 'Part not found' };
    if (data.quantity <= 0) return { success: false, error: 'Received quantity must be greater than zero' };

    const newStock = part.currentStock + data.quantity;
    const movementRef = `SM-2026-00${state.stockMovements.length + 4}`;

    const newMovement: StockMovement = {
      id: 'sm-' + Date.now(),
      movementReference: movementRef,
      partId: data.partId,
      movementType: 'receipt',
      quantity: data.quantity,
      balanceAfter: newStock,
      unitCostTZS: data.unitCostTZS,
      totalCostTZS: data.quantity * data.unitCostTZS,
      referenceDoc: data.referenceDoc,
      reason: data.reason,
      performedBy: `${state.currentUser.name} (${state.currentUser.department})`,
      createdAt: new Date().toISOString()
    };

    const audit = createAuditEntry(
      state.currentUser,
      'STOCK_RECEIVED',
      'STORES',
      part.partCode,
      `Received +${data.quantity} ${part.unitOfMeasure} of ${part.partName}. Ref: ${data.referenceDoc}. New balance: ${newStock}.`
    );

    setState(prev => ({
      ...prev,
      parts: prev.parts.map(p => p.id === data.partId ? { ...p, currentStock: newStock, unitCostTZS: data.unitCostTZS } : p),
      stockMovements: [newMovement, ...prev.stockMovements],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const approveSpareRequest = (requestId: string) => {
    const req = state.spareRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const part = state.parts.find(p => p.id === req.partId);
    if (!part) return { success: false, error: 'Part not found' };

    const updatedReq: SpareRequest = {
      ...req,
      status: 'approved',
      quantityApproved: req.quantityRequested,
      approvedBy: state.currentUser.name,
      approvedAt: new Date().toISOString()
    };

    const audit = createAuditEntry(
      state.currentUser,
      'SPARE_REQUEST_APPROVED',
      'STORES',
      req.requestReference,
      `Approved spare request for ${req.quantityRequested}x ${part.partName}`
    );

    setState(prev => ({
      ...prev,
      spareRequests: prev.spareRequests.map(r => r.id === requestId ? updatedReq : r),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const issueSparePart = (requestId: string) => {
    const req = state.spareRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const part = state.parts.find(p => p.id === req.partId);
    if (!part) return { success: false, error: 'Part not found' };

    const qtyToIssue = req.quantityApproved || req.quantityRequested;

    // Strict validation: Reject issuance exceeding available stock!
    if (part.currentStock < qtyToIssue) {
      return { 
        success: false, 
        error: `Insufficient central stock! Requested: ${qtyToIssue} ${part.unitOfMeasure}, but current available balance is only ${part.currentStock} ${part.unitOfMeasure}. Cannot produce negative inventory.` 
      };
    }

    const newStock = part.currentStock - qtyToIssue;
    const movementRef = `SM-2026-00${state.stockMovements.length + 5}`;

    const newMovement: StockMovement = {
      id: 'sm-' + Date.now(),
      movementReference: movementRef,
      partId: part.id,
      movementType: 'issue',
      quantity: -qtyToIssue,
      balanceAfter: newStock,
      unitCostTZS: part.unitCostTZS,
      totalCostTZS: qtyToIssue * part.unitCostTZS,
      workOrderId: req.workOrderId,
      vehicleId: req.vehicleId,
      referenceDoc: req.requestReference,
      reason: `Issued for Work Order against requisition ${req.requestReference}`,
      performedBy: `${state.currentUser.name} (${state.currentUser.department})`,
      createdAt: new Date().toISOString()
    };

    const updatedReq: SpareRequest = {
      ...req,
      status: 'issued',
      quantityIssued: qtyToIssue,
      issuedAt: new Date().toISOString()
    };

    const audit = createAuditEntry(
      state.currentUser,
      'STOCK_ISSUED',
      'STORES',
      part.partCode,
      `Issued ${qtyToIssue} ${part.unitOfMeasure} of ${part.partName} against requisition ${req.requestReference}. Stock balance remaining: ${newStock}.`
    );

    setState(prev => ({
      ...prev,
      parts: prev.parts.map(p => p.id === part.id ? { ...p, currentStock: newStock } : p),
      spareRequests: prev.spareRequests.map(r => r.id === requestId ? updatedReq : r),
      stockMovements: [newMovement, ...prev.stockMovements],
      workOrders: prev.workOrders.map(w => w.id === req.workOrderId ? {
        ...w,
        stage: 'repair_in_progress',
        repairNotes: w.repairNotes ? `${w.repairNotes}\n[Parts Issued]: ${qtyToIssue}x ${part.partName}` : `[Parts Issued]: ${qtyToIssue}x ${part.partName}`
      } : w),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const adjustStock = (partId: string, newQuantity: number, reason: string) => {
    const part = state.parts.find(p => p.id === partId);
    if (!part) return { success: false, error: 'Part not found' };
    if (newQuantity < 0) return { success: false, error: 'Stock quantity cannot be negative' };

    const diff = newQuantity - part.currentStock;
    const movementRef = `SM-2026-00${state.stockMovements.length + 6}`;

    const newMovement: StockMovement = {
      id: 'sm-' + Date.now(),
      movementReference: movementRef,
      partId: part.id,
      movementType: 'adjustment',
      quantity: diff,
      balanceAfter: newQuantity,
      unitCostTZS: part.unitCostTZS,
      totalCostTZS: Math.abs(diff) * part.unitCostTZS,
      reason: `Stocktake adjustment: ${reason}`,
      performedBy: state.currentUser.name,
      createdAt: new Date().toISOString()
    };

    const audit = createAuditEntry(
      state.currentUser,
      'STOCK_ADJUSTMENT',
      'STORES',
      part.partCode,
      `Audited stock adjustment: balance adjusted from ${part.currentStock} to ${newQuantity}. Reason: ${reason}`
    );

    setState(prev => ({
      ...prev,
      parts: prev.parts.map(p => p.id === partId ? { ...p, currentStock: newQuantity } : p),
      stockMovements: [newMovement, ...prev.stockMovements],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  // FUEL MANAGEMENT
  const recordFuelTransaction = (data: {
    vehicleId: string;
    relatedTripId?: string | null;
    litres: number;
    unitPriceTZS: number;
    sourceType: 'company_yard_tank' | 'external_station';
    supplierOrStation: string;
    odometerReading: number;
    driverId: string;
    notes?: string;
  }) => {
    const vehicle = state.vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const prevOdo = vehicle.currentOdometer;
    let distance: number | undefined = undefined;
    let consumption: number | null = null;
    let hasException = false;
    let exceptionReason: string | undefined = undefined;

    if (data.odometerReading >= prevOdo && prevOdo > 0) {
      distance = data.odometerReading - prevOdo;
      if (distance > 0) {
        consumption = Number(((data.litres / distance) * 100).toFixed(2));
        if (consumption > 45) {
          hasException = true;
          exceptionReason = `Unusually high consumption (${consumption} L/100km). Exceeds fleet threshold of 45 L/100km.`;
        }
      } else {
        hasException = true;
        exceptionReason = 'Distance travelled is 0 km despite fuel issuance.';
      }
    } else if (data.odometerReading < prevOdo) {
      hasException = true;
      exceptionReason = `Odometer regression! Reading (${data.odometerReading} km) is less than recorded vehicle odometer (${prevOdo} km).`;
    }

    const txRef = `FL-2026-03${state.fuelTransactions.length + 13}`;
    const newTx: FuelTransaction = {
      id: 'fl-' + Date.now(),
      transactionReference: txRef,
      vehicleId: data.vehicleId,
      relatedTripId: data.relatedTripId,
      fuelType: 'Diesel',
      litres: data.litres,
      unitPriceTZS: data.unitPriceTZS,
      totalCostTZS: data.litres * data.unitPriceTZS,
      sourceType: data.sourceType,
      supplierOrStation: data.supplierOrStation,
      date: new Date().toISOString(),
      odometerReading: data.odometerReading,
      previousOdometerReading: prevOdo,
      distanceTravelledKm: distance,
      consumptionLitersPer100Km: consumption,
      hasException,
      exceptionReason,
      driverId: data.driverId,
      issuedBy: `${state.currentUser.name} (${state.currentUser.department})`,
      authorisedBy: 'Frank Mlay (Operations)',
      notes: data.notes
    };

    const audit = createAuditEntry(
      state.currentUser,
      'FUEL_ISSUED',
      'FUEL',
      txRef,
      `Issued ${data.litres}L diesel to ${vehicle.fleetNumber} (${data.supplierOrStation}). Cost: TZS ${(data.litres * data.unitPriceTZS).toLocaleString()}. Consumption: ${consumption ? consumption + ' L/100km' : 'N/A'}.`
    );

    setState(prev => ({
      ...prev,
      fuelTransactions: [newTx, ...prev.fuelTransactions],
      vehicles: prev.vehicles.map(v => v.id === data.vehicleId ? {
        ...v,
        currentOdometer: Math.max(v.currentOdometer, data.odometerReading)
      } : v),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  // GPS SIMULATION & ADAPTER
  const refreshGpsTelemetry = () => {
    // Normalised provider telemetry update
    const updatedPositions = state.gpsPositions.map(pos => {
      // Small jitter around Dar es Salaam to simulate real movement
      const isMoving = pos.speedKmh > 0;
      const latDelta = isMoving ? (Math.random() - 0.5) * 0.003 : 0;
      const lngDelta = isMoving ? (Math.random() - 0.5) * 0.003 : 0;

      return {
        ...pos,
        latitude: Number((pos.latitude + latDelta).toFixed(6)),
        longitude: Number((pos.longitude + lngDelta).toFixed(6)),
        timestamp: new Date().toISOString(),
        trackingStatus: 'live' as const
      };
    });

    const audit = createAuditEntry(
      state.currentUser,
      'GPS_PROVIDER_SYNC',
      'GPS',
      'ADAPTER_SYNC',
      `Synchronized live coordinates for ${updatedPositions.length} registered Town Trip telematics devices.`
    );

    setState(prev => ({
      ...prev,
      gpsPositions: updatedPositions,
      auditLogs: [audit, ...prev.auditLogs]
    }));
  };

  // SAFETY & INSPECTION
  const submitInspection = (data: {
    inspectionType: InspectionType;
    vehicleId: string;
    relatedTripId?: string | null;
    odometer: number;
    items: InspectionItem[];
    remarks?: string;
    correctiveActionRequired?: string;
  }) => {
    const vehicle = state.vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const criticalFails = data.items.filter(item => item.isCritical && item.result === 'fail');
    const overallPassed = criticalFails.length === 0;

    const inspRef = `INSP-2026-02${state.inspections.length + 12}`;
    const newInsp: VehicleInspection = {
      id: 'insp-' + Date.now(),
      inspectionReference: inspRef,
      inspectionType: data.inspectionType,
      vehicleId: data.vehicleId,
      relatedTripId: data.relatedTripId,
      inspectedAt: new Date().toISOString(),
      inspectedBy: `${state.currentUser.name} (${state.currentUser.department})`,
      odometer: data.odometer,
      overallPassed,
      criticalDefectsFound: criticalFails.length,
      items: data.items,
      remarks: data.remarks,
      correctiveActionRequired: data.correctiveActionRequired
    };

    let updatedVehicle: Partial<Vehicle> = {
      lastInspectionDate: new Date().toISOString().split('T')[0],
      currentOdometer: Math.max(vehicle.currentOdometer, data.odometer)
    };

    if (!overallPassed) {
      const reasons = criticalFails.map(f => f.name).join(', ');
      updatedVehicle = {
        ...updatedVehicle,
        hasCriticalDefect: true,
        criticalDefectReason: `Failed inspection item(s): ${reasons}. Dispatch locked.`,
        status: 'awaiting_inspection'
      };
    } else if (vehicle.hasCriticalDefect) {
      // If was critical defect and passed QA inspection, clear!
      updatedVehicle = {
        ...updatedVehicle,
        hasCriticalDefect: false,
        criticalDefectReason: undefined,
        status: vehicle.status === 'awaiting_inspection' ? 'active' : vehicle.status
      };
    }

    const audit = createAuditEntry(
      state.currentUser,
      overallPassed ? 'INSPECTION_PASSED' : 'INSPECTION_FAILED_CRITICAL',
      'SAFETY',
      inspRef,
      `${data.inspectionType.toUpperCase()} inspection on ${vehicle.fleetNumber}. Result: ${overallPassed ? 'PASSED' : 'FAILED (' + criticalFails.length + ' critical defect(s) detected)'}.`
    );

    setState(prev => ({
      ...prev,
      inspections: [newInsp, ...prev.inspections],
      vehicles: prev.vehicles.map(v => v.id === data.vehicleId ? { ...v, ...updatedVehicle } : v),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const resolveCriticalDefect = (vehicleId: string) => {
    const vehicle = state.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const audit = createAuditEntry(
      state.currentUser,
      'CRITICAL_DEFECT_RESOLVED',
      'SAFETY',
      vehicle.fleetNumber,
      `Safety officer manually validated corrective action and cleared critical defect lock on ${vehicle.fleetNumber}.`
    );

    setState(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(v => v.id === vehicleId ? {
        ...v,
        hasCriticalDefect: false,
        criticalDefectReason: undefined,
        status: v.status === 'breakdown' || v.status === 'awaiting_inspection' ? 'active' : v.status
      } : v),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const reportIncident = (data: Omit<IncidentReport, 'id' | 'incidentReference' | 'isClosed'>) => {
    const vehicle = state.vehicles.find(v => v.id === data.vehicleId);
    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const incRef = `INC-2026-00${state.incidents.length + 15}`;
    const newInc: IncidentReport = {
      ...data,
      id: 'inc-' + Date.now(),
      incidentReference: incRef,
      isClosed: false
    };

    const audit = createAuditEntry(
      state.currentUser,
      'INCIDENT_LOGGED',
      'SAFETY',
      incRef,
      `Logged safety incident: ${data.incidentType} involving ${vehicle.fleetNumber}. Action: ${data.immediateActionTaken}`
    );

    setState(prev => ({
      ...prev,
      incidents: [newInc, ...prev.incidents],
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const closeIncident = (incidentId: string, investigationNotes: string) => {
    const inc = state.incidents.find(i => i.id === incidentId);
    if (!inc) return { success: false, error: 'Incident not found' };

    const updatedInc: IncidentReport = {
      ...inc,
      isClosed: true,
      closedAt: new Date().toISOString(),
      investigationNotes
    };

    const audit = createAuditEntry(
      state.currentUser,
      'INCIDENT_CLOSED',
      'SAFETY',
      inc.incidentReference,
      `Incident ${inc.incidentReference} marked closed with verified corrective action: ${investigationNotes}`
    );

    setState(prev => ({
      ...prev,
      incidents: prev.incidents.map(i => i.id === incidentId ? updatedInc : i),
      auditLogs: [audit, ...prev.auditLogs]
    }));

    return { success: true };
  };

  const runBackgroundJob = (jobId: string) => {
    const job = state.backgroundJobs.find(j => j.id === jobId);
    if (!job) return;

    let resultMsg = 'Job completed successfully.';
    if (job.id === 'job-1') {
      const activeTrips = state.trips.filter(t => t.status === 'in_progress');
      resultMsg = `Checked ${activeTrips.length} active town trips. 0 overdue.`;
    } else if (job.id === 'job-2') {
      const lowStock = state.parts.filter(p => p.currentStock <= p.minimumStock);
      resultMsg = `Scanned inventory: ${lowStock.length} items below minimum threshold (${lowStock.map(p => p.partCode).join(', ')}).`;
    } else if (job.id === 'job-4') {
      refreshGpsTelemetry();
      resultMsg = `Polled 8 GPS device telematics feeds. All fresh.`;
    }

    const updatedJob: BackgroundJob = {
      ...job,
      lastRun: new Date().toISOString(),
      lastResult: resultMsg,
      status: 'completed'
    };

    setState(prev => ({
      ...prev,
      backgroundJobs: prev.backgroundJobs.map(j => j.id === jobId ? updatedJob : j)
    }));
  };

  return (
    <AppContext.Provider value={{
      state,
      switchUser,
      resetToDemoData,
      createTrip,
      approveTripOps,
      verifyTripYard,
      dispatchTrip,
      recordTripReturn,
      closeTrip,
      cancelTrip,
      reportBreakdown,
      createWorkOrder,
      updateWorkOrderStage,
      requestSparePart,
      releaseVehicleFromWorkshop,
      receiveStock,
      approveSpareRequest,
      issueSparePart,
      adjustStock,
      recordFuelTransaction,
      refreshGpsTelemetry,
      submitInspection,
      resolveCriticalDefect,
      reportIncident,
      closeIncident,
      runBackgroundJob
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
