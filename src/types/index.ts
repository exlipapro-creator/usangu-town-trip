/**
 * Usangu Logistics - Town Trip Management System
 * Domain Types & Interfaces
 */

export type RoleType = 
  | 'operations_manager' 
  | 'yard_supervisor' 
  | 'workshop_supervisor' 
  | 'stores_officer' 
  | 'safety_officer' 
  | 'management_read_only'
  | 'system_admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  department: string;
  phone: string;
}

export type VehicleStatus = 'active' | 'under_maintenance' | 'breakdown' | 'awaiting_inspection' | 'suspended' | 'retired';

export interface Vehicle {
  id: string;
  fleetNumber: string; // e.g. US-TRK-01
  registrationNumber: string; // e.g. T 482 DWL
  vehicleType: 'Tractor Head' | 'Container Carrier' | 'Flatbed Truck' | 'Light Commercial' | 'Service Vehicle';
  make: string;
  model: string;
  year: number;
  fuelType: 'Diesel' | 'Petrol';
  currentOdometer: number;
  initialOdometer: number;
  ownershipType: 'Company Owned' | 'Leased';
  capacityTonnes: number;
  status: VehicleStatus;
  attachedTrailerId?: string | null;
  currentTripId?: string | null;
  activeWorkOrderId?: string | null;
  hasCriticalDefect: boolean;
  criticalDefectReason?: string;
  lastInspectionDate?: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  inspectionExpiry: string;
  gpsDeviceId?: string;
  notes?: string;
}

export interface Trailer {
  id: string;
  trailerNumber: string; // e.g. US-TRL-101
  registrationNumber: string; // e.g. T 109 CRB
  category: 'Flatbed Skeletal' | 'Container Skeletal 40ft' | 'Container Skeletal 20ft' | 'Lowbed';
  capacityTonnes: number;
  condition: 'Good' | 'Needs Attention' | 'Under Repair';
  status: 'available' | 'attached' | 'in_trip' | 'maintenance';
  attachedToVehicleId?: string | null;
  registrationExpiry: string;
  insuranceExpiry: string;
}

export interface Driver {
  id: string;
  staffId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseClass: string; // e.g. Class E / C
  licenseExpiry: string;
  status: 'available' | 'on_trip' | 'leave' | 'suspended';
  assignedVehicleId?: string | null;
}

export interface Technician {
  id: string;
  staffId: string;
  name: string;
  specialty: 'Senior Diesel Mechanic' | 'Auto Electrician' | 'Tyre & Suspension Specialist' | 'Hydraulics & Brakes' | 'Welder & Bodywork';
  phone: string;
  activeWorkOrdersCount: number;
  status: 'available' | 'busy' | 'off_duty';
}

export type TripStatus = 
  | 'draft'
  | 'submitted'
  | 'pending_operations_approval'
  | 'pending_yard_verification'
  | 'approved_for_dispatch'
  | 'dispatched'
  | 'in_progress'
  | 'returned'
  | 'pending_closure'
  | 'completed'
  | 'cancelled';

export interface Trip {
  id: string;
  tripReference: string; // e.g. TT-2026-0104
  tripDate: string; // YYYY-MM-DD
  purpose: string; // e.g. Container Shunting from TICTS Gate 4 to Kurasini Yard
  customerOrDept: string;
  origin: string; // e.g. Dar Port Gate 4 / TICTS
  destination: string; // e.g. Kurasini Central Yard
  cargoDetails?: string;
  assignedVehicleId: string;
  assignedTrailerId?: string | null;
  primaryDriverId: string;
  assistantDriverId?: string | null;
  expectedDeparture: string; // ISO
  expectedReturn: string; // ISO
  actualDeparture?: string | null;
  actualReturn?: string | null;
  openingOdometer?: number | null;
  closingOdometer?: number | null;
  distanceKm?: number | null;
  status: TripStatus;
  operationalInstructions?: string;
  reportedDefectOnReturn?: boolean;
  defectNotes?: string;
  returnRemarks?: string;
  createdBy: string;
  approvedByOps?: string | null;
  approvedOpsAt?: string | null;
  verifiedByYard?: string | null;
  verifiedYardAt?: string | null;
  dispatchedBy?: string | null;
  dispatchedAt?: string | null;
  receivedByYard?: string | null;
  receivedYardAt?: string | null;
  closedBy?: string | null;
  closedAt?: string | null;
  cancellationReason?: string;
}

export type BreakdownSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface BreakdownReport {
  id: string;
  breakdownReference: string; // e.g. BD-2026-0031
  vehicleId: string;
  relatedTripId?: string | null;
  reportedAt: string;
  reportedBy: string; // Name & role
  faultCategory: 'Engine & Transmission' | 'Braking System' | 'Electrical & Lights' | 'Tyres & Wheels' | 'Suspension & Steering' | 'Cooling System' | 'Chassis & Body';
  faultDescription: string;
  severity: BreakdownSeverity;
  vehicleLocation: string;
  immediateAction: string;
  safetyImplications: string;
  status: 'reported' | 'received_in_workshop' | 'work_order_created' | 'resolved';
}

export type WorkOrderStage = 
  | 'received'
  | 'awaiting_diagnosis'
  | 'diagnosed'
  | 'awaiting_approval'
  | 'awaiting_spare_parts'
  | 'ready_for_repair'
  | 'repair_in_progress'
  | 'repair_completed'
  | 'awaiting_quality_inspection'
  | 'inspection_failed'
  | 'awaiting_release'
  | 'released'
  | 'cancelled';

export interface WorkOrder {
  id: string;
  workOrderReference: string; // e.g. WO-2026-0089
  vehicleId: string;
  breakdownId?: string | null;
  diagnosis: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTechnicianId?: string | null;
  workDescription: string;
  createdAt: string;
  expectedCompletion: string;
  actualCompletion?: string | null;
  stage: WorkOrderStage;
  repairNotes?: string;
  inspectionPassed?: boolean;
  inspectionNotes?: string;
  inspectedBy?: string | null;
  releasedBy?: string | null;
  releasedAt?: string | null;
  downtimeHours?: number;
}

export interface Part {
  id: string;
  partCode: string; // e.g. BRK-PAD-01
  partName: string;
  category: 'Braking' | 'Filters & Oils' | 'Tyres & Wheels' | 'Electrical' | 'Suspension' | 'Engine Components' | 'Fasteners & Hardware';
  description: string;
  unitOfMeasure: 'pcs' | 'sets' | 'litres' | 'boxes' | 'pairs';
  currentStock: number;
  minimumStock: number;
  reorderThreshold: number;
  unitCostTZS: number;
  storageLocation: string; // e.g. Shelf A-03, Rack 2
  status: 'active' | 'discontinued';
}

export type StockMovementType = 'opening_balance' | 'receipt' | 'issue' | 'return' | 'adjustment';

export interface StockMovement {
  id: string;
  movementReference: string;
  partId: string;
  movementType: StockMovementType;
  quantity: number; // positive for receipt/return, negative for issue
  balanceAfter: number;
  unitCostTZS?: number;
  totalCostTZS?: number;
  workOrderId?: string | null;
  vehicleId?: string | null;
  referenceDoc?: string; // Delivery note # or requisition #
  reason?: string;
  performedBy: string;
  createdAt: string;
}

export type SpareRequestStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'issued' | 'cancelled';

export interface SpareRequest {
  id: string;
  requestReference: string; // e.g. SR-2026-0155
  workOrderId: string;
  vehicleId: string;
  partId: string;
  quantityRequested: number;
  quantityApproved?: number;
  quantityIssued?: number;
  requestingTechnicianId: string;
  requestedAt: string;
  justification: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: SpareRequestStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string;
  issuedAt?: string | null;
}

export interface FuelTransaction {
  id: string;
  transactionReference: string; // e.g. FL-2026-0312
  vehicleId: string;
  relatedTripId?: string | null;
  fuelType: 'Diesel';
  litres: number;
  unitPriceTZS: number;
  totalCostTZS: number;
  sourceType: 'company_yard_tank' | 'external_station';
  supplierOrStation: string; // e.g. Puma Energy Kurasini / Total Port Rd / Usangu Yard Tank 01
  date: string;
  odometerReading: number;
  previousOdometerReading?: number;
  distanceTravelledKm?: number;
  consumptionLitersPer100Km?: number | null;
  hasException: boolean;
  exceptionReason?: string;
  driverId: string;
  issuedBy: string;
  authorisedBy: string;
  notes?: string;
}

export type GpsTrackingStatus = 'live' | 'delayed' | 'stale' | 'offline';

export interface GpsDevice {
  id: string;
  deviceId: string;
  vehicleId: string;
  provider: 'Tramigo' | 'Teltonika FMB' | 'Cartrack' | 'Standard GPS Telematics';
  imei: string;
  simCardNumber: string;
  status: 'active' | 'faulty' | 'deactivated';
}

export interface GpsPosition {
  deviceId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: string; // ISO
  speedKmh: number;
  headingDeg: number;
  ignition: boolean;
  address: string;
  trackingStatus: GpsTrackingStatus;
  batteryLevel?: number;
}

export type InspectionType = 'pre_trip' | 'post_trip' | 'workshop' | 'periodic_safety';

export interface InspectionItem {
  id: string;
  category: 'Vehicle Exterior' | 'Mechanical & Brakes' | 'Safety Equipment' | 'Documentation & Compliance';
  name: string;
  isCritical: boolean;
  result: 'pass' | 'fail' | 'requires_attention' | 'na';
  notes?: string;
}

export interface VehicleInspection {
  id: string;
  inspectionReference: string; // e.g. INSP-2026-0210
  inspectionType: InspectionType;
  vehicleId: string;
  relatedTripId?: string | null;
  inspectedAt: string;
  inspectedBy: string;
  odometer: number;
  overallPassed: boolean;
  criticalDefectsFound: number;
  items: InspectionItem[];
  remarks?: string;
  correctiveActionRequired?: string;
}

export interface IncidentReport {
  id: string;
  incidentReference: string; // e.g. INC-2026-0014
  vehicleId: string;
  driverId: string;
  relatedTripId?: string | null;
  date: string;
  location: string;
  incidentType: 'Minor Scrape/Dent' | 'Tyre Blowout' | 'Rear-end Collision' | 'Cargo Shift' | 'Near Miss' | 'Traffic Violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  injuriesRecorded: boolean;
  estimatedDamageTZS: number;
  immediateActionTaken: string;
  investigationNotes?: string;
  correctiveAction: string;
  responsibleOfficer: string;
  isClosed: boolean;
  closedAt?: string | null;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  previousState?: string;
  newState?: string;
}

export interface BackgroundJob {
  id: string;
  jobName: string;
  frequency: string;
  lastRun: string;
  nextRun: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastResult: string;
}
