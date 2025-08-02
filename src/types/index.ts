export interface Property {
  id: string;
  code: string;
  ownerRut?: string;
  region: string;
  comuna: string;
  address: string;
  status: "Disponible" | "Arrendada" | "Mantenimiento";
  type: "Casa" | "Departamento" | "Local Comercial" | "Terreno" | "Bodega" | "Estacionamiento" | "Pieza" | "Galpón";
  price?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  description: string;
}

export interface Contract {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyName: string;
  landlordName: string;
  landlordId?: string; // Added for incidents
  tenantName: string;
  tenantEmail: string;
  tenantRut: string;
  tenantId?: string; // Added for incidents
  startDate: string; 
  endDate: string; 
  rentAmount: number;
  status: "Borrador" | "Activo" | "Finalizado" | "Cancelado";
  propertyUsage: "Habitacional" | "Comercial";
  securityDepositAmount?: number;
  rentPaymentDay?: number;
  commonExpensesIncluded?: "incluidos" | "no incluidos" | "no aplica";
  commonExpensesPaymentDay?: number;
  utilitiesPaymentDay?: number;
  ipcAdjustment?: boolean;
  ipcAdjustmentFrequency?: "trimestral" | "semestral" | "anual";
  propertyRolAvaluo?: string;
  propertyCBRFojas?: string;
  propertyCBRNumero?: string;
  propertyCBRAno?: number;
  tenantNationality?: string;
  tenantCivilStatus?: string;
  tenantProfession?: string;
  prohibitionToSublet?: boolean;
  specialClauses?: string;
}

export type UserRole = "Arrendador" | "Arrendatario";

export interface UserProfile {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
}

export type PaymentType = "arriendo" | "gastos comunes" | "servicios" | "multas" | "otro";
export type ServiceType = "agua" | "electricidad" | "gas";


export interface Payment {
  id: string;
  contractId: string;
  propertyName: string;
  landlordName?: string;
  tenantName?: string;
  type: PaymentType;
  serviceType?: ServiceType;
  otherTypeDescription?: string;
  amount: number;
  paymentDate: string; // ISO string
  declaredAt: string; // ISO string
  acceptedAt?: string; // ISO string
  status: "pendiente" | "aceptado";
  notes?: string;
  attachmentUrl?: string;
  isOverdue?: boolean;
}

export type IncidentStatus = "pendiente" | "respondido" | "cerrado";
export const incidentTypes = [
  "pago",
  "cuidado de la propiedad",
  "ruidos molestos",
  "reparaciones necesarias",
  "incumplimiento de contrato",
  "otros",
] as const;

export type IncidentType = typeof incidentTypes[number];


export interface IncidentResponse {
  responseText: string;
  respondedAt: string; // ISO String
  respondedBy: string; // User ID
  responseAttachmentUrl?: string;
  responseAttachmentName?: string;
}

export interface Incident {
  id: string;
  contractId: string;
  propertyId: string;
  propertyName: string;
  landlordId: string;
  landlordName?: string;
  tenantId: string;
  tenantName?: string;
  type: IncidentType;
  description: string;
  status: IncidentStatus;
  createdAt: string; // ISO String
  createdBy: string; // User ID of creator
  initialAttachmentUrl?: string;
  initialAttachmentName?: string;
  responses?: IncidentResponse[];
  closedAt?: string; // ISO String
  closedBy?: string; // User ID of closer
}

export interface IncidentFormValues {
    contractId: string;
    type: IncidentType;
    description: string;
    initialAttachment?: FileList;
}
