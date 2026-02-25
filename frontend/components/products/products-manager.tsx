'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import JsBarcode from 'jsbarcode'
import imageCompression from 'browser-image-compression'
import { api, type Product, type Warehouse, type Category, type Combo } from '@/lib/backend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ImageSlider } from '@/components/ui/image-slider'
import Link from 'next/link'
import { Download, X } from 'lucide-react'

type FormState = {
    name: string
    description: string
    sku: string
    images: string[]
    costPrice: string
    salePrice: string
    isPublic: boolean
    isSellable: boolean
    initialStock: string
    categoryId: string
    visualVariants: Array<{
        name: string
        image: string
        isPublic: boolean
    }>
}

const emptyForm: FormState = {
    name: '',
    description: '',
    sku: '',
    images: [],
    costPrice: '0',
    salePrice: '0',
    isPublic: true,
    isSellable: true,
    initialStock: '0',
    categoryId: '',
    visualVariants: [],
}

type SectionType = 'PRODUCTS' | 'COMBOS'

type ComboFormItem = {
    productId: string
    quantity: number
}

type ComboFormState = {
    name: string
    description: string
    image: string
    discountAmount: string
    isActive: boolean
    isPublic: boolean
    items: ComboFormItem[]
}

const emptyComboForm: ComboFormState = {
    name: '',
    description: '',
    image: '',
    discountAmount: '0',
    isActive: true,
    isPublic: true,
    items: [{ productId: '', quantity: 1 }],
}

export function ProductsManager({
    readOnly = false,
    isAdminView = false,
    initialSection = 'PRODUCTS'
}: {
    readOnly?: boolean
    isAdminView?: boolean
    initialSection?: SectionType
}) {
    const [activeSection, setActiveSection] = useState<SectionType>(initialSection)
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
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
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
    const [variantImagesToDelete, setVariantImagesToDelete] = useState<string[]>([])
    const [variantUploadIndex, setVariantUploadIndex] = useState<number | null>(null)
    const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(-1)
    const [variantsExpanded, setVariantsExpanded] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [isCostFlipped, setIsCostFlipped] = useState(false)
    const [isStockFlipped, setIsStockFlipped] = useState(false)
    const [isComboCostFlipped, setIsComboCostFlipped] = useState(false)
    const [isComboStockFlipped, setIsComboStockFlipped] = useState(false)
    const [stockDetails, setStockDetails] = useState<any[]>([])
    const [loadingStock, setLoadingStock] = useState(false)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [combos, setCombos] = useState<Combo[]>([])
    const [comboProducts, setComboProducts] = useState<Product[]>([])
    const [loadingCombos, setLoadingCombos] = useState(false)
    const [savingCombo, setSavingCombo] = useState(false)
    const [showComboForm, setShowComboForm] = useState(false)
    const [editingComboId, setEditingComboId] = useState<string | null>(null)
    const [comboForm, setComboForm] = useState<ComboFormState>(emptyComboForm)
    const [comboImageFile, setComboImageFile] = useState<File | null>(null)
    const [comboImagePreview, setComboImagePreview] = useState('')
    const [comboImageToDelete, setComboImageToDelete] = useState<string | null>(null)
    const [comboStatusLoadingId, setComboStatusLoadingId] = useState<string | null>(null)
    const [comboViewModal, setComboViewModal] = useState<{ combo: Combo | null; visible: boolean }>({ combo: null, visible: false })
    const [comboCostProducts, setComboCostProducts] = useState<Record<string, Product>>({})
    const [loadingComboCosts, setLoadingComboCosts] = useState(false)
    const [comboSearch, setComboSearch] = useState('')
    const [comboShowFilters, setComboShowFilters] = useState(false)
    const [comboStatusFilter, setComboStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [comboVisibilityFilter, setComboVisibilityFilter] = useState<'all' | 'public' | 'private'>('all')
    const [comboPriceRange, setComboPriceRange] = useState({ min: '', max: '' })

    const isEditing = useMemo(() => Boolean(editingId), [editingId])
    const isEditingCombo = useMemo(() => Boolean(editingComboId), [editingComboId])



    const [debouncedSearch, setDebouncedSearch] = useState(search)
    const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedPriceRange(priceRange), 500)
        return () => clearTimeout(timer)
    }, [priceRange])

    const loadMeta = async () => {
        try {
            const [ws, cats] = await Promise.all([
                api.warehouses.list(),
                api.categories.list()
            ])
            setWarehouses(ws)
            setCategories(cats)
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const load = async (page = 1, refresh = false) => {
        setLoading(true)
        try {
            const response = await api.products.list({
                page,
                limit: itemsPerPage,
                search: debouncedSearch,
                categoryId: selectedCategory || undefined,
                minPrice: debouncedPriceRange.min ? parseFloat(debouncedPriceRange.min) : undefined,
                maxPrice: debouncedPriceRange.max ? parseFloat(debouncedPriceRange.max) : undefined,
                stockStatus: stockFilter !== 'all' ? stockFilter : undefined,
                refresh
            })
            const productsData = Array.isArray(response) ? response : (response?.data || [])
            setProducts(productsData)
            setTotalItems(Array.isArray(response) ? response.length : (response.total || 0))
            setTotalPages(Array.isArray(response) ? 1 : (response.totalPages || 1))
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const loadCombos = async () => {
        if (readOnly) return
        setLoadingCombos(true)
        try {
            const [comboData, productsResponse] = await Promise.all([
                api.combos.list({ includeInactive: true }),
                api.products.list({ limit: 1000, sellableOnly: true }),
            ])
            const availableProducts = Array.isArray(productsResponse) ? productsResponse : (productsResponse?.data || [])
            setCombos(comboData || [])
            setComboProducts(availableProducts)
        } catch (e: any) {
            toast.error(e.message || 'No se pudieron cargar los combos')
        } finally {
            setLoadingCombos(false)
        }
    }

    const comboProductMap = useMemo(
        () => new Map(comboProducts.map((product) => [product.id, product] as [string, Product])),
        [comboProducts]
    )

    const comboBasePrice = useMemo(() => {
        return comboForm.items.reduce((acc, item) => {
            const product = comboProductMap.get(item.productId)
            return acc + (Number(product?.salePrice || 0) * Number(item.quantity || 0))
        }, 0)
    }, [comboForm.items, comboProductMap])

    const comboDiscountValue = useMemo(() => {
        const raw = Number(comboForm.discountAmount || 0)
        if (Number.isNaN(raw)) return 0
        return Math.max(0, raw)
    }, [comboForm.discountAmount])

    const comboFinalPrice = useMemo(
        () => Math.max(0, comboBasePrice - comboDiscountValue),
        [comboBasePrice, comboDiscountValue]
    )

    const comboSelectedImages = useMemo(() => {
        return comboForm.items
            .map((item) => comboProductMap.get(item.productId)?.images?.[0] || '')
            .filter(Boolean)
    }, [comboForm.items, comboProductMap])

    const productVisualPreviewImages = useMemo(() => {
        const variantImages = (form.visualVariants || [])
            .map(v => (v.image || '').trim())
            .filter(Boolean)
        return [...variantImages].filter((img, index, arr) => arr.indexOf(img) === index)
    }, [form.visualVariants])

    const getComboItemUnitCost = (item: Combo['items'][number]) => {
        const detailCost = Number(comboCostProducts[item.productId]?.costPrice ?? NaN)
        if (!Number.isNaN(detailCost) && detailCost > 0) return detailCost
        const directCost = Number((item as any).productCostPrice ?? NaN)
        if (!Number.isNaN(directCost) && directCost > 0) return directCost
        const fallbackCost = Number(comboProductMap.get(item.productId)?.costPrice || 0)
        return Number.isNaN(fallbackCost) ? 0 : fallbackCost
    }

    const filteredCombos = useMemo(() => {
        const q = comboSearch.trim().toLowerCase()
        const min = comboPriceRange.min ? Number(comboPriceRange.min) : null
        const max = comboPriceRange.max ? Number(comboPriceRange.max) : null

        return combos.filter((combo) => {
            const matchesSearch = !q
                || combo.name.toLowerCase().includes(q)
                || (combo.description || '').toLowerCase().includes(q)

            const matchesStatus = comboStatusFilter === 'all'
                || (comboStatusFilter === 'active' ? combo.isActive : !combo.isActive)

            const matchesVisibility = comboVisibilityFilter === 'all'
                || (comboVisibilityFilter === 'public' ? combo.isPublic : !combo.isPublic)

            const finalPrice = Number(combo.finalUnitPrice || 0)
            const matchesMin = min === null || finalPrice >= min
            const matchesMax = max === null || finalPrice <= max

            return matchesSearch && matchesStatus && matchesVisibility && matchesMin && matchesMax
        })
    }, [combos, comboSearch, comboStatusFilter, comboVisibilityFilter, comboPriceRange])

    useEffect(() => {
        loadMeta()
    }, [])

    useEffect(() => {
        if (readOnly) return
        loadCombos()
    }, [readOnly])

    useEffect(() => {
        load(1)
        setCurrentPage(1)
    }, [debouncedSearch, selectedCategory, debouncedPriceRange, stockFilter])

    useEffect(() => {
        load(currentPage)
    }, [currentPage])

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

    // ... All helper functions (submit, delete, images, etc) kept same as original ...
    // Note: I'm including the full logic here so it works for Admin. 
    // For ReadOnly mode, UI controls will be hidden.

    const parseCurrencyInput = (value: string) => {
        const digits = value.replace(/\D/g, '')
        return digits
    }

    const handleViewProduct = async (p: Product) => {
        setIsCostFlipped(false)
        setIsStockFlipped(false)
        setStockDetails([])
        setLoadingStock(true)
        // Mostramos lo que tenemos de inmediato
        setViewModal({ product: p, visible: true })

        // Cargamos el detalle completo y el stock por bodega
        try {
            const [detail, stock] = await Promise.all([
                api.products.get(p.id, true),
                api.inventory.stock({ productId: p.id })
            ])
            setViewModal({ product: detail, visible: true })
            setStockDetails(stock)
        } catch (e) {
            console.error('Error fetching product detail or stock:', e)
        } finally {
            setLoadingStock(false)
        }
    }

    const closeViewModal = () => {
        setIsCostFlipped(false)
        setIsStockFlipped(false)
        setViewModal({ product: null, visible: false })
    }

    const resetForm = () => {
        setEditingId(null)
        setForm(emptyForm)
        setShowForm(false)
        setSelectedFiles([])
        setImagePreviews([])
        setImagesToDelete([])
        setVariantImagesToDelete([])
        setSelectedVariantIndex(-1)
        setVariantsExpanded(false)
    }

    const startCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setShowForm(true)
    }

    const startEdit = (p: Product) => {
        setEditingId(p.id)
        setForm({
            name: p.name,
            description: p.description || '',
            sku: p.sku || '',
            images: p.images || [],
            costPrice: p.costPrice.toString(),
            salePrice: p.salePrice.toString(),
            isPublic: p.isPublic,
            isSellable: p.isSellable,
            initialStock: '0',
            categoryId: p.categoryId || '',
            visualVariants: (p.visualVariants || []).map(v => ({
                name: v.name || '',
                image: v.image || '',
                isPublic: v.isPublic ?? true,
            })),
        })
        setImagePreviews(p.images || [])
        setSelectedFiles([])
        setImagesToDelete([])
        setVariantImagesToDelete([])
        setSelectedVariantIndex((p.visualVariants || []).length > 0 ? 0 : -1)
        setVariantsExpanded(false)
        setShowForm(true)
    }

    const resetComboForm = () => {
        if (comboImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(comboImagePreview)
        }
        setEditingComboId(null)
        setComboForm(emptyComboForm)
        setComboImageFile(null)
        setComboImagePreview('')
        setComboImageToDelete(null)
        setShowComboForm(false)
    }

    const startCreateCombo = () => {
        setActiveSection('COMBOS')
        resetComboForm()
        setShowComboForm(true)
    }

    const startEditCombo = (combo: Combo) => {
        if (comboImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(comboImagePreview)
        }

        const discount = Math.max(0, Number(combo.baseUnitPrice || 0) - Number(combo.finalUnitPrice || 0))
        setEditingComboId(combo.id)
        setComboForm({
            name: combo.name,
            description: combo.description || '',
            image: combo.image || '',
            discountAmount: String(discount),
            isActive: combo.isActive,
            isPublic: combo.isPublic,
            items: combo.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
        })
        setComboImageFile(null)
        setComboImagePreview(combo.image || '')
        setComboImageToDelete(null)
        setShowComboForm(true)
    }

    const addComboItemRow = () => {
        setComboForm((prev) => ({
            ...prev,
            items: [...prev.items, { productId: '', quantity: 1 }],
        }))
    }

    const updateComboItemRow = (index: number, patch: Partial<ComboFormItem>) => {
        setComboForm((prev) => ({
            ...prev,
            items: prev.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
        }))
    }

    const removeComboItemRow = (index: number) => {
        setComboForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, itemIndex) => itemIndex !== index),
        }))
    }

    const handleComboImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (comboImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(comboImagePreview)
        }

        if (comboForm.image) {
            setComboImageToDelete(comboForm.image)
        }

        setComboImageFile(file)
        setComboImagePreview(URL.createObjectURL(file))
        setComboForm((prev) => ({ ...prev, image: '' }))
        e.target.value = ''
    }

    const clearComboImage = () => {
        if (comboImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(comboImagePreview)
        }
        if (comboForm.image) {
            setComboImageToDelete(comboForm.image)
        }
        setComboImageFile(null)
        setComboImagePreview('')
        setComboForm((prev) => ({ ...prev, image: '' }))
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            const currentCount = imagePreviews.length
            const navailable = 3 - currentCount
            if (newFiles.length > navailable) {
                toast.error(`Solo puedes subir hasta 3 imágenes.`)
                return
            }
            const validFiles = newFiles.slice(0, navailable)
            setSelectedFiles(prev => [...prev, ...validFiles])
            const newPreviews = validFiles.map(file => URL.createObjectURL(file))
            setImagePreviews(prev => [...prev, ...newPreviews])
            e.target.value = ''
        }
    }

    const addVisualVariantRow = () => {
        setForm(prev => ({
            ...prev,
            visualVariants: [...prev.visualVariants, { name: '', image: '', isPublic: true }]
        }))
        setSelectedVariantIndex(form.visualVariants.length)
    }

    const updateVisualVariantRow = (index: number, patch: Partial<{ name: string; image: string; isPublic: boolean }>) => {
        setForm(prev => ({
            ...prev,
            visualVariants: prev.visualVariants.map((row, i) => i === index ? { ...row, ...patch } : row)
        }))
    }

    const removeVisualVariantRow = (index: number) => {
        const variant = form.visualVariants[index]
        if (variant?.image) {
            setVariantImagesToDelete(prev => [...prev, variant.image])
        }
        setForm(prev => ({
            ...prev,
            visualVariants: prev.visualVariants.filter((_, i) => i !== index)
        }))
        setSelectedVariantIndex(prev => {
            if (form.visualVariants.length <= 1) return -1
            if (prev > index) return prev - 1
            if (prev === index) return Math.max(0, prev - 1)
            return prev
        })
    }

    const triggerVariantImageUpload = (index: number) => {
        setVariantUploadIndex(index)
        document.getElementById('variant-image-upload')?.click()
    }

    const handleVariantImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        const index = variantUploadIndex
        e.target.value = ''
        if (!file || index === null) return

        try {
            setUploading(true)
            const imageUrl = await uploadImage(file)
            const previousImage = form.visualVariants[index]?.image
            if (previousImage) {
                setVariantImagesToDelete(prev => [...prev, previousImage])
            }
            updateVisualVariantRow(index, { image: imageUrl })
            toast.success('Imagen de variante cargada')
        } catch (error: any) {
            toast.error(error?.message || 'No se pudo subir la imagen de variante')
        } finally {
            setUploading(false)
            setVariantUploadIndex(null)
        }
    }

    const handleRemoveImage = (index: number) => {
        const previewToRemove = imagePreviews[index]
        const newPreviews = [...imagePreviews]
        newPreviews.splice(index, 1)
        setImagePreviews(newPreviews)

        if (previewToRemove.startsWith('blob:')) {
            // Find which file in selectedFiles this corresponds to
            // It's the Nth blob preview in the current imagePreviews
            let blobCount = 0
            let fileIndex = -1
            for (let i = 0; i <= index; i++) {
                if (imagePreviews[i].startsWith('blob:')) {
                    if (i === index) {
                        fileIndex = blobCount
                        break
                    }
                    blobCount++
                }
            }
            if (fileIndex !== -1) {
                const newFiles = [...selectedFiles]
                newFiles.splice(fileIndex, 1)
                setSelectedFiles(newFiles)
                URL.revokeObjectURL(previewToRemove)
            }
        } else {
            setImagesToDelete(prev => [...prev, previewToRemove])
            setForm(prev => ({
                ...prev,
                images: prev.images.filter(img => img !== previewToRemove)
            }))
        }
    }

    const uploadImage = async (file: File): Promise<string> => {
        const supabase = createClient()
        let fileToUpload = file
        const shouldCompress = file.size > 1.5 * 1024 * 1024

        if (shouldCompress) {
            const options = {
                maxSizeMB: 1.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/webp',
                initialQuality: 0.9,
            }

            try {
                fileToUpload = await imageCompression(file, options)
            } catch (error) {
                console.warn('Compression failed, using original')
                fileToUpload = file
            }
        }

        const fileExt = fileToUpload.type === 'image/webp' ? 'webp' : file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, fileToUpload)

        if (uploadError) throw new Error(`Error uploading image: ${uploadError.message}`)

        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
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
                    return parts.length > 1 ? parts[1] : null
                } catch (e) { return null }
            })
            .filter(p => p !== null) as string[]

        if (paths.length > 0) {
            await supabase.storage.from('product-images').remove(paths)
        }
    }

    const submit = async () => {
        if (!form.name.trim()) return toast.error('El nombre es obligatorio')
        if (!form.categoryId) return toast.error('La categoría es obligatoria')

        const cost = Number(form.costPrice)
        const sale = Number(form.salePrice)

        if (isNaN(cost) || cost <= 0) return toast.error('El precio de costo debe ser superior a 0')
        if (isNaN(sale) || sale <= 0) return toast.error('El precio de venta debe ser superior a 0')
        if (sale <= cost) return toast.error('El precio de venta debe ser mayor al costo')

        setSaving(true)
        setUploading(true)
        try {
            let finalImages = [...form.images]
            if (selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(file => uploadImage(file))
                const uploadedUrls = await Promise.all(uploadPromises)
                finalImages = [...finalImages, ...uploadedUrls]
            }
            finalImages = finalImages.slice(0, 3)

            const basePayload = {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                sku: form.sku.trim() || undefined,
                images: finalImages,
                costPrice: Number(form.costPrice),
                salePrice: Number(form.salePrice),
                isPublic: form.isPublic,
                isSellable: form.isSellable,
                categoryId: form.categoryId || undefined,
                visualVariants: form.visualVariants
                    .map((v, index) => ({
                        name: v.name.trim(),
                        image: v.image.trim(),
                        sortOrder: index,
                        isPublic: v.isPublic,
                    }))
                    .filter(v => v.name.length > 0 && v.image.length > 0),
            }

            const initialStock = Number(form.initialStock)

            if (editingId) {
                await api.products.update(editingId, basePayload)
                toast.success('Producto actualizado')
            } else {
                await api.products.create({
                    ...basePayload,
                    initialStock: initialStock > 0 ? initialStock : 0,
                })
                toast.success('Producto creado')
            }

            const allImagesToDelete = [...imagesToDelete, ...variantImagesToDelete]
            if (allImagesToDelete.length > 0) {
                await deleteImagesFromStorage(allImagesToDelete)
            }

            resetForm()
            await load(1, true)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSaving(false)
            setUploading(false)
        }
    }

    const submitCombo = async () => {
        const normalizedItems = comboForm.items
            .map((item) => ({
                productId: item.productId,
                quantity: Math.max(0, Math.floor(Number(item.quantity || 0))),
            }))
            .filter((item) => item.productId && item.quantity > 0)

        if (!comboForm.name.trim()) {
            toast.error('El nombre del combo es obligatorio')
            return
        }

        if (normalizedItems.length === 0) {
            toast.error('Debes agregar al menos un producto al combo')
            return
        }

        if (comboBasePrice <= 0) {
            toast.error('El combo debe tener un precio base mayor a 0')
            return
        }

        if (comboDiscountValue >= comboBasePrice) {
            toast.error('La rebaja no puede ser igual o mayor al precio base del combo')
            return
        }

        if (comboFinalPrice <= 0) {
            toast.error('El precio final del combo debe ser mayor a 0')
            return
        }

        setSavingCombo(true)
        try {
            let comboImage = comboForm.image.trim() || undefined
            if (comboImageFile) {
                comboImage = await uploadImage(comboImageFile)
            }

            const payload = {
                name: comboForm.name.trim(),
                description: comboForm.description.trim() || undefined,
                image: comboImage,
                pricingType: 'FIXED' as const,
                fixedPrice: Number(comboFinalPrice.toFixed(2)),
                isActive: comboForm.isActive,
                isPublic: comboForm.isPublic,
                items: normalizedItems,
            }

            if (editingComboId) {
                await api.combos.update(editingComboId, payload)
                toast.success('Combo actualizado')
            } else {
                await api.combos.create(payload)
                toast.success('Combo creado')
            }

            if (comboImageToDelete) {
                await deleteImagesFromStorage([comboImageToDelete])
            }

            resetComboForm()
            await loadCombos()
        } catch (e: any) {
            toast.error(e.message || 'No se pudo guardar el combo')
        } finally {
            setSavingCombo(false)
        }
    }

    const deactivateCombo = async (comboId: string) => {
        if (!window.confirm('¿Seguro que deseas desactivar este combo?')) return
        setComboStatusLoadingId(comboId)
        try {
            await api.combos.remove(comboId)
            toast.success('Combo desactivado')
            await loadCombos()
        } catch (e: any) {
            toast.error(e.message || 'No se pudo desactivar el combo')
        } finally {
            setComboStatusLoadingId(null)
        }
    }

    const reactivateCombo = async (comboId: string) => {
        setComboStatusLoadingId(comboId)
        try {
            await api.combos.update(comboId, { isActive: true })
            toast.success('Combo reactivado')
            await loadCombos()
        } catch (e: any) {
            toast.error(e.message || 'No se pudo reactivar el combo')
        } finally {
            setComboStatusLoadingId(null)
        }
    }

    const openComboView = async (combo: Combo) => {
        setComboViewModal({ combo, visible: true })
        setIsComboCostFlipped(false)
        setIsComboStockFlipped(false)
        setLoadingComboCosts(true)
        try {
            const ids = Array.from(new Set(combo.items.map((item) => item.productId)))
            const details = await Promise.all(
                ids.map(async (id) => {
                    try {
                        const detail = await api.products.get(id, true)
                        return [id, detail] as const
                    } catch {
                        return null
                    }
                })
            )
            const map: Record<string, Product> = {}
            details.forEach((entry) => {
                if (!entry) return
                map[entry[0]] = entry[1]
            })
            setComboCostProducts(map)
        } finally {
            setLoadingComboCosts(false)
        }
    }
    const closeComboView = () => {
        setComboViewModal({ combo: null, visible: false })
        setComboCostProducts({})
        setLoadingComboCosts(false)
        setIsComboCostFlipped(false)
        setIsComboStockFlipped(false)
    }

    const remove = (id: string) => setItemToDelete(id)

    const toggleSellable = async (p: Product) => {
        if (togglingId) return
        setTogglingId(p.id)
        try {
            await api.products.update(p.id, { isSellable: !p.isSellable })
            toast.success(p.isSellable ? 'Producto pausado para venta' : 'Producto habilitado para venta')
            await load(currentPage, true)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setTogglingId(null)
        }
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        const id = itemToDelete
        try {
            const productToDelete = products.find(p => p.id === id)
            await api.products.remove(id)
            toast.success('Producto eliminado')
            await load(currentPage, true)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setItemToDelete(null)
        }
    }

    const downloadBarcode = (product: Product) => {
        if (!product.barcode) return toast.error('No tiene código de barras')
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
            })
        } catch (e: any) {
            toast.error('Error generando código')
        }
    }



    const downloadProductImages = async (product: Product) => {
        const images = product.images && product.images.length > 0 ? product.images : []

        if (images.length === 0) return toast.error('No hay imágenes para descargar')

        try {
            toast.promise(
                Promise.all(images.map(async (url, idx) => {
                    const response = await fetch(url)
                    const blob = await response.blob()
                    const blobUrl = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = blobUrl
                    link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-${idx + 1}.jpg` // Default extension, browser handles content-type usually
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(blobUrl)
                })),
                {
                    loading: 'Preparando descarga...',
                    success: 'Imágenes descargadas',
                    error: 'Error al descargar imágenes'
                }
            )
        } catch (e) {
            console.error(e)
            toast.error('Error al descargar imágenes')
        }
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                        Productos
                    </h2>
                    <p className="text-gray-500 text-sm md:text-lg">
                        {readOnly
                            ? "Consulta el catálogo y stock disponible."
                            : activeSection === 'PRODUCTS'
                                ? "Gestiona tu catálogo y consulta el stock total en tiempo real."
                                : "Arma combos desde productos individuales y define la rebaja final."}
                    </p>

                    {!readOnly && (
                        <div className="mt-4 flex flex-col gap-1.5 max-w-xs">
                            <div className="flex justify-between items-end text-sm">
                                <span className="font-medium text-gray-500">
                                    {activeSection === 'PRODUCTS' ? 'Uso de Inventario' : 'Combos creados'}
                                </span>
                                <span className={cn(
                                    "font-bold",
                                    activeSection === 'COMBOS'
                                        ? "text-[rgb(25,35,25)]"
                                        : products.length >= 480 ? "text-red-500" :
                                            products.length >= 400 ? "text-orange-500" : "text-[rgb(25,35,25)]"
                                )}>
                                    {activeSection === 'PRODUCTS' ? `${products.length} / 500` : `${combos.length} activos/inactivos`}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-[rgb(230,225,220)] rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000 ease-out rounded-full",
                                        activeSection === 'COMBOS'
                                            ? "bg-[rgb(180,100,50)]"
                                            : products.length >= 480 ? "bg-red-500" :
                                                products.length >= 400 ? "bg-orange-500" : "bg-[rgb(180,100,50)]"
                                    )}
                                    style={{
                                        width: activeSection === 'PRODUCTS'
                                            ? `${Math.min((products.length / 500) * 100, 100)}%`
                                            : `${Math.min(combos.length * 8, 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center self-end">
                    {!readOnly && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant={activeSection === 'PRODUCTS' ? 'default' : 'outline'}
                                className="w-full sm:w-auto"
                                onClick={() => setActiveSection('PRODUCTS')}
                            >
                                Productos
                            </Button>
                            <Button
                                variant={activeSection === 'COMBOS' ? 'default' : 'outline'}
                                className="w-full sm:w-auto"
                                onClick={() => {
                                    setActiveSection('COMBOS')
                                    if (!combos.length && !loadingCombos) {
                                        void loadCombos()
                                    }
                                }}
                            >
                                Combos
                            </Button>
                        </div>
                    )}
                    {isAdminView && (
                        <Link href={isAdminView ? '/dashboard/print-barcodes' : '/print-barcodes'} className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                className="group w-full"
                            >
                                <span className="mr-2">️</span>
                                Imprimir Códigos
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => activeSection === 'PRODUCTS' ? load(currentPage, true) : loadCombos()}
                        disabled={activeSection === 'PRODUCTS' ? loading : loadingCombos}
                        className="group w-full sm:w-auto"
                    >
                        <span className={(activeSection === 'PRODUCTS' ? loading : loadingCombos) ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}>
                            {(activeSection === 'PRODUCTS' ? loading : loadingCombos) ? '️' : ''}
                        </span>
                        <span>{(activeSection === 'PRODUCTS' ? loading : loadingCombos) ? 'Actualizando...' : 'Refrescar'}</span>
                    </Button>
                    {!readOnly && (
                        <Button
                            onClick={activeSection === 'PRODUCTS' ? startCreate : startCreateCombo}
                            className="shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                        >
                            <span className="mr-2"></span>
                            {activeSection === 'PRODUCTS' ? 'Crear Nuevo Producto' : 'Crear Nuevo Combo'}
                        </Button>
                    )}
                </div>
            </div>

            {activeSection === 'PRODUCTS' ? (
                <>
                    {/* Filter Section - Same for both modes */}
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[rgb(230,225,220)]">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2 lg:col-span-1 md:col-span-2">
                                <Label className="text-xs font-medium text-gray-500">Búsqueda</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <span className="text-lg"></span>
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
                                        className={cn("lg:hidden h-10 w-10 transition-colors", showFilters && "bg-primary text-primary-foreground")}
                                    >
                                        <span className="text-lg">️</span>
                                    </Button>
                                </div>
                            </div>

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
                                    >
                                        <option value="">Todas</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-[rgb(120,115,110)]">Rango de Precio</Label>
                                    <div className="flex gap-2">
                                        <Input placeholder="Mín" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} className="h-10" />
                                        <Input placeholder="Máx" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} className="h-10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-[rgb(120,115,110)]">Stock</Label>
                                    <select className="flex h-10 w-full rounded-lg border border-[rgb(230,225,220)] bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                                        <option value="all">Todos</option>
                                        <option value="inStock">Con stock</option>
                                        <option value="outOfStock">Sin stock</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                        {products.map((p, index) => (
                            <div
                                key={p.id}
                                className="group relative rounded-xl border border-[rgb(230,225,220)] bg-white p-3 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full animate-fade-in cursor-pointer"
                                style={{ animationDelay: `${index * 0.05}s` }}
                                onClick={() => handleViewProduct(p)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        void handleViewProduct(p)
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                {/* Product Image */}
                                <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-[rgb(250,248,245)] to-[rgb(240,235,230)] overflow-hidden mb-3 relative group/slider">
                                    <ImageSlider
                                        images={[
                                            ...(p.images && p.images.length > 0 ? p.images : []),
                                            ...((p.visualVariants || []).map(v => v.image).filter(Boolean))
                                        ].filter((img, idx, arr) => arr.indexOf(img) === idx)}
                                        name={p.name}
                                        interval={3000 + (index * 500)} // Staggered animations
                                        className="h-full w-full"
                                        imageClassName="group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <div className={cn(
                                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                                            p.isPublic ? "bg-emerald-500/20 text-emerald-700" : "bg-red-500/20 text-red-700"
                                        )}>
                                            {p.isPublic ? 'Público' : 'Privado'}
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <div className={cn(
                                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                                            p.isSellable ? "bg-blue-500/20 text-blue-700" : "bg-amber-500/20 text-amber-800"
                                        )}>
                                            {p.isSellable ? 'Vendible' : 'Pausado'}
                                        </div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="space-y-1 flex-grow">
                                    <h3 className="text-sm font-bold text-[rgb(25,35,25)] leading-tight group-hover:text-[rgb(180,100,50)] transition-colors line-clamp-2">
                                        {p.name}
                                    </h3>
                                    <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
                                        <div className="text-lg font-black text-[rgb(25,35,25)] leading-none">
                                            {formatCurrency(p.salePrice)}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-stone-50/50 px-1.5 py-0.5 rounded border border-stone-200/50">
                                            <span className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter">Stock</span>
                                            <span className={cn(
                                                "text-[11px] font-bold",
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
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            void handleViewProduct(p)
                                        }}
                                        disabled={loading}
                                    >
                                        Ver
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] font-bold"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setBarcodeModal({ product: p, visible: true })
                                        }}
                                        disabled={loading}
                                    >
                                        Code
                                    </Button>
                                    {!readOnly && (
                                        <>
                                            <Button
                                                variant={p.isSellable ? "outline" : "secondary"}
                                                size="sm"
                                                className="h-7 text-[10px] font-bold flex items-center justify-center gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    void toggleSellable(p)
                                                }}
                                                disabled={loading || !!togglingId}
                                            >
                                                {togglingId === p.id && <span className="animate-spin text-[8px]">️</span>}
                                                {togglingId === p.id
                                                    ? (p.isSellable ? 'Pausando' : 'Vender...')
                                                    : (p.isSellable ? 'Pausar' : 'Vender')}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-7 text-[10px] font-bold"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    startEdit(p)
                                                }}
                                                disabled={loading}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-7 text-[10px] font-bold col-span-2"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    void remove(p.id)
                                                }}
                                                disabled={loading}
                                            >
                                                Eliminar
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>Anterior</Button>
                            <span className="flex items-center px-4 font-medium text-sm">Página {currentPage} de {totalPages}</span>
                            <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading}>Siguiente</Button>
                        </div>
                    )}
                    {loading && products.length > 0 && (
                        <div className="flex justify-center">
                            <span className="text-xs font-medium text-gray-500">Actualizando productos...</span>
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-5">
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[rgb(230,225,220)]">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2 lg:col-span-1 md:col-span-2">
                                <Label className="text-xs font-medium text-gray-500">Busqueda</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <span className="text-lg"></span>
                                        </div>
                                        <Input
                                            placeholder="Nombre o descripcion..."
                                            value={comboSearch}
                                            onChange={(e) => setComboSearch(e.target.value)}
                                            className="pl-10 h-10"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setComboShowFilters(!comboShowFilters)}
                                        className={cn("lg:hidden h-10 w-10 transition-colors", comboShowFilters && "bg-primary text-primary-foreground")}
                                    >
                                        <span className="text-lg">️</span>
                                    </Button>
                                </div>
                            </div>

                            <div className={cn(
                                "grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:col-span-3",
                                !comboShowFilters && "hidden lg:grid"
                            )}>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-[rgb(120,115,110)]">Estado</Label>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-[rgb(230,225,220)] bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                        value={comboStatusFilter}
                                        onChange={(e) => setComboStatusFilter(e.target.value as any)}
                                    >
                                        <option value="all">Todos</option>
                                        <option value="active">Activos</option>
                                        <option value="inactive">Inactivos</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-[rgb(120,115,110)]">Visibilidad</Label>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-[rgb(230,225,220)] bg-white/90 px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                        value={comboVisibilityFilter}
                                        onChange={(e) => setComboVisibilityFilter(e.target.value as any)}
                                    >
                                        <option value="all">Todos</option>
                                        <option value="public">Publico catalogo</option>
                                        <option value="private">Solo interno</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-[rgb(120,115,110)]">Rango de Precio</Label>
                                    <div className="flex gap-2">
                                        <Input placeholder="Min" value={comboPriceRange.min} onChange={(e) => setComboPriceRange(prev => ({ ...prev, min: e.target.value }))} className="h-10" />
                                        <Input placeholder="Max" value={comboPriceRange.max} onChange={(e) => setComboPriceRange(prev => ({ ...prev, max: e.target.value }))} className="h-10" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                        {filteredCombos.map((combo) => {
                            const componentImages = combo.items
                                .map((item) => item.productImage)
                                .filter((img): img is string => Boolean(img))
                            const previewImages = [...componentImages, combo.image || ''].filter(Boolean).slice(0, 5)

                            return (
                                <div
                                    key={combo.id}
                                    className={cn(
                                        "group relative rounded-xl border border-[rgb(230,225,220)] bg-white p-3 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full animate-fade-in",
                                        !combo.isActive && "opacity-60 grayscale"
                                    )}
                                >
                                    <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-[rgb(250,248,245)] to-[rgb(240,235,230)] overflow-hidden mb-3 relative group/slider">
                                        <ImageSlider
                                            images={previewImages.length > 0 ? previewImages : []}
                                            name={combo.name}
                                            interval={3200}
                                            className="h-full w-full"
                                            imageClassName="group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <div className={cn(
                                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                                                combo.isPublic ? "bg-emerald-500/20 text-emerald-700" : "bg-red-500/20 text-red-700"
                                            )}>
                                                {combo.isPublic ? 'Publico' : 'Interno'}
                                            </div>
                                        </div>
                                        <div className="absolute top-2 left-2">
                                            <div className={cn(
                                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                                                combo.isActive ? "bg-blue-500/20 text-blue-700" : "bg-amber-500/20 text-amber-800"
                                            )}>
                                                {combo.isActive ? 'Activo' : 'Inactivo'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 flex-grow">
                                        <h3 className="text-sm font-bold text-[rgb(25,35,25)] leading-tight group-hover:text-[rgb(180,100,50)] transition-colors line-clamp-2">
                                            {combo.name}
                                        </h3>
                                        <div className="text-[11px] text-[rgb(120,115,110)] line-clamp-2">
                                            {combo.description || 'Combo sin descripcion'}
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex flex-col">
                                                <div className="text-xl font-black text-[rgb(25,35,25)] leading-tight tracking-tight">
                                                    {formatCurrency(combo.finalUnitPrice)}
                                                </div>
                                                <div className="flex items-center gap-1.5 min-h-[1.25rem]">
                                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Ahorras</span>
                                                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50/50 px-1.5 py-0.5 rounded-full border border-emerald-100/50">
                                                        {formatCurrency(Math.max(0, combo.baseUnitPrice - combo.finalUnitPrice))}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pt-1.5 border-t border-[rgb(230,225,220)] flex justify-between items-center">
                                                <span className="text-[9px] uppercase font-bold text-[rgb(160,155,150)]">{combo.items.length} productos</span>
                                                <div className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                                    <span className="text-[rgb(160,155,150)] text-[8px]">Base</span>
                                                    <span className="text-[rgb(120,115,110)] line-through decoration-amber-500/30">{formatCurrency(combo.baseUnitPrice)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!readOnly && (
                                        <div className="mt-2 grid grid-cols-2 gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[10px] font-bold"
                                                onClick={() => openComboView(combo)}
                                            >
                                                Ver
                                            </Button>
                                            <Button variant="secondary" size="sm" className="h-7 text-[10px] font-bold" onClick={() => startEditCombo(combo)}>
                                                Edit
                                            </Button>
                                            {combo.isActive ? (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold col-span-2"
                                                    disabled={comboStatusLoadingId === combo.id}
                                                    onClick={() => deactivateCombo(combo.id)}
                                                >
                                                    {comboStatusLoadingId === combo.id ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <span className="animate-spin text-[9px]">️</span>
                                                            Desactivando...
                                                        </span>
                                                    ) : 'Desactivar'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold col-span-2"
                                                    disabled={comboStatusLoadingId === combo.id}
                                                    onClick={() => reactivateCombo(combo.id)}
                                                >
                                                    {comboStatusLoadingId === combo.id ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <span className="animate-spin text-[9px]">️</span>
                                                            Reactivando...
                                                        </span>
                                                    ) : 'Reactivar'}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {filteredCombos.length === 0 && (
                            <Card className="border-dashed border-[rgb(230,225,220)] bg-white">
                                <CardContent className="p-8 text-center text-sm text-[rgb(120,115,110)]">
                                    No hay combos que coincidan con los filtros.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {comboViewModal.visible && comboViewModal.combo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={closeComboView} />
                    <Card className="w-full max-w-2xl relative z-10 animate-scale-in max-h-[90vh] flex flex-col">
                        <CardHeader className="border-b border-[rgb(230,225,220)]">
                            <div className="flex items-center justify-between">
                                <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Detalle de Combo</CardTitle>
                                <Button variant="ghost" onClick={closeComboView} size="icon">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <div className="aspect-square rounded-2xl overflow-hidden border border-[rgb(230,225,220)] shadow-inner flex items-center justify-center bg-[rgb(250,248,245)] relative group">
                                        <ImageSlider
                                            images={[
                                                ...comboViewModal.combo.items.map((item) => item.productImage || '').filter(Boolean),
                                                ...(comboViewModal.combo.image ? [comboViewModal.combo.image] : []),
                                            ]}
                                            name={comboViewModal.combo.name}
                                            showControls={true}
                                            className="w-full h-full"
                                            allowZoom={true}
                                        />
                                    </div>
                                    {comboViewModal.combo.description && (
                                        <div className="mt-4 space-y-2">
                                            <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest">Descripción</div>
                                            <div className="p-4 bg-[rgb(250,248,245)] rounded-xl border border-[rgb(230,225,220)] text-gray-700 text-sm italic leading-relaxed">
                                                "{comboViewModal.combo.description}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-bold text-[rgb(25,35,25)] leading-tight">{comboViewModal.combo.name}</h3>
                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest">Información Económica</div>
                                        <div className={cn("grid gap-4", isAdminView ? "grid-cols-2" : "grid-cols-1")}>
                                            <div className="p-3 bg-emerald-50 rounded-xl">
                                                <div className="text-[10px] text-emerald-600 font-bold uppercase">Precio Venta</div>
                                                <div className="text-xl font-black text-emerald-900">{formatCurrency(comboViewModal.combo.finalUnitPrice)}</div>
                                            </div>

                                            {isAdminView && (
                                                <div
                                                    className="relative perspective-1000 cursor-pointer h-[72px] group"
                                                    onClick={() => setIsComboCostFlipped(!isComboCostFlipped)}
                                                >
                                                    <div className={cn(
                                                        "relative w-full h-full transition-all duration-500 preserve-3d group-hover:scale-[1.02]",
                                                        isComboCostFlipped && "rotate-y-180",
                                                        !isComboCostFlipped && "ring-2 ring-emerald-500/20 shadow-lg animate-pulse-soft"
                                                    )}>
                                                        <div className="absolute inset-0 backface-hidden p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-center shadow-sm">
                                                            <div className="flex justify-between items-center">
                                                                <div className="text-[10px] text-stone-500 font-bold uppercase flex items-center gap-1">
                                                                    Costo Actual
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[8px] bg-stone-900 text-white px-2 py-0.5 rounded-full font-black animate-pulse-soft">
                                                                    <span className="text-xs">↻</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-end gap-2">
                                                                <div className="text-xl font-black text-stone-700">
                                                                    {formatCurrency(comboViewModal.combo.items.reduce((acc, item) => acc + (getComboItemUnitCost(item) * Number(item.quantity || 0)), 0))}
                                                                </div>
                                                                <span className="text-lg animate-bounce leading-none"></span>
                                                            </div>
                                                        </div>

                                                        <div className="absolute inset-0 backface-hidden rotate-y-180 p-2 bg-stone-900 rounded-xl text-white flex flex-col justify-center border border-stone-700 shadow-xl">
                                                            <div className="text-[8px] text-stone-400 font-bold uppercase mb-1 flex justify-between items-center px-1">
                                                                <span>Costos por Lote (FIFO)</span>
                                                                <span className="text-white text-[12px] animate-spin-slow">↻</span>
                                                            </div>
                                                            <div className="flex flex-col gap-1 overflow-y-auto max-h-[50px] custom-scrollbar px-1">
                                                                {loadingComboCosts ? (
                                                                    <div className="text-[10px] text-stone-300 px-2 py-1">Cargando...</div>
                                                                ) : (
                                                                    comboViewModal.combo.items.map((item) => (
                                                                        <div key={`combo-cost-${item.productId}`} className="flex justify-between items-center bg-stone-800/40 px-2 py-0.5 rounded border border-stone-700/50">
                                                                            <span className="text-[10px] font-bold text-white">{formatCurrency(getComboItemUnitCost(item))}</span>
                                                                            <span className="text-[9px] text-emerald-400 font-black">{item.quantity} uds</span>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest flex justify-between items-center">
                                            <span>Estado de Stock</span>
                                            <span className="text-[10px] bg-[rgb(25,35,25)] text-white px-2 py-0.5 rounded-full animate-pulse-soft">Toca para girar</span>
                                        </div>

                                        <div
                                            className="relative perspective-1000 cursor-pointer h-[80px] group"
                                            onClick={() => setIsComboStockFlipped(!isComboStockFlipped)}
                                        >
                                            <div className={cn(
                                                "relative w-full h-full transition-all duration-700 preserve-3d",
                                                isComboStockFlipped && "rotate-y-180"
                                            )}>
                                                <div className="absolute inset-0 backface-hidden p-4 bg-[rgb(25,35,25)] text-white rounded-xl flex items-center justify-between shadow-lg border border-white/10">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium opacity-80 uppercase tracking-tighter">Unidades Totales</span>
                                                        <span className="text-3xl font-black">{comboViewModal.combo.maxUnitsGlobal ?? 0}</span>
                                                    </div>
                                                    <div className="text-2xl animate-bounce"></div>
                                                </div>

                                                <div className="absolute inset-0 backface-hidden rotate-y-180 p-3 bg-stone-900 rounded-xl text-white flex flex-col justify-center border border-stone-700 shadow-xl overflow-hidden">
                                                    <div className="text-[10px] text-stone-400 font-bold uppercase mb-2 flex justify-between items-center">
                                                        <span>Disponibilidad por Componente</span>
                                                        <span className="text-emerald-400">Max: {comboViewModal.combo.maxUnitsGlobal ?? 0}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[45px] custom-scrollbar pr-1">
                                                        {comboViewModal.combo.items.map((item) => {
                                                            const availableByComponent = Math.floor(Number(item.globalStock || 0) / Math.max(1, Number(item.quantity || 1)))
                                                            return (
                                                                <div key={`combo-stock-${item.productId}`} className="flex justify-between items-center bg-white/5 px-2 py-1 rounded border border-white/5 text-[11px]">
                                                                    <span className="font-medium truncate max-w-[70%]">{item.productName}</span>
                                                                    <span className={cn(
                                                                        "font-bold",
                                                                        availableByComponent > 5 ? "text-emerald-400" : availableByComponent > 0 ? "text-amber-400" : "text-red-400"
                                                                    )}>{availableByComponent}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest">Resumen Comercial</div>
                                        <div className="p-4 bg-[rgb(250,248,245)] rounded-xl border border-[rgb(230,225,220)] text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-[rgb(120,115,110)]">Suma individual</span>
                                                <span className="font-semibold">{formatCurrency(comboViewModal.combo.baseUnitPrice)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[rgb(120,115,110)]">Rebaja</span>
                                                <span className="font-semibold text-amber-700">-{formatCurrency(Math.max(0, comboViewModal.combo.baseUnitPrice - comboViewModal.combo.finalUnitPrice))}</span>
                                            </div>
                                            <div className="flex justify-between mt-1 pt-1 border-t border-[rgb(230,225,220)]">
                                                <span className="font-bold text-[rgb(25,35,25)]">Precio combo</span>
                                                <span className="font-black text-[rgb(25,35,25)]">{formatCurrency(comboViewModal.combo.finalUnitPrice)}</span>
                                            </div>
                                            {isAdminView && (
                                                <div className="flex justify-between pt-1 border-t border-[rgb(230,225,220)]">
                                                    <span className="font-medium text-[rgb(120,115,110)]">Utilidad estimada</span>
                                                    <span className="font-black text-emerald-700">
                                                        {formatCurrency(
                                                            Number(comboViewModal.combo.finalUnitPrice || 0) -
                                                            comboViewModal.combo.items.reduce((acc, item) => acc + (getComboItemUnitCost(item) * Number(item.quantity || 0)), 0)
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Form Modal - Original Design */}
            {showForm && !readOnly && (
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
                                <Button variant="ghost" onClick={resetForm} size="icon" className="rounded-full">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        Nombre del Producto
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                                        placeholder="Ej: Sofá Modular Gris"
                                        className="h-11 border-2 border-[rgb(230,225,220)] focus:border-[rgb(25,35,25)] transition-all duration-300 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        Categoría
                                        <span className="text-red-500">*</span>
                                    </Label>
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
                                        <p className="text-[10px] text-gray-500">
                                            Se añadirá a la Bodega Principal
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="flex items-center gap-1">
                                        Descripción
                                    </Label>
                                    <Input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="Describe el material, dimensiones, etc." />
                                </div>

                                {isAdminView && (
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1">
                                            Precio Costo (Valor de adquisición)
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="text"
                                            value={formatCurrency(form.costPrice)}
                                            onChange={(e) => setForm((s) => ({ ...s, costPrice: parseCurrencyInput(e.target.value) }))}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        Precio Venta (Precio al público)
                                        <span className="text-red-500">*</span>
                                    </Label>
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
                                                            
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            {imagePreviews.length < 3 && (
                                                <div
                                                    className="aspect-square rounded-lg border-2 border-dashed border-[rgb(200,195,190)] flex flex-col items-center justify-center cursor-pointer hover:bg-[rgb(240,235,230)] transition-colors"
                                                    onClick={() => document.getElementById('image-upload')?.click()}
                                                >
                                                    <span className="text-2xl mb-1"></span>
                                                    <span className="text-xs text-[rgb(120,115,110)]">Añadir</span>
                                                </div>
                                            )}
                                        </div>

                                        {imagePreviews.length === 0 && (
                                            <div className="text-center p-2">
                                                <p className="text-sm font-medium text-[rgb(120,115,110)]">Añadir imágenes (Max 3)</p>
                                                <p className="text-xs text-[rgb(120,115,110)]/70">PNG, JPG, WEBP · Puedes seleccionar varias a la vez</p>
                                            </div>
                                        )}

                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        SKU / Referencia
                                    </Label>
                                    <Input value={form.sku} onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} placeholder="Ex: MOD-SOF-001" />
                                </div>

                                <div className="space-y-3 md:col-span-2">
                                    <button
                                        type="button"
                                        onClick={() => setVariantsExpanded(prev => !prev)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl border border-[rgb(230,225,220)] bg-[rgb(250,248,245)] hover:bg-[rgb(245,240,235)] transition-colors"
                                    >
                                        <div className="text-left">
                                            <Label className="font-bold cursor-pointer">Variantes visuales (mismo precio/costo)</Label>
                                            <div className="text-xs text-[rgb(120,115,110)]">
                                                {form.visualVariants.length} variante(s)
                                            </div>
                                        </div>
                                        <span className="text-lg">{variantsExpanded ? '▾' : '▸'}</span>
                                    </button>
                                    {variantsExpanded && (
                                        <>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <Button type="button" variant="outline" onClick={addVisualVariantRow} className="w-full sm:w-auto">
                                                        + Variante
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        className="w-full sm:w-auto"
                                                        disabled={selectedVariantIndex < 0 || selectedVariantIndex >= form.visualVariants.length}
                                                        onClick={() => {
                                                            if (selectedVariantIndex >= 0) removeVisualVariantRow(selectedVariantIndex)
                                                        }}
                                                    >
                                                        Quitar seleccionada
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {form.visualVariants.length === 0 && (
                                                    <div className="text-xs text-[rgb(120,115,110)] p-3 rounded-lg bg-[rgb(250,248,245)] border border-[rgb(230,225,220)]">
                                                        Puedes agregar variantes para mostrar más diseños sin duplicar inventario.
                                                    </div>
                                                )}
                                                {form.visualVariants.length > 0 && (
                                                    <div className="grid gap-3 md:grid-cols-[260px_1fr]">
                                                        <div className="rounded-lg border border-[rgb(230,225,220)] bg-white p-2 max-h-64 overflow-y-auto">
                                                            <div className="space-y-1">
                                                                {form.visualVariants.map((variant, index) => (
                                                                    <button
                                                                        key={`variant-row-${index}`}
                                                                        type="button"
                                                                        onClick={() => setSelectedVariantIndex(index)}
                                                                        className={cn(
                                                                            "w-full flex items-center gap-2 p-2 rounded-md text-left border transition-colors",
                                                                            selectedVariantIndex === index
                                                                                ? "border-[rgb(25,35,25)] bg-[rgb(245,240,235)]"
                                                                                : "border-transparent hover:bg-[rgb(250,248,245)]"
                                                                        )}
                                                                    >
                                                                        <div className="w-10 h-10 rounded border border-[rgb(230,225,220)] overflow-hidden bg-[rgb(250,248,245)] shrink-0">
                                                                            {variant.image ? (
                                                                                <img src={variant.image} alt={variant.name || `Variante ${index + 1}`} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-[rgb(120,115,110)]">Sin img</div>
                                                                            )}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="text-xs font-semibold truncate">
                                                                                {variant.name || `Variante ${index + 1}`}
                                                                            </div>
                                                                            <div className="text-[10px] text-[rgb(120,115,110)]">
                                                                                {variant.image ? 'Imagen cargada' : 'Pendiente imagen'}
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="rounded-lg border border-[rgb(230,225,220)] bg-[rgb(250,248,245)] p-3">
                                                            {selectedVariantIndex >= 0 && form.visualVariants[selectedVariantIndex] ? (
                                                                <div className="space-y-3">
                                                                    <Label className="text-xs uppercase tracking-widest text-[rgb(120,115,110)]">Editar variante seleccionada</Label>
                                                                    <Input
                                                                        placeholder="Nombre variante (ej: Capitoneado Beige)"
                                                                        value={form.visualVariants[selectedVariantIndex].name}
                                                                        onChange={(e) => updateVisualVariantRow(selectedVariantIndex, { name: e.target.value })}
                                                                    />
                                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                                        <div className="h-10 rounded-lg border border-[rgb(230,225,220)] bg-white px-2 flex-1 flex items-center justify-center text-xs text-[rgb(120,115,110)]">
                                                                            {form.visualVariants[selectedVariantIndex].image ? 'Imagen cargada' : 'Sin imagen'}
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            className="w-full sm:w-auto"
                                                                            onClick={() => triggerVariantImageUpload(selectedVariantIndex)}
                                                                            disabled={uploading}
                                                                        >
                                                                            Subir
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-[rgb(120,115,110)]">Selecciona una variante para editarla.</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {productVisualPreviewImages.length > 0 && (
                                                <div className="space-y-2 pt-1">
                                                    <Label className="text-xs text-[rgb(120,115,110)] uppercase tracking-widest">Preview variantes cargadas</Label>
                                                    <div className="rounded-xl border border-[rgb(230,225,220)] bg-[rgb(250,248,245)] p-3">
                                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                                            {productVisualPreviewImages.map((img, idx) => (
                                                                <div key={`variant-preview-${idx}`} className="shrink-0 w-28 h-28 rounded-lg overflow-hidden border border-[rgb(230,225,220)] bg-white">
                                                                    <img src={img} alt={`Variante ${idx + 1}`} className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
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
                                <input
                                    id="variant-image-upload"
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    className="hidden"
                                    onChange={handleVariantImageFile}
                                />
                            </div>
                        </CardContent>

                        <div className="p-6 border-t border-[rgb(230,225,220)] flex flex-col sm:flex-row gap-3">
                            <Button onClick={submit} className="flex-1 h-12 text-lg shadow-xl w-full" disabled={saving}>
                                {saving ? '️ Guardando...' : isEditing ? 'Guardar Cambios' : 'Confirmar y Crear'}
                            </Button>
                            <Button variant="outline" onClick={resetForm} className="h-12 w-full sm:w-auto" disabled={saving}>
                                Cancelar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {showComboForm && !readOnly && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={resetComboForm} />
                    <Card className="w-full max-w-3xl relative z-10 animate-scale-in">
                        <CardHeader className="border-b border-[rgb(230,225,220)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                                        {isEditingCombo ? 'Editar Combo' : 'Nuevo Combo'}
                                    </CardTitle>
                                    <CardDescription>
                                        Selecciona productos, nombra el combo y define cuánto bajar al precio final.
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" onClick={resetComboForm} size="icon" className="rounded-full">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 max-h-[72vh] overflow-y-auto custom-scrollbar space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nombre del combo</Label>
                                    <Input
                                        value={comboForm.name}
                                        onChange={(e) => setComboForm((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="Ej: Combo Sala + Centro"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rebaja sobre suma individual</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={comboForm.discountAmount}
                                        onChange={(e) => setComboForm((prev) => ({ ...prev, discountAmount: e.target.value }))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Descripción (opcional)</Label>
                                    <textarea
                                        value={comboForm.description}
                                        onChange={(e) => setComboForm((prev) => ({ ...prev, description: e.target.value }))}
                                        className="w-full min-h-[80px] rounded-lg border border-[rgb(230,225,220)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                        placeholder="Explica qué incluye el combo y el beneficio."
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Imagen extra del combo (opcional)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={handleComboImageSelect}
                                        />
                                        {(comboImagePreview || comboForm.image) && (
                                            <Button type="button" variant="outline" onClick={clearComboImage}>
                                                Quitar
                                            </Button>
                                        )}
                                    </div>
                                    {(comboImagePreview || comboForm.image) && (
                                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-[rgb(230,225,220)]">
                                            <img src={comboImagePreview || comboForm.image} alt="Imagen combo" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado del combo</Label>
                                    <div className="flex flex-wrap gap-3">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={comboForm.isActive}
                                                onChange={(e) => setComboForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                                            />
                                            Activo para ventas
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={comboForm.isPublic}
                                                onChange={(e) => setComboForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
                                            />
                                            Visible en catálogo
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Productos del combo</Label>
                                    <Button variant="outline" type="button" onClick={addComboItemRow}>Agregar producto</Button>
                                </div>
                                <div className="space-y-2">
                                    {comboForm.items.map((item, index) => {
                                        const selectedProduct = comboProductMap.get(item.productId)
                                        return (
                                            <div key={`combo-builder-item-${index}`} className="grid gap-2 grid-cols-1 md:grid-cols-[1fr_110px_130px_90px]">
                                                <select
                                                    className="flex h-10 w-full rounded-lg border border-[rgb(230,225,220)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[rgb(25,35,25)]"
                                                    value={item.productId}
                                                    onChange={(e) => updateComboItemRow(index, { productId: e.target.value })}
                                                >
                                                    <option value="">Selecciona un producto</option>
                                                    {comboProducts.map((product) => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} (${new Intl.NumberFormat('es-CO').format(Number(product.salePrice || 0))})
                                                        </option>
                                                    ))}
                                                </select>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(e) => updateComboItemRow(index, { quantity: Number(e.target.value || 1) })}
                                                />
                                                <div className="h-10 rounded-lg border border-[rgb(230,225,220)] bg-[rgb(250,248,245)] px-3 flex items-center justify-end text-sm font-semibold text-[rgb(25,35,25)]">
                                                    {selectedProduct ? formatCurrency(Number(selectedProduct.salePrice || 0) * Number(item.quantity || 0)) : '$0'}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    className="text-red-600"
                                                    disabled={comboForm.items.length <= 1}
                                                    onClick={() => removeComboItemRow(index)}
                                                >
                                                    Quitar
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="rounded-xl border border-[rgb(230,225,220)] bg-[rgb(250,248,245)] p-4 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {comboSelectedImages.map((img, index) => (
                                        <div key={`combo-selected-${index}`} className="w-12 h-12 rounded-lg border border-[rgb(230,225,220)] overflow-hidden">
                                            <img src={img} alt={`Producto combo ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {(comboImagePreview || comboForm.image) && (
                                        <div className="w-12 h-12 rounded-lg border border-[rgb(230,225,220)] overflow-hidden ring-2 ring-amber-300">
                                            <img src={comboImagePreview || comboForm.image} alt="Imagen principal combo" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm flex justify-between">
                                    <span className="text-[rgb(120,115,110)]">Suma productos</span>
                                    <span className="font-semibold">{formatCurrency(comboBasePrice)}</span>
                                </div>
                                <div className="text-sm flex justify-between">
                                    <span className="text-[rgb(120,115,110)]">Rebaja aplicada</span>
                                    <span className="font-semibold text-amber-700">-{formatCurrency(comboDiscountValue)}</span>
                                </div>
                                <div className="text-base flex justify-between pt-2 border-t border-[rgb(230,225,220)]">
                                    <span className="font-bold text-[rgb(25,35,25)]">Precio final del combo</span>
                                    <span className="font-black text-[rgb(25,35,25)]">{formatCurrency(comboFinalPrice)}</span>
                                </div>
                            </div>
                        </CardContent>

                        <div className="p-6 border-t border-[rgb(230,225,220)] flex gap-3">
                            <Button onClick={submitCombo} className="flex-1 h-12 text-lg shadow-xl" disabled={savingCombo}>
                                {savingCombo ? '️ Guardando...' : isEditingCombo ? 'Guardar Combo' : 'Crear Combo'}
                            </Button>
                            <Button variant="outline" onClick={resetComboForm} className="h-12" disabled={savingCombo}>
                                Cancelar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* View Product Modal - Original Design */}
            {viewModal.visible && viewModal.product && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-[rgb(25,35,25)]/40 backdrop-blur-sm" onClick={closeViewModal} />
                    <Card className="w-full max-w-2xl relative z-10 animate-scale-in max-h-[90vh] flex flex-col">
                        <CardHeader className="border-b border-[rgb(230,225,220)]">
                            <div className="flex items-center justify-between">
                                <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Detalles de Producto</CardTitle>
                                <Button variant="ghost" onClick={closeViewModal} size="icon">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="aspect-square rounded-2xl overflow-hidden border border-[rgb(230,225,220)] shadow-inner flex items-center justify-center bg-[rgb(250,248,245)] relative group">
                                    <ImageSlider
                                        images={[
                                            ...(viewModal.product.images && viewModal.product.images.length > 0 ? viewModal.product.images : []),
                                            ...((viewModal.product.visualVariants || []).map(v => v.image).filter(Boolean))
                                        ].filter((img, idx, arr) => arr.indexOf(img) === idx)}
                                        name={viewModal.product.name}
                                        showControls={true}
                                        className="w-full h-full"
                                        allowZoom={true}
                                    />
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute bottom-4 right-4 z-40 h-10 w-10 rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                        onClick={() => downloadProductImages(viewModal.product!)}
                                        title="Descargar imágenes"
                                    >
                                        <Download className="h-5 w-5 text-[rgb(25,35,25)]" />
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-bold text-[rgb(25,35,25)] leading-tight">{viewModal.product.name}</h3>
                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest">Información Económica</div>
                                        <div className={cn("grid gap-4", isAdminView ? "grid-cols-2" : "grid-cols-1")}>
                                            <div className="p-3 bg-emerald-50 rounded-xl">
                                                <div className="text-[10px] text-emerald-600 font-bold uppercase">Precio Venta</div>
                                                <div className="text-xl font-black text-emerald-900">{formatCurrency(viewModal.product.salePrice)}</div>
                                            </div>

                                            {isAdminView && (
                                                <div
                                                    className="relative perspective-1000 cursor-pointer h-[72px] group"
                                                    onClick={() => setIsCostFlipped(!isCostFlipped)}
                                                >
                                                    <div className={cn(
                                                        "relative w-full h-full transition-all duration-500 preserve-3d group-hover:scale-[1.02]",
                                                        isCostFlipped && "rotate-y-180",
                                                        (viewModal.product.activeCosts?.length ?? 0) > 1 && !isCostFlipped && "ring-2 ring-emerald-500/20 shadow-lg animate-pulse-soft"
                                                    )}>
                                                        {/* Front: Principal Cost */}
                                                        <div className="absolute inset-0 backface-hidden p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-center shadow-sm">
                                                            <div className="flex justify-between items-center">
                                                                <div className="text-[10px] text-stone-500 font-bold uppercase flex items-center gap-1">
                                                                    Costo Actual
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[8px] bg-stone-900 text-white px-2 py-0.5 rounded-full font-black animate-pulse-soft">

                                                                    <span className="text-xs">↻</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-end gap-2">
                                                                <div className="text-xl font-black text-stone-700">{formatCurrency(viewModal.product.costPrice)}</div>
                                                                {(viewModal.product.activeCosts?.length ?? 0) > 1 && (
                                                                    <span className="text-lg animate-bounce leading-none"></span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Back: List of all Active Costs with Quantities */}
                                                        <div className="absolute inset-0 backface-hidden rotate-y-180 p-2 bg-stone-900 rounded-xl text-white flex flex-col justify-center border border-stone-700 shadow-xl">
                                                            <div className="text-[8px] text-stone-400 font-bold uppercase mb-1 flex justify-between items-center px-1">
                                                                <span>Costos por Lote (FIFO)</span>
                                                                <span className="text-white text-[12px] animate-spin-slow">↻</span>
                                                            </div>
                                                            <div className="flex flex-col gap-1 overflow-y-auto max-h-[50px] custom-scrollbar px-1">
                                                                {(viewModal.product.activeCosts && viewModal.product.activeCosts.length > 0) ? (
                                                                    viewModal.product.activeCosts.map((item, i) => (
                                                                        <div key={i} className="flex justify-between items-center bg-stone-800/40 px-2 py-0.5 rounded border border-stone-700/50">
                                                                            <span className="text-[10px] font-bold text-white">{formatCurrency(item.cost)}</span>
                                                                            <span className="text-[9px] text-emerald-400 font-black">{item.quantity} uds</span>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="flex justify-between items-center bg-stone-800/40 px-2 py-0.5 rounded border border-stone-700/50">
                                                                        <span className="text-[10px] font-bold text-white">{formatCurrency(viewModal.product.costPrice)}</span>
                                                                        <span className="text-[9px] text-stone-400">Stock actual</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest flex justify-between items-center">
                                            <span>Estado de Stock</span>
                                            <span className="text-[10px] bg-[rgb(25,35,25)] text-white px-2 py-0.5 rounded-full animate-pulse-soft">Toca para girar</span>
                                        </div>

                                        <div
                                            className="relative perspective-1000 cursor-pointer h-[80px] group"
                                            onClick={() => setIsStockFlipped(!isStockFlipped)}
                                        >
                                            <div className={cn(
                                                "relative w-full h-full transition-all duration-700 preserve-3d",
                                                isStockFlipped && "rotate-y-180"
                                            )}>
                                                {/* Front: Total Stock */}
                                                <div className="absolute inset-0 backface-hidden p-4 bg-[rgb(25,35,25)] text-white rounded-xl flex items-center justify-between shadow-lg border border-white/10">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium opacity-80 uppercase tracking-tighter">Unidades Totales</span>
                                                        <span className="text-3xl font-black">{viewModal.product.totalStock ?? 0}</span>
                                                    </div>
                                                    <div className="text-2xl animate-bounce"></div>
                                                </div>

                                                {/* Back: Stock by Warehouse */}
                                                <div className="absolute inset-0 backface-hidden rotate-y-180 p-3 bg-stone-900 rounded-xl text-white flex flex-col justify-center border border-stone-700 shadow-xl overflow-hidden">
                                                    <div className="text-[10px] text-stone-400 font-bold uppercase mb-2 flex justify-between items-center">
                                                        <span>Disponibilidad por Sede</span>
                                                        <span className="text-emerald-400">Total: {viewModal.product.totalStock ?? 0}</span>
                                                    </div>

                                                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[45px] custom-scrollbar pr-1">
                                                        {loadingStock ? (
                                                            <div className="flex justify-center py-2">
                                                                <div className="h-4 w-4 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
                                                            </div>
                                                        ) : stockDetails.length > 0 ? (
                                                            stockDetails.map((item, i) => (
                                                                <div key={i} className="flex justify-between items-center bg-white/5 px-2 py-1 rounded border border-white/5 text-[11px]">
                                                                    <span className="font-medium truncate max-w-[70%]"> {item.warehouse?.name || 'Sede Central'}</span>
                                                                    <span className={cn(
                                                                        "font-bold",
                                                                        item.quantity > 5 ? "text-emerald-400" :
                                                                            item.quantity > 0 ? "text-amber-400" : "text-red-400"
                                                                    )}>{item.quantity} uds</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center text-[10px] text-stone-500 italic">No hay existencias</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {viewModal.product.description && (
                                <div className="space-y-2">
                                    <div className="text-sm font-bold text-[rgb(120,115,110)] uppercase tracking-widest">Descripción</div>
                                    <div className="p-4 bg-[rgb(250,248,245)] rounded-xl border border-[rgb(230,225,220)] text-gray-700 text-sm italic leading-relaxed">
                                        "{viewModal.product.description}"
                                    </div>
                                </div>
                            )}

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

            {/* Barcode Modal - Original Design */}
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
                                <X className="h-4 w-4" />
                            </Button>
                            <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Código de Barras</CardTitle>
                            <CardDescription>{barcodeModal.product.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6 pb-8">
                            <div className="p-4 bg-white border border-[rgb(230,225,220)] rounded-xl shadow-inner">
                                <svg ref={barcodeSvgRef} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <Button className="w-full shadow-lg" onClick={() => downloadBarcode(barcodeModal.product!)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    navigator.clipboard.writeText(barcodeModal.product!.barcode!);
                                    toast.success('Código copiado al portapapeles');
                                }}> Copiar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Confirm Delete Dialog */}
            {!readOnly && (
                <ConfirmDialog
                    open={!!itemToDelete}
                    onOpenChange={(open) => !open && setItemToDelete(null)}
                    onConfirm={confirmDelete}
                    title="¿Estás seguro?"
                    description="Esta acción no se puede deshacer. El producto será eliminado permanentemente de tu inventario."
                    confirmText="Sí, eliminar"
                    variant="destructive"
                />
            )}


        </div >
    )
}
