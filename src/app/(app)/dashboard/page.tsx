import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, FileText, Home, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const summaryCards = [
    { title: "Mis Propiedades", value: "3", icon: <Home className="h-6 w-6 text-muted-foreground" />, description: "Propiedades registradas" },
    { title: "Contratos Activos", value: "2", icon: <FileText className="h-6 w-6 text-muted-foreground" />, description: "Contratos vigentes" },
    { title: "Pagos Pendientes", value: "1", icon: <CreditCard className="h-6 w-6 text-muted-foreground" />, description: "Pagos por aprobar" },
    { title: "Incidentes Abiertos", value: "0", icon: <ShieldAlert className="h-6 w-6 text-muted-foreground" />, description: "Incidentes sin resolver" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aún no hay actividad reciente.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No tiene notificaciones nuevas.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
