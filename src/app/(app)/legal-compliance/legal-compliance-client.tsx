'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { generateLegalComplianceReport, type LegalComplianceReportOutput } from '@/ai/flows/legal-compliance-report';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function LegalComplianceClient() {
  const [propertyConditions, setPropertyConditions] = useState('');
  const [currentRegulations, setCurrentRegulations] = useState('');
  const [report, setReport] = useState<LegalComplianceReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const result = await generateLegalComplianceReport({
        propertyConditions,
        currentRegulations,
      });
      setReport(result);
    } catch (err) {
      setError('No se pudo generar el informe. Por favor, inténtelo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Generador de Reporte de Cumplimiento Legal</CardTitle>
          <CardDescription>
            Evalúe las condiciones de una propiedad contra las regulaciones actuales para generar un informe de cumplimiento impulsado por IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid w-full gap-2">
              <Label htmlFor="propertyConditions" className="text-base">Condiciones de la Propiedad</Label>
              <Textarea
                id="propertyConditions"
                placeholder="Describa detalladamente las condiciones de la propiedad, incluyendo estado de instalaciones, seguridad, etc."
                value={propertyConditions}
                onChange={(e) => setPropertyConditions(e.target.value)}
                required
                rows={8}
                className="text-base"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="currentRegulations" className="text-base">Regulaciones Actuales</Label>
              <Textarea
                id="currentRegulations"
                placeholder="Pegue o describa las regulaciones legales aplicables para la zona o tipo de propiedad."
                value={currentRegulations}
                onChange={(e) => setCurrentRegulations(e.target.value)}
                required
                rows={8}
                className="text-base"
              />
            </div>
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? 'Generando Reporte...' : 'Generar Reporte'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-4/5 rounded-md" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-4/5 rounded-md" />
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {report && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">{report.complianceSummary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">{report.recommendations}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
