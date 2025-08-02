'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

export function BulkUploadModal({ isOpen, onClose, onUploadSuccess }: BulkUploadModalProps) {
    const { toast } = useToast();

    const handleUpload = () => {
        toast({
            title: "Función no implementada",
            description: "La carga masiva de propiedades estará disponible próximamente.",
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Carga Masiva de Propiedades</DialogTitle>
                    <DialogDescription>
                        Sube un archivo CSV o Excel para añadir múltiples propiedades a la vez.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Esta funcionalidad aún no está implementada. Vuelve a intentarlo más tarde.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleUpload} disabled>Subir Archivo</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
