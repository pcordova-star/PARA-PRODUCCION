



export interface Property {
  id: string;
  code: string;
  ownerUid?: string; // Added to link property to a user
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
  landlordId: string; 
  tenantName: string;
  tenantEmail: string;
  tenantRut: string;
  tenantId: string | null; 
  startDate: string; 
  endDate: string; 
  rentAmount: number;
  status: "Borrador" | "Activo" | "Finalizado" | "Cancelado" | "Archivado";
  archivedAt?: string;
  managementType?: "collaborative" | "internal";
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
  // Signature fields
  signatureToken?: string;
  signedByTenant?: boolean;
  tenantSignedAt?: string;
  signedByLandlord?: boolean;
  landlordSignedAt?: string;
}

export type UserRole = "Arrendador" | "Arrendatario";

export interface PendingContract {
  contractId: string;
  landlordName: string;
  propertyAddress: string;
  addedAt: string;
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  rut?: string;
  createdAt?: string;
  mobilePhone?: string;
  pendingContracts?: PendingContract[];
  subscriptionStatus?: 'trialing' | 'active' | 'expired' | 'canceled';
  trialEndsAt?: string; // ISO Date String
}

export type PaymentType = "arriendo" | "gastos comunes" | "servicios" | "multas" | "garantía" | "otro";
export type ServiceType = "agua" | "electricidad" | "gas";


export interface Payment {
  id: string;
  contractId: string;
  propertyName: string;
  landlordId: string;
  landlordName?: string;
  tenantId: string;
  tenantName?: string;
  type: PaymentType;
  serviceType?: ServiceType;
  otherTypeDescription?: string;
  amount: number;
  paymentDate: string; 
  declaredAt: string; 
  acceptedAt?: string; 
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
  respondedAt: string; 
  respondedBy: string; 
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
  tenantId: string | null;
  tenantName?: string;
  type: IncidentType;
  description: string;
  status: IncidentStatus;
  createdAt: string; 
  createdBy: string; 
  initialAttachmentUrl?: string;
  initialAttachmentName?: string;
  responses?: IncidentResponse[];
  closedAt?: string; 
  closedBy?: string; 
}

export interface IncidentFormValues {
    contractId: string;
    type: IncidentType;
    description: string;
    initialAttachment?: FileList;
}

export interface EvaluationCriteria {
  paymentPunctuality: number; 
  propertyCare: number; 
  communication: number; 
  generalBehavior: number; 
}

export interface Evaluation {
  id: string;
  contractId: string;
  propertyId: string;
  propertyName: string;
  landlordId: string;
  landlordName: string;
  tenantId: string;
  tenantName: string;
  evaluationDate: string; 
  status: "pendiente de confirmacion" | "recibida";
  criteria: EvaluationCriteria;
  tenantComment?: string;
  tenantConfirmedAt?: string; 
}

// --- Tenant Certificate Types ---

// DEPRECATED - Use ContractReportData instead
export interface TenantRentalHistory {
  contractId: string;
  propertyAddress: string;
  startDate: string;
  endDate: string;
  landlordName: string;
}

// DEPRECATED
export interface TenantEvaluationsSummary {
  averagePunctuality: number | null;
  averagePropertyCare: number | null;
  averageCommunication: number | null;
  averageGeneralBehavior: number | null;
  overallAverage: number | null;
  evaluations: Evaluation[];
}

// DEPRECATED
export interface TenantPaymentsSummary {
  totalPaymentsDeclared: number;
  totalPaymentsAccepted: number;
  totalAmountAccepted: number;
  compliancePercentage: number | null;
  totalOverduePayments: number;
  overduePaymentsPercentage: number | null;
}

// DEPRECATED
export interface TenantIncidentsSummary {
  totalIncidentsInvolved: number;
  incidentsReportedByTenant: number;
  incidentsReceivedByTenant: number;
  incidentsResolved: number;
}

export interface ContractReportData {
  contract: Contract;
  landlordEmail: string;
  evaluations: Evaluation[];
  payments: Payment[];
  incidents: Incident[];
}


export interface TenantCertificateData {
  tenantProfile: UserProfile;
  contractsData: ContractReportData[];
  globalScore: number | null;
  generationDate: string;
  certificateId: string;
}
