"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Incident, UserProfile, IncidentStatus } from "@/types";
import { AlertTriangle, MessageSquare, CheckCircle2, CalendarDays, Paperclip } from "lucide-react";

interface IncidentCardProps {
  incident: Incident;
  currentUser: UserProfile | null;
  onRespond?: (incident: Incident) => void;
  onClose?: (incidentId: string) => void;
  isProcessing?: boolean;
}

export function IncidentCard({ incident, currentUser, onRespond, onClose, isProcessing }: IncidentCardProps) {
  const getStatusVariant = (status: IncidentStatus) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "respondido":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cerrado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const creatorIsLandlord = incident.createdBy === incident.landlordId;
  const creatorName = creatorIsLandlord ? (incident.landlordName || "Arrendador") : (incident.tenantName || "Arrendatario");

  const closerName = incident.closedBy
    ? (incident.closedBy === incident.landlordId ? (incident.landlordName || "Arrendador") : (incident.tenantName || "Arrendatario"))
    : "N/A";

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold font-headline flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
            <span className="truncate">
              {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
            </span>
          </CardTitle>
          <Badge className={`${getStatusVariant(incident.status)} text-xs font-semibold`}>
            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground pt-1 truncate">
          Propiedad: {incident.propertyName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-sm flex-grow">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Creado: {formatDate(incident.createdAt)} por {creatorName}</span>
        </div>
        <div>
            <p className="font-semibold text-sm mb-1">Descripción:</p>
            <p className="text-muted-foreground bg-muted/40 p-2 rounded-md whitespace-pre-wrap text-xs max-h-24 overflow-y-auto">
            {incident.description}
            </p>
            {incident.initialAttachmentUrl && (
            <a
                href={incident.initialAttachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 truncate"
                download={incident.initialAttachmentName || 'adjunto'}
            >
                <Paperclip className="h-3 w-3 mr-1" /> {incident.initialAttachmentName || 'Descargar adjunto'}
            </a>
            )}
        </div>

        {incident.responses && incident.responses.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/70 space-y-2">
            <p className="font-semibold flex items-center text-sm">
              <MessageSquare className="h-4 w-4 mr-2 text-primary" /> Respuestas:
            </p>
            {incident.responses.map((response, index) => {
              const responderName = response.respondedBy === incident.landlordId
                ? (incident.landlordName || "Arrendador")
                : (incident.tenantName || "Arrendatario");
              return (
                <div key={index} className="border-l-2 border-primary/50 pl-3 ml-1 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {formatDate(response.respondedAt)} por {responderName}:
                  </p>
                  <p className="text-muted-foreground bg-muted/40 p-2 rounded-md whitespace-pre-wrap text-xs max-h-20 overflow-y-auto">
                    {response.responseText}
                  </p>
                  {response.responseAttachmentUrl && (
                    <a
                      href={response.responseAttachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 truncate"
                      download={response.responseAttachmentName || 'adjunto'}
                    >
                      <Paperclip className="h-3 w-3 mr-1" /> {response.responseAttachmentName || 'Descargar adjunto'}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {incident.status === "cerrado" && (
          <div className="mt-2 pt-2 border-t border-border/70">
            <p className="text-xs font-semibold flex items-center text-gray-500">
              <CheckCircle2 className="h-4 w-4 mr-2 text-gray-500" />
              Cerrado por {closerName} el {formatDate(incident.closedAt)}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2 bg-muted/40 p-3 mt-auto">
        {currentUser && incident.status !== "cerrado" && onRespond && (
            <Button
                variant="default"
                size="sm"
                onClick={() => onRespond(incident)}
                disabled={isProcessing}
            >
                <MessageSquare className="h-4 w-4 mr-1" /> Responder
            </Button>
        )}
        {currentUser && incident.status !== "cerrado" && incident.createdBy === currentUser.uid && onClose && (
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onClose(incident.id)}
                disabled={isProcessing}
            >
                <CheckCircle2 className="h-4 w-4 mr-1" /> {isProcessing ? "Cerrando..." : "Cerrar Incidente"}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
