'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { api } from '@/lib/backend'
import { toast } from 'sonner'
import { Input } from './ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Customer {
    id: string
    name: string
    docNumber?: string
    phone?: string
}

const COUNTRIES = [
    { code: '57', name: 'Colombia', flag: 'CO' },
    { code: '58', name: 'Venezuela', flag: 'VE' },
    { code: '34', name: 'Espana', flag: 'ES' },
    { code: '1', name: 'USA/Canada', flag: 'US' },
    { code: '52', name: 'Mexico', flag: 'MX' },
    { code: '507', name: 'Panama', flag: 'PA' },
    { code: '593', name: 'Ecuador', flag: 'EC' },
    { code: '51', name: 'Peru', flag: 'PE' },
    { code: '54', name: 'Argentina', flag: 'AR' },
    { code: '56', name: 'Chile', flag: 'CL' },
    { code: '506', name: 'Costa Rica', flag: 'CR' },
    { code: '502', name: 'Guatemala', flag: 'GT' },
]

export function CustomerSelector({
    onSelect,
    selectedCustomer: externalSelectedCustomer,
    onCreateNew: onSelectNew,
}: {
    onSelect: (customer: Customer | null) => void
    selectedCustomer?: Customer | null
    onCreateNew?: () => void
}) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('')
    const [customers, setCustomers] = useState<Customer[]>([])

    const [isCreating, setIsCreating] = useState(false)
    const [countryCode, setCountryCode] = useState('57')
    const [newCustomer, setNewCustomer] = useState({ name: '', docNumber: '', phone: '' })

    const loadCustomers = async () => {
        try {
            const result = await api.customers.list()
            setCustomers(result.data)
        } catch (e) {
            console.error(e)
        }
    }

    const selectedId = externalSelectedCustomer?.id ?? value

    const handleOpenChange = async (nextOpen: boolean) => {
        setOpen(nextOpen)
        if (nextOpen && customers.length === 0) {
            await loadCustomers()
        }
    }

    const handleCreate = async () => {
        if (!newCustomer.name.trim()) {
            toast.error('El nombre es obligatorio')
            return
        }
        if (!newCustomer.docNumber.trim()) {
            toast.error('La cedula/documento es obligatoria')
            return
        }
        if (!newCustomer.phone.trim()) {
            toast.error('El telefono es obligatorio')
            return
        }

        try {
            const created = await api.customers.create({
                name: newCustomer.name.trim(),
                docNumber: newCustomer.docNumber.trim(),
                phone: `+${countryCode}${newCustomer.phone.replace(/\D/g, '')}`,
            })

            setCustomers([...customers, created])
            setValue(created.id)
            onSelect(created)
            setOpen(false)
            setIsCreating(false)
            setCountryCode('57')
            setNewCustomer({ name: '', docNumber: '', phone: '' })
            toast.success('Cliente creado rapidamente')
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Error al crear cliente'
            toast.error(message)
        }
    }

    return (
        <div>
            <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {selectedId
                            ? customers.find((customer) => customer.id === selectedId)?.name
                            : 'Seleccionar cliente...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0 bg-white border shadow-xl z-[80]">
                    {isCreating ? (
                        <div className="p-3 space-y-3 bg-white">
                            <h4 className="font-medium text-sm">Nuevo Cliente Rapido</h4>
                            <Input
                                placeholder="Nombre completo"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
                            />
                            <Input
                                placeholder="DNI / CC *"
                                value={newCustomer.docNumber}
                                onChange={(e) => setNewCustomer((prev) => ({ ...prev, docNumber: e.target.value }))}
                            />
                            <div className="flex gap-2">
                                <Select value={countryCode} onValueChange={setCountryCode}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[90] bg-white">
                                        {COUNTRIES.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.flag} +{c.code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Telefono"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                                    className="flex-1"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" className="flex-1" onClick={handleCreate}>Guardar</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            </div>
                        </div>
                    ) : (
                        <Command className="bg-white">
                            <CommandInput placeholder="Buscar cliente..." />
                            <CommandList>
                                <CommandEmpty>No encontrado.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => {
                                            if (onSelectNew) {
                                                onSelectNew()
                                                setOpen(false)
                                            } else {
                                                setIsCreating(true)
                                            }
                                        }}
                                        className="text-primary font-medium cursor-pointer bg-primary/5 mb-1"
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-2 text-lg">+</span>
                                            Crear Nuevo Cliente
                                        </div>
                                    </CommandItem>

                                    {customers.map((customer) => (
                                        <CommandItem
                                            key={customer.id}
                                            value={`${customer.name} ${customer.docNumber || ''} ${customer.phone || ''}`}
                                            onSelect={() => {
                                                const nextId = customer.id === selectedId ? '' : customer.id
                                                setValue(nextId)
                                                onSelect(nextId ? customer : null)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    selectedId === customer.id ? 'opacity-100' : 'opacity-0',
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span>{customer.name}</span>
                                                {customer.docNumber && <span className="text-xs text-muted-foreground">{customer.docNumber}</span>}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    )
}
