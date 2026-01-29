'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import JsBarcode from 'jsbarcode'
import imageCompression from 'browser-image-compression'
import { api, type Product, type Warehouse, type Category } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

type FormState = {
    name: string
    description: string
    sku: string
    imageUrl: string
    images: string[]
    costPrice: string
    salePrice: string
    isPublic: boolean
    initialStock: string
    initialWarehouseId: string
    categoryId: string
}

const emptyForm: FormState = {
    name: '',
    description: '',
    sku: '',
    imageUrl: '',
    images: [],
    costPrice: '0',
    salePrice: '0',
    isPublic: true,
    initialStock: '0',
    initialWarehouseId: '',
    categoryId: '',
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<FormState>(emptyForm)
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12
    const [selectedCategory, setSelectedCategory] = useState('')
    const [priceRange, setPriceRange] = useState({ min: '', max: '' })
    const [stockFilter, setStockFilter] = useState('all') // 'all', 'inStock', 'outOfStock'
    const [barcodeModal, setBarcodeModal] = useState<{ product: Product | null; visible: boolean }>({ product: null, visible: false })
    const barcodeSvgRef = useRef<SVGSVGElement | null>(null)
    const [viewModal, setViewModal] = useState<{ product: Product | null; visible: boolean }>({ product: null, visible: false })
    const viewBarcodeSvgRef = useRef<SVGSVGElement | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

    const isEditing = useMemo(() => Boolean(editingId), [editingId])

    const filteredProducts = useMemo(() => {
        let filtered = products

        // Search filter
        const q = search.trim().toLowerCase()
        if (q) {
            filtered = filtered.filter((p) => {
                const haystack = [p.name, p.sku ?? '', p.barcode ?? ''].join(' ').toLowerCase()
                return haystack.includes(q)
            })
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(p => p.categoryId === selectedCategory)
        }

        // Price range filter
        if (priceRange.min) {
            const minPrice = Number(priceRange.min)
            if (!isNaN(minPrice)) {
                filtered = filtered.filter(p => Number(p.salePrice) >= minPrice)
            }
        }
        if (priceRange.max) {
            const maxPrice = Number(priceRange.max)
            if (!isNaN(maxPrice)) {
                filtered = filtered.filter(p => Number(p.salePrice) <= maxPrice)
            }
        }

        // Stock filter
        if (stockFilter === 'inStock') {
            filtered = filtered.filter(p => (p.totalStock ?? 0) > 0)
        } else if (stockFilter === 'outOfStock') {
            filtered = filtered.filter(p => (p.totalStock ?? 0) === 0)
        }

        return filtered
    }, [products, search, selectedCategory, priceRange, stockFilter])

    // Pagination
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredProducts.slice(startIndex, endIndex)
    }, [filteredProducts, currentPage])

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

    useEffect(() => {
        setCurrentPage(1)
    }, [search, selectedCategory, priceRange, stockFilter])

    const load = async () => {
        setLoading(true)
        try {
            const [data, ws, cats] = await Promise.all([api.products.list(), api.warehouses.list(), api.categories.list()])
            setProducts(data)
            setWarehouses(ws)
            setCategories(cats)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    useEffect(() => {
        if (!barcodeModal.visible) return
        if (!barcodeModal.product?.barcode) return
        if (!barcodeSvgRef.current) return

        try {
            JsBarcode(barcodeSvgRef.current, barcodeModal.product.barcode, {
                format: 'CODE128',
                displayValue: true,
                lineColor: '#111827',
                background: '#ffffff',
                width: 2,
                height: 70,
                fontSize: 14,
                margin: 10,
                text: `${barcodeModal.product.name} - ${barcodeModal.product.barcode}`,
                textMargin: 5,
            })
        } catch (e: any) {
            toast.error(e?.message ?? 'No se pudo generar el código de barras')
        }
    }, [barcodeModal.visible, barcodeModal.product?.barcode, barcodeModal.product?.name])

    useEffect(() => {
        if (!viewModal.visible) return
        if (!viewModal.product?.barcode) return
        if (!viewBarcodeSvgRef.current) return

        try {
            JsBarcode(viewBarcodeSvgRef.current, viewModal.product.barcode, {
                format: 'CODE128',
                displayValue: true,
                lineColor: '#111827',
                background: '#ffffff',
                width: 2,
                height: 70,
                fontSize: 14,
                margin: 10,
                text: `${viewModal.product.name} - ${viewModal.product.barcode}`,
                textMargin: 5,
            })
        } catch (e: any) {
            toast.error(e?.message ?? 'No se pudo generar el código de barras')
        }
    }, [viewModal.visible, viewModal.product?.barcode, viewModal.product?.name])

    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) || 0 : value
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num)
    }

    const parseCurrencyInput = (value: string) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '')
        return digits
    }

    const resetForm = () => {
        setEditingId(null)
        setForm(emptyForm)
        setShowForm(false)
        setShowForm(false)
        setSelectedFiles([])
        if (showForm) setShowForm(false)
        setSelectedFiles([])
        setImagePreviews([])
        setImagesToDelete([])
    }

    const startCreate = () => {
        setEditingId(null)
        setForm((prev) => ({
            ...emptyForm,
            initialWarehouseId: prev.initialWarehouseId || warehouses[0]?.id || '',
        }))
        setShowForm(true)
    }

    const startEdit = (p: Product) => {
        setEditingId(p.id)
        setForm({
            name: p.name ?? '',
            description: p.description ?? '',
            sku: p.sku ?? '',
            imageUrl: p.imageUrl ?? '',
            images: p.images ?? (p.imageUrl ? [p.imageUrl] : []),
            costPrice: String(p.costPrice ?? '0'),
            salePrice: String(p.salePrice ?? '0'),
            isPublic: Boolean(p.isPublic),
            initialStock: '0',
            initialWarehouseId: warehouses[0]?.id || '',
            categoryId: p.categoryId ?? '',
        })
        setImagePreviews(p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []))
        setImagePreviews(p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []))
        setSelectedFiles([])
        setImagesToDelete([])
        setShowForm(true)
    }



    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)

            // Check limits
            const currentCount = imagePreviews.length
            const navailable = 3 - currentCount

            if (newFiles.length > navailable) {
                toast.error(`Solo puedes subir hasta 3 imágenes. Puedes añadir ${navailable} más.`)
                return
            }

            const validFiles = newFiles.slice(0, navailable)

            setSelectedFiles(prev => [...prev, ...validFiles])

            // Create previews
            const newPreviews = validFiles.map(file => URL.createObjectURL(file))
            setImagePreviews(prev => [...prev, ...newPreviews])

            // Clear input value so same files can be selected again if removed
            e.target.value = ''
        }
    }

    const removeImage = (index: number) => {
        // We need to keep track of which preview corresponds to which file
        // This is a simplified approach assuming appending order
        // Ideally we'd separate "existing URLs" from "new Files"

        let newPreviews = [...imagePreviews]
        const removedPreview = newPreviews[index]
        newPreviews.splice(index, 1)
        setImagePreviews(newPreviews)

        // If it was a blob URL, revoke it and remove from selectedFiles
        if (removedPreview.startsWith('blob:')) {
            // Find which file generated this blob
            // This is tricky without a map, but assuming order is maintained for "new" files is standard
            // Let's refine: filtering selectedFiles is hard without IDs.
            // Better approach: Separate state for existing vs new.

            // RETHINK: Let's split existing images and new files logic if possible, 
            // OR just rebuild previews from form.images + selectedFiles.

            // Current simple logic: Re-sync is complex.
            // Let's just filter selectedFiles if possible? 
            // Actually, `URL.createObjectURL` returns opaque string.

            // SIMPLIFICATION: Reconstruction
            // If we remove an image that is NOT a blob, update form.images
            // If we remove an image that IS a blob, remove from selectedFiles

            if (removedPreview.startsWith('blob:')) {
                // It's a new file. We need to find its index in selectedFiles
                // This is hard. Let's restart selectedFiles management to be index-based relative to previews?
                // Easier: Store everything in one state array: { type: 'url' | 'file', url: string, file?: File }
            }
        }
    }

    // Better state management for images
    // Instead of separate states, let's derive
    // But for now, let's just stick to the plan: 
    // We will just clear the specific item.

    // Correct Implementation for `removeImage`:
    // It's tricky to map preview index to file index mixed with urls.
    // Let's change state to:
    // [ { type: 'existing', url: '...' }, { type: 'new', file: File, preview: 'blob:...' } ]

    // Since I cannot change the state definition easily in one chunk without breaking others, 
    // I will use a refactored approach in the next steps. For now, let's implement a robust handler.

    const handleRemoveImage = (index: number) => {
        const previewToRemove = imagePreviews[index]

        // Remove from previews
        const newPreviews = [...imagePreviews]
        newPreviews.splice(index, 1)
        setImagePreviews(newPreviews)

        if (previewToRemove.startsWith('blob:')) {
            // It's a new file.
            // Find which file generated this blob. 
            // We assume new files are appended to the end of imagePreviews (after existing URLs)
            // But if we delete an existing one, the indices shift.
            // A safer way involves keeping a separate mapping or just filtering carefully.

            // Simplified logic assuming: existing urls first, then new files.
            // Count how many existing images remaining BEFORE this index
            const existingCount = newPreviews.filter(p => !p.startsWith('blob:')).length
            // Wait, we already removed it from newPreviews. So we count in newPreviews?
            // No, the index 'index' referred to the array BEFORE splicing.

            // Re-eval:
            // Original array: [url1, url2, blob1, blob2]
            // removing index 2 (blob1).
            // existing urls before index 2: 2.
            // so file index = 2 - 2 = 0.

            // Count existing images in original array (before removal)
            const existingInOriginal = imagePreviews.slice(0, index).filter(p => !p.startsWith('blob:')).length
            const fileIndex = index - existingInOriginal

            if (fileIndex >= 0) {
                const newFiles = [...selectedFiles]
                newFiles.splice(fileIndex, 1)
                setSelectedFiles(newFiles)
            }
        } else {
            // It's an existing image url
            setImagesToDelete(prev => [...prev, previewToRemove])

            // Update form state directly to reflect removal immediately in UI logic (e.g. validaciones)
            setForm(prev => ({
                ...prev,
                images: prev.images.filter(img => img !== previewToRemove),
                imageUrl: prev.images.filter(img => img !== previewToRemove)[0] || ''
            }))
        }
    }

    const uploadImage = async (file: File): Promise<string> => {
        // Compresión automática de imágenes
        const options = {
            maxSizeMB: 0.5,           // Límite 500KB
            maxWidthOrHeight: 1200,   // Full HD max
            useWebWorker: true,
            fileType: 'image/webp',
            initialQuality: 0.8,
        }

        let fileToUpload = file
        try {
            console.log(`🖼️ Original: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
            const compressed = await imageCompression(file, options)
            console.log(`✅ Comprimido: (${(compressed.size / 1024 / 1024).toFixed(2)} MB)`)
            fileToUpload = compressed
        } catch (error) {
            console.warn('⚠️ Falló la compresión, subiendo original:', error)
        }

        const supabase = createClient()
        const fileExt = fileToUpload.type === 'image/webp' ? 'webp' : file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, fileToUpload)

        if (uploadError) {
            throw new Error(`Error subiendo imagen: ${uploadError.message}`)
        }

        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath)

        return data.publicUrl
    }

    const deleteImagesFromStorage = async (urls: string[]) => {
        if (!urls.length) return
        const supabase = createClient()
        const paths = urls
            .filter(url => url.includes('supabase'))
            .map(url => {
                try {
                    const urlObj = new URL(url)
                    const parts = urlObj.pathname.split('/product-images/')
                    if (parts.length > 1) return parts[1]
                    return null
                } catch (e) { return null }
            })
            .filter(p => p !== null) as string[]

        if (paths.length === 0) return

        const { error } = await supabase.storage.from('product-images').remove(paths)
        if (error) console.error('Error deleting images:', error)
    }

    const submit = async () => {
        // Validaciones obligatorias
        if (!form.name.trim()) return toast.error('El nombre es obligatorio')
        if (!form.categoryId) return toast.error('La categoría es obligatoria')
        if (Number(form.costPrice) < 0) return toast.error('El precio de costo no es válido')
        if (Number(form.salePrice) < 0) return toast.error('El precio de venta no es válido')

        // Validar stock inicial si no es edición
        if (!editingId && form.initialStock !== '' && Number(form.initialStock) > 0 && !form.initialWarehouseId) {
            // Esto no debería pasar si autoseleccionamos, pero por seguridad
            return toast.error('Error interno: Almacén no seleccionado')
        }

        setSaving(true)
        setUploading(true)
        try {
            let finalImages = [...form.images]

            // Upload new files
            if (selectedFiles.length > 0) {
                try {
                    const uploadPromises = selectedFiles.map(file => uploadImage(file))
                    const uploadedUrls = await Promise.all(uploadPromises)
                    finalImages = [...finalImages, ...uploadedUrls]
                } catch (e: any) {
                    toast.error(e.message)
                    setSaving(false)
                    setUploading(false)
                    return
                }
            }
            // Limit to 3 just in case
            finalImages = finalImages.slice(0, 3)

            const basePayload = {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                sku: form.sku.trim() || undefined,
                imageUrl: finalImages[0] || undefined, // Maintain compatibility
                images: finalImages,
                costPrice: Number(form.costPrice),
                salePrice: Number(form.salePrice),
                isPublic: form.isPublic,
                categoryId: form.categoryId || undefined,
            }

            const initialStock = Number(form.initialStock)

            if (!editingId) {
                if (Number.isNaN(initialStock) || initialStock < 0 || !Number.isInteger(initialStock)) {
                    throw new Error('Stock inicial debe ser un entero mayor o igual a 0')
                }

                if (initialStock > 0 && !form.initialWarehouseId) {
                    throw new Error('Selecciona un almacén para el stock inicial')
                }
            }

            if (editingId) {
                await api.products.update(editingId, basePayload)
                toast.success('Producto actualizado')
            } else {
                await api.products.create({
                    ...basePayload,
                    initialStock: initialStock > 0 ? initialStock : 0,
                    initialWarehouseId: initialStock > 0 ? form.initialWarehouseId : undefined,
                })
                toast.success('Producto creado')
            }

            // Cleanup deleted images from storage
            if (imagesToDelete.length > 0) {
                await deleteImagesFromStorage(imagesToDelete)
            }

            resetForm()
            await load()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSaving(false)
            setUploading(false)
        }
    }

    const remove = async (id: string) => {
        const ok = window.confirm('¿Eliminar este producto?')
        if (!ok) return

        try {
            const productToDelete = products.find(p => p.id === id)
            await api.products.remove(id)

            // Delete images
            if (productToDelete) {
                const images = productToDelete.images && productToDelete.images.length > 0
                    ? productToDelete.images
                    : (productToDelete.imageUrl ? [productToDelete.imageUrl] : [])
                await deleteImagesFromStorage(images)
            }

            toast.success('Producto eliminado')
            if (editingId === id) resetForm()
            await load()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const downloadBarcode = (product: Product) => {
        if (!product.barcode) {
            toast.error('Este producto no tiene código de barras')
            return
        }

        try {
            const canvas = document.createElement('canvas')

            JsBarcode(canvas, product.barcode, {
                format: 'CODE128',
                displayValue: true,
                lineColor: '#111827',
                background: '#ffffff',
                width: 2,
                height: 80,
                fontSize: 16,
                margin: 14,
                text: `${product.name} - ${product.barcode}`,
                textMargin: 8,
            })

            canvas.toBlob((blob) => {
                if (!blob) return
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `barcode-${product.name}-${product.barcode}.png`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Código de barras descargado')
            })
        } catch (e: any) {
            toast.error(e?.message ?? 'No se pudo generar el código de barras')
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'var(--font-display)' }}>
                        Productos
                    </h2>
                    <p className="text-[hsl(var(--muted))] text-lg">
                        Gestiona tu catálogo y consulta el stock total en tiempo real.
                    </p>

                    {/* Indicador de Límite de Productos */}
                    <div className="mt-4 flex flex-col gap-1.5 max-w-xs">
                        <div className="flex justify-between items-end text-sm">
                            <span className="font-medium text-[hsl(var(--muted))]">Uso de Inventario</span>
                            <span className={cn(
                                "font-bold",
                                products.length >= 480 ? "text-red-500" :
                                    products.length >= 400 ? "text-orange-500" : "text-[rgb(25,35,25)]"
                            )}>
                                {products.length} / 500
                            </span>
                        </div>
                        <div className="h-2 w-full bg-[rgb(230,225,220)] rounded-full overflow-hidden shadow-inner">
                            <div
                                className={cn(
                                    "h-full transition-all duration-1000 ease-out rounded-full",
                                    products.length >= 480 ? "bg-red-500" :
                                        products.length >= 400 ? "bg-orange-500" : "bg-[rgb(180,100,50)]"
                                )}
                                style={{ width: `${Math.min((products.length / 500) * 100, 100)}%` }}
                            />
                        </div>
                        {products.length >= 450 && (
                            <p className="text-[10px] font-bold text-orange-600 animate-pulse">
                                ⚠️ Estás cerca del límite de tu plan
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center self-end">
                    <Button variant="outline" onClick={load} disabled={loading} className="group">
                        <span className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}>
                            {loading ? '⚙️' : '🔄'}
                        </span>
                        <span>{loading ? 'Actualizando...' : 'Refrescar'}</span>
                    </Button>
                    <Button onClick={startCreate} className="shadow-lg hover:shadow-xl transition-all">
                        <span className="mr-2">➕</span>
                        Crear Nuevo Producto
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[rgb(230,225,220)]">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2 lg:col-span-1 md:col-span-2">
                        <Label className="text-xs font-medium text-[hsl(var(--muted))]">Búsqueda</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <span className="text-lg">🔍</span>
                                </div>
                                <Input
                                    placeholder="Nombre, SKU o código..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-10"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn("lg:hidden h-10 w-10 transition-colors", showFilters && "bg-[rgb(25,35,25)] text-white hover:bg-[rgb(45,55,45)]")}
                            >
                                <span className="text-lg">⚙️</span>
                            </Button>
                        </div>
                    </div>

                    {/* Secondary Filters - Hidden on mobile unless showFilters is true */}
                    <div className={cn(
                        "grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:col-span-3",
                        !showFilters && "hidden lg:grid"
                    )}>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[rgb(120,115,110)]">Categoría</Label>
                            <select
                                className="flex h-10 w-full rounded-lg border border-[rgb(230,225,220)] bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ color: selectedCategory ? 'rgb(25,35,25)' : 'rgb(120,115,110)' }}
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[rgb(120,115,110)]">Rango de Precio</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Mín"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                    className="h-10"
                                />
                                <Input
                                    placeholder="Máx"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[rgb(120,115,110)]">Stock</Label>
                            <select
                                className="flex h-10 w-full rounded-lg border border-[rgb(230,225,220)] bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                            >
                                <option value="all">Todos</option>
                                <option value="inStock">Con stock</option>
                                <option value="outOfStock">Sin stock</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[rgb(230,225,220)]">
                    <div className="text-sm text-[rgb(120,115,110)] font-medium">
                        Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSearch('')
                            setSelectedCategory('')
                            setPriceRange({ min: '', max: '' })
                            setStockFilter('all')
                        }}
                        className="text-xs"
                    >
                        Limpiar Filtros
                    </Button>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                {paginatedProducts.map((p, index) => (
                    <div
                        key={p.id}
                        className="group relative rounded-xl border border-[rgb(230,225,220)] bg-white p-3 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {/* Product Image */}
                        <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-[rgb(250,248,245)] to-[rgb(240,235,230)] overflow-hidden mb-3 relative">
                            {p.imageUrl ? (
                                <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[hsl(var(--muted))]/30 text-6xl">
                                    📦
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <div className={cn(
                                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                                    p.isPublic ? "bg-emerald-500/20 text-emerald-700" : "bg-red-500/20 text-red-700"
                                )}>
                                    {p.isPublic ? 'Público' : 'Privado'}
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-1 flex-grow">
                            <h3 className="text-sm font-bold text-[rgb(25,35,25)] leading-tight group-hover:text-[rgb(180,100,50)] transition-colors line-clamp-2">
                                {p.name}
                            </h3>
                            <div className="flex items-center justify-between mt-1">
                                <div className="text-lg font-black text-[rgb(25,35,25)]">
                                    {formatCurrency(p.salePrice)}
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-bold text-[rgb(120,115,110)] uppercase tracking-tighter">Stock</span>
                                    <span className={cn(
                                        "text-xs font-bold",
                                        (p.totalStock ?? 0) > 0 ? "text-emerald-600" : "text-red-500"
                                    )}>
                                        {p.totalStock ?? 0}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-1 border-t border-[rgb(230,225,220)] mt-1">
                                <div className="text-[8px] uppercase font-bold text-[rgb(160,155,150)] flex justify-between">
                                    <span className="truncate max-w-[60%]">{p.barcode ?? 'N/A'}</span>
                                    {p.sku && <span className="truncate max-w-[40%]">{p.sku}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons Overlay */}
                        <div className="mt-2 grid grid-cols-2 gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] font-bold"
                                onClick={() => setViewModal({ product: p, visible: true })}
                            >
                                Ver
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] font-bold"
                                onClick={() => setBarcodeModal({ product: p, visible: true })}
                            >
                                Code
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 text-[10px] font-bold"
                                onClick={() => startEdit(p)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-[10px] font-bold"
                                onClick={() => remove(p.id)}
                            >
                                Del
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(120,115,110)]">
                        Página {currentPage} de {totalPages} ({filteredProducts.length} productos totales)
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            ← Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                )
                            })}
                            {totalPages > 5 && (
                                <>
                                    <span className="px-2 text-[rgb(120,115,110)]">...</span>
                                    <Button
                                        variant={currentPage === totalPages ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {totalPages}
                                    </Button>
                                </>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente →
                        </Button>
                    </div>
                </div>
            )}

            {/* Modals - Simplified for display, using existing logic but improved styling */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={resetForm} />
                    <Card className="w-full max-w-2xl relative z-10 animate-scale-in">
                        <CardHeader className="border-b border-[rgb(230,225,220)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                                        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                                    </CardTitle>
                                    <CardDescription>
                                        Completa la información detallada del producto.
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" onClick={resetForm} size="icon" className="rounded-full">✕</Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nombre del Producto</Label>
                                    <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Ej. Sofá Chesterfield de Cuero" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <select
                                        className="flex h-11 w-full rounded-lg border-2 border-[rgb(230,225,220)] bg-white/90 px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-300 focus:outline-none focus:border-[rgb(25,35,25)]"
                                        value={form.categoryId}
                                        onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
                                        style={{ color: form.categoryId ? 'rgb(25,35,25)' : 'rgb(120,115,110)' }}
                                    >
                                        <option value="">Sin categoría</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {!isEditing && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Stock Inicial</Label>
                                        <Input
                                            type="number"
                                            value={form.initialStock}
                                            onChange={(e) => setForm((s) => ({ ...s, initialStock: e.target.value }))}
                                            placeholder="0"
                                        />
                                        <p className="text-[10px] text-[hsl(var(--muted))]">
                                            Se añadirá a la Bodega Principal
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Descripción</Label>
                                    <Input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="Describe el material, dimensiones, etc." />
                                </div>

                                <div className="space-y-2">
                                    <Label>Precio Costo (Valor de adquisición)</Label>
                                    <Input
                                        type="text"
                                        value={formatCurrency(form.costPrice)}
                                        onChange={(e) => setForm((s) => ({ ...s, costPrice: parseCurrencyInput(e.target.value) }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Precio Venta (Precio al público)</Label>
                                    <Input
                                        type="text"
                                        value={formatCurrency(form.salePrice)}
                                        onChange={(e) => setForm((s) => ({ ...s, salePrice: parseCurrencyInput(e.target.value) }))}
                                    />
                                </div>

                                <div className="space-y-4 row-span-2">
                                    <Label>Imagen del Producto</Label>
                                    <div className="border-2 border-dashed border-[rgb(230,225,220)] rounded-xl p-4 flex flex-col items-center justify-center gap-4 bg-[rgb(250,248,245)] hover:bg-[rgb(245,240,235)] transition-colors relative overflow-hidden group min-h-[200px]">
                                        <div className="grid grid-cols-2 gap-2 w-full">
                                            {imagePreviews.map((preview, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[rgb(230,225,220)] shadow-sm group/img">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRemoveImage(idx)
                                                            }}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            {imagePreviews.length < 3 && (
                                                <div
                                                    className="aspect-square rounded-lg border-2 border-dashed border-[rgb(200,195,190)] flex flex-col items-center justify-center cursor-pointer hover:bg-[rgb(240,235,230)] transition-colors"
                                                    onClick={() => document.getElementById('image-upload')?.click()}
                                                >
                                                    <span className="text-2xl mb-1">➕</span>
                                                    <span className="text-xs text-[rgb(120,115,110)]">Añadir</span>
                                                </div>
                                            )}
                                        </div>

                                        {imagePreviews.length === 0 && (
                                            <div className="text-center p-2">
                                                <p className="text-sm font-medium text-[rgb(120,115,110)]">Añadir imágenes (Max 3)</p>
                                                <p className="text-xs text-[rgb(120,115,110)]/70">PNG, JPG, WEBP</p>
                                            </div>
                                        )}

                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>SKU Referencia</Label>
                                    <Input value={form.sku} onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} placeholder="Ex: MOD-SOF-001" />
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-[rgb(250,248,245)] rounded-xl border border-[rgb(230,225,220)] md:col-span-2">
                                    <input
                                        id="isPublic"
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-[rgb(25,35,25)] accent-[rgb(25,35,25)]"
                                        checked={form.isPublic}
                                        onChange={(e) => setForm((s) => ({ ...s, isPublic: e.target.checked }))}
                                    />
                                    <Label htmlFor="isPublic" className="font-bold cursor-pointer">
                                        Mostrar este producto en el catálogo digital
                                    </Label>
                                </div>
                            </div>
                        </CardContent>

                        <div className="p-6 border-t border-[rgb(230,225,220)] flex gap-3">
                            <Button onClick={submit} className="flex-1 h-12 text-lg shadow-xl" disabled={saving}>
                                {saving ? '⚙️ Guardando...' : isEditing ? 'Guardar Cambios' : 'Confirmar y Crear'}
                            </Button>
                            <Button variant="outline" onClick={resetForm} className="h-12" disabled={saving}>
                                Cancelar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Product View and Barcode Modals similarly improved... */}
            {viewModal.visible && viewModal.product && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={() => setViewModal({ product: null, visible: false })} />
                    <Card className="w-full max-w-2xl relative z-10 animate-scale-in max-h-[90vh] flex flex-col">
                        <CardHeader className="border-b border-[rgb(230,225,220)]">
                            <div className="flex items-center justify-between">
                                <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Detalles de Producto</CardTitle>
                                <Button variant="ghost" onClick={() => setViewModal({ product: null, visible: false })} size="icon">✕</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="aspect-square rounded-2xl overflow-hidden border border-[rgb(230,225,220)] shadow-inner flex items-center justify-center bg-[rgb(250,248,245)]">
                                    {viewModal.product.imageUrl ? (
                                        <img src={viewModal.product.imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-8xl">📦</span>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-bold text-[rgb(25,35,25)] leading-tight">{viewModal.product.name}</h3>
                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest">Información Económica</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-emerald-50 rounded-xl">
                                                <div className="text-[10px] text-emerald-600 font-bold uppercase">Precio Venta</div>
                                                <div className="text-xl font-black text-emerald-900">{formatCurrency(viewModal.product.salePrice)}</div>
                                            </div>
                                            <div className="p-3 bg-stone-50 rounded-xl">
                                                <div className="text-[10px] text-stone-500 font-bold uppercase">Costo</div>
                                                <div className="text-xl font-black text-stone-700">{formatCurrency(viewModal.product.costPrice)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest">Estado de Stock</div>
                                        <div className="p-4 bg-[rgb(25,35,25)] text-white rounded-xl flex items-center justify-between">
                                            <span className="text-lg">Unidades Totales</span>
                                            <span className="text-3xl font-black">{viewModal.product.totalStock ?? 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest">Código de Barras</div>
                                <div className="p-6 bg-white border-2 border-dashed border-[rgb(230,225,220)] rounded-2xl flex flex-col items-center gap-4">
                                    <svg ref={viewBarcodeSvgRef} className="max-w-full" />
                                    <div className="flex gap-3 w-full max-w-xs">
                                        <Button variant="outline" className="flex-1" onClick={() => downloadBarcode(viewModal.product!)}>Descargar PNG</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Minimal Barcode Modal */}
            {barcodeModal.visible && barcodeModal.product && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={() => setBarcodeModal({ product: null, visible: false })} />
                    <Card className="w-full max-w-sm relative z-10 animate-scale-in">
                        <CardHeader className="text-center relative">
                            <Button
                                variant="ghost"
                                onClick={() => setBarcodeModal({ product: null, visible: false })}
                                size="icon"
                                className="absolute right-2 top-2"
                            >
                                ✕
                            </Button>
                            <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Código de Barras</CardTitle>
                            <CardDescription>{barcodeModal.product.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6 pb-8">
                            <div className="p-4 bg-white border border-[rgb(230,225,220)] rounded-xl shadow-inner">
                                <svg ref={barcodeSvgRef} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <Button className="w-full shadow-lg" onClick={() => downloadBarcode(barcodeModal.product!)}>⬇️ Descargar</Button>
                                <Button variant="outline" onClick={() => {
                                    navigator.clipboard.writeText(barcodeModal.product!.barcode!);
                                    toast.success('Código copiado al portapapeles');
                                }}>📋 Copiar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
