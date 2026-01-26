'use client'

import { BarcodeProductScanner } from '@/components/barcode-product-scanner'

export default function ScannerPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                    Escáner de Productos
                </h2>
                <p className="text-[hsl(var(--muted))] text-lg">
                    Escanea un código de barras para consultar el producto y su inventario por almacén.
                </p>
            </div>

            <BarcodeProductScanner />
        </div>
    )
}
