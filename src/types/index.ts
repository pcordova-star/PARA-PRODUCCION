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
  tenantName: string;
  tenantEmail: string;
  tenantRut: string;
  startDate: string; // ISO string format
  endDate: string; // ISO string format
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
