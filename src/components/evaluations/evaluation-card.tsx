"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Evaluation, UserRole, EvaluationCriteria } from "@/types";
import { ClipboardCheck, CheckSquare, MessageSquare, Star, CalendarDays } from "lucide-react";

interface EvaluationCardProps {
  evaluation: Evaluation;
  userRole: UserRole | null;
  onConfirmReception?: (evaluation: Evaluation) => void; 
  isProcessing?: boolean;
}

const criteriaLabels: Record<keyof EvaluationCriteria, string> = {
  paymentPunctuality: "Puntualidad Pagos",
  propertyCare: "Cuidado Propiedad",
  communication: "Comunicación",
  generalBehavior: "Convivencia General",
};

export function EvaluationCard({ evaluation, userRole, onConfirmReception, isProcessing }: EvaluationCardProps) {
  
  const getStatusVariant = (status: Evaluation["status"]) => {
    switch (status) {
      case "pendiente de confirmacion":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "recibida":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold font-headline flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-primary" />
            <span className="truncate">Evaluación: {evaluation.propertyName}</span>
          </CardTitle>
          <Badge className={`${getStatusVariant(evaluation.status)} text-xs capitalize`}>{evaluation.status}</Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground pt-1 truncate">
          {userRole === "Arrendador" 
            ? `Arrendatario: ${evaluation.tenantName}` 
            : `Arrendador: ${evaluation.landlordName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm flex-grow">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Fecha Evaluación: {formatDate(evaluation.evaluationDate)}</span>
        </div>
        
        <div className="space-y-1 pt-2">
            <p className="font-medium text-sm">Calificaciones:</p>
            {(Object.keys(criteriaLabels) as Array<keyof EvaluationCriteria>).map(key => (
                 <div key={key} className="flex justify-between items-center text-xs ml-2 py-0.5">
                    <span>{criteriaLabels[key]}:</span>
                    <div className="flex items-center">
                        {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`h-4 w-4 ${evaluation.criteria[key] >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {evaluation.status === "recibida" && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckSquare className="h-3 w-3 mr-1.5 flex-shrink-0 text-green-600" />
              <span>Confirmada por arrendatario: {formatDate(evaluation.tenantConfirmedAt)}</span>
            </div>
            {evaluation.tenantComment && (
              <div className="mt-2">
                <p className="font-medium text-xs flex items-center"><MessageSquare className="h-3 w-3 mr-1.5 text-primary"/> Comentario Arrendatario:</p>
                <p className="text-muted-foreground bg-muted/50 p-2 rounded-md whitespace-pre-wrap text-xs mt-1">{evaluation.tenantComment}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {userRole === "Arrendatario" && evaluation.status === "pendiente de confirmacion" && onConfirmReception && (
        <CardFooter className="flex justify-end space-x-2 bg-muted/40 p-3 mt-auto">
          <Button 
            className="bg-primary hover:bg-primary/90" 
            size="sm" 
            onClick={() => onConfirmReception(evaluation)}
            disabled={isProcessing}
          >
            <CheckSquare className="h-4 w-4 mr-1" /> 
            {isProcessing ? "Procesando..." : "Ver y Confirmar Recepción"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
