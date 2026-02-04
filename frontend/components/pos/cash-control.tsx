'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/backend';
import { toast } from 'sonner';
import { formatThousands, parseThousands } from '@/lib/utils';

export function CashOpenDialog({ isOpen, onOpenSuccess }: { isOpen: boolean, onOpenSuccess: () => void }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        if (!amount) return toast.error('Ingresa un monto inicial');
        setLoading(true);
        try {
            await api.cashFlow.open({ initialAmount: parseThousands(amount) });
            toast.success('Caja abierta correctamente');
            onOpenSuccess();
        } catch (error) {
            toast.error('Error al abrir caja');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Apertura de Caja</DialogTitle>
                    <DialogDescription>
                        Debes abrir la caja para comenzar a vender. Ingresa el fondo inicial.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Monto Inicial (Base)</Label>
                        <Input
                            id="amount"
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(formatThousands(e.target.value))}
                            placeholder="0"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleOpen} disabled={loading}>
                        {loading ? 'Abriendo...' : 'Abrir Turno'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CashCloseDialog({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClose = async () => {
        if (!amount) return toast.error('Ingresa el monto final');
        setLoading(true);
        try {
            await api.cashFlow.close({ finalAmount: parseThousands(amount) });
            toast.success('Caja cerrada. Turno finalizado.');
            onClose();
            onSuccess();
        } catch (error) {
            toast.error('Error al cerrar caja');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cierre de Caja</DialogTitle>
                    <DialogDescription>
                        Cuenta el efectivo real en caja e ingrésalo para realizar el arqueo.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="finalAmount">Efectivo en Caja (Real)</Label>
                        <Input
                            id="finalAmount"
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(formatThousands(e.target.value))}
                            placeholder="0"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleClose} disabled={loading}>
                        {loading ? 'Cerrando...' : 'Cerrar Caja'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
