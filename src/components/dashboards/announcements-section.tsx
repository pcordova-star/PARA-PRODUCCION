'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export function AnnouncementsSection() {
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center"><Megaphone className="mr-2" />Anuncios y Novedades</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No hay anuncios nuevos en este momento.</p>
            </CardContent>
        </Card>
    );
}
