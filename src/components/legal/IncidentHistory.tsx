
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Contract, Incident } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface IncidentHistoryProps {
  contract: Contract;
}

export function IncidentHistory({ contract }: IncidentHistoryProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchIncidents = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const incidentsQuery = query(collection(db, 'incidents'), where('contractId', '==', contract.id));
      const incidentsSnapshot = await getDocs(incidentsQuery);
      const incidentsList = incidentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Incident)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setIncidents(incidentsList);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast({
        title: "Error al cargar incidentes",
        description: "No se pudo obtener el historial de incidentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [contract, currentUser, toast]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
     try {
        return new Date(dateString).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch(e) {
        return 'Fecha Inválida';
    }
  };

  const getStatusBadgeVariant = (status: Incident["status"]) => {
    switch (status) {
      case "pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "respondido": return "bg-blue-100 text-blue-800 border-blue-300";
      case "cerrado": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  const getUserDisplayName = (incident: Incident, userId?: string) => {
    if (!userId) return 'Sistema';
    if (userId === incident.landlordId) return incident.landlordName || `Arrendador`;
    if (userId === incident.tenantId) return incident.tenantName || `Arrendatario`;
    return `Usuario (${userId.substring(0,5)})`;
  };

  if (isLoading) {
    return <div className="p-6 text-center border rounded-md bg-background shadow mt-4 print:shadow-none print:border-none"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /> <p className="mt-2 text-muted-foreground">Cargando historial de incidentes...</p></div>;
  }

  return (
    <div className="p-6 border rounded-md bg-background shadow mt-4 print:shadow-none print:border-none">
      <header className="text-center mb-8 print:mb-6">
        <h2 className="text-2xl font-bold text-primary font-headline">HISTORIAL DE INCIDENTES</h2>
        <p className="text-md text-muted-foreground mt-1">Contrato de Arriendo Propiedad: <span className="font-semibold">{contract.propertyName}</span></p>
        <p className="text-sm text-muted-foreground">Arrendador: {contract.landlordName || contract.landlordId}</p>
        <p className="text-sm text-muted-foreground">Arrendatario: {contract.tenantName || contract.tenantEmail}</p>
        <p className="text-xs text-muted-foreground mt-2">Emitido el: {new Date().toLocaleDateString("es-CL", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-primary/90">Detalle de Incidentes Registrados</h3>
        {incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No hay incidentes registrados para este contrato.</p>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-4 border rounded-md bg-muted/50 print:border-gray-300">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-md font-semibold capitalize flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-destructive/80"/>
                    Tipo: {incident.type}
                  </h4>
                  <Badge variant="outline" className={`${getStatusBadgeVariant(incident.status)} capitalize text-xs`}>
                    {incident.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1"><strong>ID Incidente:</strong> {incident.id}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Creado:</strong> {formatDateTime(incident.createdAt)} por {getUserDisplayName(incident, incident.createdBy)}
                </p>
                <p className="text-sm mb-1"><strong>Descripción Inicial:</strong></p>
                <p className="text-sm whitespace-pre-wrap p-2 bg-background rounded text-muted-foreground max-h-28 overflow-y-auto">{incident.description}</p>

                {incident.responses && incident.responses.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                        {incident.responses.map((response, index) => (
                             <div key={index}>
                                <p className="text-sm mb-1"><strong>Respuesta {index + 1}:</strong> (Por {getUserDisplayName(incident, response.respondedBy)} el {formatDateTime(response.respondedAt)})</p>
                                <p className="text-sm whitespace-pre-wrap p-2 bg-background rounded text-muted-foreground max-h-28 overflow-y-auto">{response.responseText}</p>
                            </div>
                        ))}
                    </div>
                )}
                 {incident.status === "cerrado" && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-sm font-medium flex items-center text-green-700">
                            <CheckCircle2 className="h-4 w-4 mr-2"/>
                            Cerrado por {getUserDisplayName(incident, incident.closedBy)} el {formatDateTime(incident.closedAt)}
                        </p>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      <footer className="mt-12 pt-6 border-t text-center print:mt-8 print:pt-4">
        <p className="text-xs text-muted-foreground">
          Este historial se basa en los incidentes registrados en la plataforma S.A.R.A para el contrato ID: {contract.id}.
        </p>
      </footer>
    </div>
  );
}

    