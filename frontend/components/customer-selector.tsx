'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { api } from '@/lib/backend'
import { toast } from 'sonner'
import { Input } from './ui/input'

interface Customer {
    id: string
    name: string
    docNumber?: string
}

export function CustomerSelector({
    onSelect
}: {
    onSelect: (customer: Customer | null) => void
}) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(false)

    // New Customer State
    const [isCreating, setIsCreating] = useState(false)
    const [newCustomer, setNewCustomer] = useState({ name: '', docNumber: '' })

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        setLoading(true)
        try {
            const data = await api.customers.list()
            setCustomers(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newCustomer.name) return
        try {
            const created = await api.customers.create(newCustomer)
            setCustomers([...customers, created])
            setValue(created.id)
            onSelect(created)
            setOpen(false)
            setIsCreating(false)
            setNewCustomer({ name: '', docNumber: '' })
            toast.success('Cliente creado rápidamente')
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const selectedCustomer = customers.find((customer) => customer.id === value)

    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {value
                            ? customers.find((customer) => customer.id === value)?.name
                            : "Seleccionar cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    {isCreating ? (
                        <div className="p-3 space-y-3">
                            <h4 className="font-medium text-sm">Nuevo Cliente Rápido</h4>
                            <Input
                                placeholder="Nombre completo"
                                value={newCustomer.name}
                                onChange={e => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <Input
                                placeholder="DNI / CC (Opcional)"
                                value={newCustomer.docNumber}
                                onChange={e => setNewCustomer(prev => ({ ...prev, docNumber: e.target.value }))}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" className="flex-1" onClick={handleCreate}>Guardar</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            </div>
                        </div>
                    ) : (
                        <Command>
                            <CommandInput placeholder="Buscar cliente..." />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        No encontrado.
                                        <Button
                                            variant="link"
                                            className="h-auto p-0 ml-1"
                                            onClick={() => setIsCreating(true)}
                                        >
                                            Crear nuevo
                                        </Button>
                                    </div>
                                </CommandEmpty>
                                <CommandGroup>
                                    {customers.map((customer) => (
                                        <CommandItem
                                            key={customer.id}
                                            value={customer.name}
                                            onSelect={(currentValue) => {
                                                const found = customers.find(c => c.name.toLowerCase() === currentValue.toLowerCase() || c.name === customer.name)
                                                if (found) {
                                                    setValue(found.id === value ? "" : found.id)
                                                    onSelect(found.id === value ? null : found)
                                                    setOpen(false)
                                                }
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === customer.id ? "opacity-100" : "opacity-0"
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
