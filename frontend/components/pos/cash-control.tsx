'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/backend';
import { toast } from 'sonner';
import { formatThousands, parseThousands, cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CashOpenDialog({ isOpen, onOpenSuccess }: { isOpen: boolean, onOpenSuccess: () => void }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const supabase = createClient();
    const router = useRouter();

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
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
                <DialogFooter className="flex flex-col gap-3 mt-2">
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/sales')}
                            className="w-full rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleOpen}
                            disabled={loading}
                            className="w-full rounded-xl font-bold"
                        >
                            {loading ? 'Abriendo...' : 'Abrir Turno'}
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 h-9 rounded-xl"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CashCloseDialog({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            loadSummary();
        }
    }, [isOpen]);

    const loadSummary = async () => {
        try {
            const data = await api.cashFlow.summary();
            setSummary(data);
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    }

    const supabase = createClient();
    const router = useRouter();

    const handleClose = async () => {
        if (!amount) return toast.error('Ingresa el monto final');
        setLoading(true);
        try {
            await api.cashFlow.close({ finalAmount: parseThousands(amount) });
            toast.success('Caja cerrada. Turno finalizado.');

            // Cerrar sesión automáticamente al cerrar caja
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh();

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
                        Revisa el resumen y cuenta el efectivo real para el arqueo.
                    </DialogDescription>
                </DialogHeader>

                {summary && (
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border text-sm">
                        <div className="flex justify-between items-center text-gray-500">
                            <span>Base Inicial</span>
                            <span>${formatThousands(summary.initialAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600 font-medium">
                            <span>Ventas Efectivo (+)</span>
                            <span className="text-emerald-600">+${formatThousands(summary.totalSales)}</span>
                        </div>
                        {summary.deposits > 0 && (
                            <div className="flex justify-between items-center text-gray-600 font-medium">
                                <span>Entradas Manuales (+)</span>
                                <span className="text-emerald-600">+${formatThousands(summary.deposits)}</span>
                            </div>
                        )}
                        {(summary.withdrawals > 0 || summary.expenses > 0) && (
                            <div className="flex justify-between items-center text-gray-600 font-medium">
                                <span>Retiros / Gastos (-)</span>
                                <span className="text-red-600">-${formatThousands(summary.withdrawals + summary.expenses)}</span>
                            </div>
                        )}
                        <div className="pt-2 border-t flex justify-between items-center font-black text-lg">
                            <span>Total Esperado</span>
                            <span className="text-indigo-600">${formatThousands(summary.expected)}</span>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="finalAmount" className="font-bold">Efectivo Real en Caja</Label>
                        <Input
                            id="finalAmount"
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(formatThousands(e.target.value))}
                            placeholder="0"
                            className="text-xl font-black h-12"
                        />
                        <p className="text-[10px] text-gray-400 italic">
                            Cuenta billete por billete lo que tienes físicamente.
                        </p>
                    </div>
                </div>
                <DialogFooter className="flex flex-col gap-2 mt-4">
                    <Button
                        variant="destructive"
                        onClick={handleClose}
                        disabled={loading}
                        className="w-full h-12 rounded-xl font-bold text-lg"
                    >
                        {loading ? 'Cerrando...' : 'Finalizar Turno y Salir'}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full rounded-xl text-gray-500"
                    >
                        Volver al POS
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function CashTransactionDialog({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'EXPENSE'>('WITHDRAWAL');
    const [loading, setLoading] = useState(false);

    const handleTransaction = async () => {
        if (!amount || Number(parseThousands(amount)) <= 0) return toast.error('Ingresa un monto válido');
        if (!reason.trim()) return toast.error('Ingresa el motivo del movimiento');

        setLoading(true);
        try {
            await api.cashFlow.addTransaction({
                amount: parseThousands(amount),
                reason: reason.trim(),
                type
            });
            toast.success('Movimiento registrado correctamente');
            setAmount('');
            setReason('');
            onClose();
            onSuccess();
        } catch (error) {
            toast.error('Error al registrar movimiento');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Movimiento de Caja</DialogTitle>
                    <DialogDescription>
                        Registra una entrada o salida de efectivo manual.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            type="button"
                            variant={type === 'WITHDRAWAL' ? 'default' : 'outline'}
                            className={cn(type === 'WITHDRAWAL' ? "bg-red-600 hover:bg-red-700" : "")}
                            onClick={() => setType('WITHDRAWAL')}
                        >
                            Retiro
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'EXPENSE' ? 'default' : 'outline'}
                            className={cn(type === 'EXPENSE' ? "bg-amber-600 hover:bg-amber-700" : "")}
                            onClick={() => setType('EXPENSE')}
                        >
                            Gasto
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'DEPOSIT' ? 'default' : 'outline'}
                            className={cn(type === 'DEPOSIT' ? "bg-emerald-600 hover:bg-emerald-700" : "")}
                            onClick={() => setType('DEPOSIT')}
                        >
                            Entrada
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="txAmount">Monto</Label>
                        <Input
                            id="txAmount"
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(formatThousands(e.target.value))}
                            placeholder="0"
                            className="text-lg font-bold"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reason">Motivo / Descripción</Label>
                        <Input
                            id="reason"
                            placeholder="Ej: Pago de domicilio, Base adicional..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button
                        onClick={handleTransaction}
                        disabled={loading}
                        className={cn(
                            type === 'DEPOSIT' ? "bg-emerald-600 hover:bg-emerald-700" :
                                type === 'EXPENSE' ? "bg-amber-600 hover:bg-amber-700" :
                                    "bg-red-600 hover:bg-red-700"
                        )}
                    >
                        {loading ? 'Procesando...' : 'Confirmar Movimiento'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
