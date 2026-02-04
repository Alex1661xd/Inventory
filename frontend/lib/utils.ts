import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatThousands(value: string | number): string {
    if (value === undefined || value === null) return ''
    const str = typeof value === 'string' ? value.replace(/\D/g, '') : Math.floor(value).toString()
    if (!str) return ''
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export function parseThousands(value: string): number {
    if (!value) return 0
    const parsed = parseInt(value.replace(/\D/g, ''), 10)
    return isNaN(parsed) ? 0 : parsed
}
