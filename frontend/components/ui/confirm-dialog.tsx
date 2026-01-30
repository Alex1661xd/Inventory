'use client'

import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    children?: React.ReactNode
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = "Continuar",
    cancelText = "Cancelar",
    variant = 'default',
    children
}: ConfirmDialogProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 m-4 animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 leading-none mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                    {children && <div className="mt-4">{children}</div>}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-gray-200"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={() => {
                            onConfirm()
                            onOpenChange(false)
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    )
}
