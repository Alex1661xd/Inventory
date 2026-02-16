import { Injectable, BadRequestException, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import * as crypto from 'crypto';

@Injectable()
export class SuperAdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly supabaseService: SupabaseService,
    ) { }

    private getGeminiApiKey() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new InternalServerErrorException('GEMINI_API_KEY no estÃ¡ configurada');
        }
        return apiKey;
    }

    private async callGemini(model: string, payload: any) {
        const apiKey = this.getGeminiApiKey();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = data?.error?.message || 'Error desconocido al llamar a Gemini';
            throw new BadRequestException(`Gemini respondiÃ³ con error: ${message}`);
        }

        return data;
    }

    private isUnavailableModelError(message: string) {
        const text = (message || '').toLowerCase();
        return (
            text.includes('is not found for api version') ||
            text.includes('is not supported for generatecontent') ||
            text.includes('not found') ||
            text.includes('not supported')
        );
    }

    private async callGeminiWithFallback(models: string[], payload: any) {
        let lastErrorMessage = '';

        for (const model of models) {
            try {
                const data = await this.callGemini(model, payload);
                return { data, modelUsed: model };
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Error desconocido';
                lastErrorMessage = message;
                if (!this.isUnavailableModelError(message)) {
                    throw error;
                }
            }
        }

        throw new BadRequestException(
            `Ninguno de los modelos configurados estÃ¡ disponible para este proyecto/API key. Ãšltimo error: ${lastErrorMessage}`,
        );
    }

    private extractTextFromGeminiResponse(response: any, fallbackError: string) {
        const textPart = response?.candidates?.[0]?.content?.parts?.find((part: any) => typeof part?.text === 'string');
        const text = textPart?.text?.trim();

        if (!text) {
            throw new BadRequestException(fallbackError);
        }

        return text;
    }

    private extractImageBase64FromGeminiResponse(response: any) {
        const parts = response?.candidates?.[0]?.content?.parts;
        if (Array.isArray(parts)) {
            for (const part of parts) {
                if (part?.inlineData?.data) return part.inlineData.data as string;
                if (part?.inline_data?.data) return part.inline_data.data as string;
            }
        }

        return (
            response?.image?.bytesBase64Encoded ||
            response?.images?.[0] ||
            response?.data ||
            null
        );
    }

    private detectMimeType(image: any) {
        if (typeof image?.mimetype === 'string' && image.mimetype.startsWith('image/')) {
            return image.mimetype;
        }

        const bytes: Buffer = image?.buffer;
        if (bytes?.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return 'image/png';
        if (bytes?.subarray(0, 3).toString('hex') === 'ffd8ff') return 'image/jpeg';
        if (bytes?.subarray(0, 4).toString('hex') === '47494638') return 'image/gif';
        if (bytes?.subarray(0, 4).toString('hex') === '52494646') return 'image/webp';
        return 'image/jpeg';
    }

    private buildCatalogMetaPrompt(productDescription: string, userDescription: string, whatsapp?: string) {
        let metaPrompt = `Tu tarea es refinar y mejorar el siguiente prompt para generacion de imagenes de catalogo comercial, con estas REGLAS ESTRICTAS:\n\n`;

        if (userDescription.trim()) {
            metaPrompt += `REGLA CRITICA: El cliente ha solicitado lo siguiente y DEBE aparecer TEXTUALMENTE en tu prompt refinado:\n"${userDescription}"\n\n`;
            metaPrompt += `NO PUEDES:\n- Omitir esta solicitud\n- Reformularla de manera que pierda el sentido original\n- Ignorarla o minimizarla\n- Ponerla como opcional\n\n`;
            metaPrompt += `DEBES:\n- Incluirla EXACTAMENTE como esta escrita\n- Marcarla como REQUISITO OBLIGATORIO en tu prompt refinado\n- Darle MAXIMA PRIORIDAD sobre otras instrucciones\n\n`;
        }

        metaPrompt += `Ahora refina este prompt para que sea claro, especifico y efectivo para un modelo de generacion de imagenes:\n\n---PROMPT A REFINAR---\n\n`;

        let promptBase = `INSTRUCCIONES PARA GENERACION DE IMAGEN PUBLICITARIA DE CATALOGO:\n\n`;
        promptBase += `IMAGEN DE REFERENCIA: Se proporciona una imagen original del producto que debe usarse como referencia visual exacta.\n\n`;

        if (userDescription.trim()) {
            promptBase += `REQUISITOS OBLIGATORIOS DEL CLIENTE (MAXIMA PRIORIDAD):\n${userDescription}\n\n`;
            promptBase += `Estos requisitos son MANDATORIOS y tienen prioridad absoluta sobre cualquier otra instruccion.\n\n`;
        }

        promptBase += `PRODUCTO:\n`;
        promptBase += `- Recrear EXACTAMENTE el producto de la imagen de referencia\n`;
        promptBase += `- Mantener forma, estructura, colores, materiales y acabados identicos\n`;
        promptBase += `- Preservar todos los detalles: etiquetas, costuras, herrajes, acabados\n`;
        promptBase += `- El producto debe verse TAL CUAL es en la realidad\n`;
        promptBase += `- Ignorar el fondo, paredes y pisos de la imagen original\n\n`;

        promptBase += `AMBIENTE DE TIENDA/ALMACEN:\n`;
        promptBase += `- Fondo limpio y profesional que simule showroom o sala de exhibicion\n`;
        promptBase += `- Iluminacion comercial profesional (luz blanca brillante y uniforme)\n`;
        promptBase += `- Ambiente minimalista que NO compita con el producto\n`;
        promptBase += `- Piso neutro (blanco, gris claro o beige)\n`;
        promptBase += `- Opcional: sutil reflejo del producto en el piso para efecto premium\n`;
        promptBase += `- Sin decoracion que distraiga; SOLO el producto es el protagonista\n\n`;

        promptBase += `ESTILO FOTOGRAFICO:\n`;
        promptBase += `- Fotografia de catalogo comercial profesional\n`;
        promptBase += `- Iluminacion tipo estudio: brillante, sin sombras duras\n`;
        promptBase += `- Angulo frontal o 3/4 que muestre mejor el producto\n`;
        promptBase += `- Fondo bokeh suave o completamente blanco/neutro\n`;
        promptBase += `- Ultra realista, detalles nitidos y colores precisos\n`;
        promptBase += `- Aspecto de fotografia tomada en showroom profesional\n\n`;

        if (whatsapp && whatsapp.trim()) {
            promptBase += `INFORMACION DE CONTACTO:\n`;
            promptBase += `Incluir de forma elegante y visible: "WhatsApp ${whatsapp}"\n`;
            promptBase += `(Puede ser en esquina inferior, como marca de agua sutil o integrado profesionalmente)\n\n`;
        }

        promptBase += `DETALLES DEL PRODUCTO ANALIZADO:\n${productDescription}\n\n`;

        promptBase += `OBJETIVO FINAL:\n`;
        promptBase += `La imagen debe parecer una fotografia profesional de catalogo comercial,\n`;
        promptBase += `como si el producto estuviera en exhibicion en una tienda moderna y bien iluminada.\n`;
        promptBase += `El cliente debe poder ver EXACTAMENTE como se ve el producto en la realidad.\n`;

        if (userDescription.trim()) {
            promptBase += `\nRECORDATORIO CRITICO: CUMPLIR EXACTAMENTE: ${userDescription}`;
        }

        metaPrompt += promptBase;
        metaPrompt += `\n\n---FIN DEL PROMPT---\n\n`;
        metaPrompt += `Ahora devuelve SOLO el prompt refinado, optimizado para generacion de imagenes de catalogo comercial, `;
        metaPrompt += `asegurandote de mantener INTACTOS los requisitos del cliente.`;

        return metaPrompt;
    }

    // Generate unique registration codes
    async generateCodes(count: number = 1, expiresInDays?: number) {
        const codes: string[] = [];
        const createdCodes: any[] = [];

        for (let i = 0; i < count; i++) {
            // Generate unique code like: INV-XXXX-XXXX
            const code = `INV-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
            codes.push(code);
        }

        for (const code of codes) {
            const expiresAt = expiresInDays
                ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
                : null;

            const created = await this.prisma.registrationCode.create({
                data: {
                    code,
                    expiresAt,
                },
            });
            createdCodes.push(created);
        }

        return createdCodes;
    }

    // List all registration codes
    async listCodes() {
        return this.prisma.registrationCode.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                tenants: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    // Validate a registration code (used during registration)
    async validateCode(code: string) {
        const registrationCode = await this.prisma.registrationCode.findUnique({
            where: { code },
        });

        if (!registrationCode) {
            throw new BadRequestException('CÃ³digo de registro invÃ¡lido');
        }

        if (registrationCode.isUsed) {
            throw new BadRequestException('Este cÃ³digo ya fue utilizado');
        }

        if (registrationCode.expiresAt && registrationCode.expiresAt < new Date()) {
            throw new BadRequestException('Este cÃ³digo ha expirado');
        }

        return registrationCode;
    }

    // Mark code as used
    async markCodeAsUsed(codeId: string, tenantId: string) {
        return this.prisma.registrationCode.update({
            where: { id: codeId },
            data: {
                isUsed: true,
                usedAt: new Date(),
            },
        });
    }

    // List all tenants with stats
    async listTenants() {
        const tenants = await this.prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        users: true,
                        products: true,
                        warehouses: true,
                        suppliers: true,
                        customers: true,
                        invoices: true,
                        purchases: true,
                        categories: true,
                    },
                },
                registrationCode: {
                    select: {
                        code: true,
                    },
                },
            },
        });

        return tenants.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            createdAt: t.createdAt,
            isBanned: t.isBanned,
            bannedAt: t.bannedAt,
            registrationCode: t.registrationCode?.code || null,
            stats: {
                users: t._count.users,
                products: t._count.products,
                warehouses: t._count.warehouses,
                suppliers: t._count.suppliers,
                customers: t._count.customers,
                invoices: t._count.invoices,
                purchases: t._count.purchases,
                categories: t._count.categories,
            },
        }));
    }

    // Ban a tenant
    async banTenant(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new NotFoundException('Negocio no encontrado');
        }

        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                isBanned: true,
                bannedAt: new Date(),
            },
        });
    }

    // Unban a tenant
    async unbanTenant(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new NotFoundException('Negocio no encontrado');
        }

        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                isBanned: false,
                bannedAt: null,
            },
        });
    }

    // Delete all tenant data (DANGEROUS - requires password verification)
    async deleteAllTenantData(tenantId: string, superAdminPassword: string, confirmation: string) {
        // Verify confirmation word
        if (confirmation !== 'confirmar') {
            throw new BadRequestException('Debes escribir "confirmar" para proceder');
        }

        // Verify super admin password via Supabase Auth
        const superAdminUser = await this.prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' },
        });

        if (!superAdminUser) {
            throw new ForbiddenException('No se encontrÃ³ el Super Admin');
        }

        // Try to login with Supabase to verify password
        const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
            email: superAdminUser.email,
            password: superAdminPassword,
        });

        if (error || !data.user) {
            throw new ForbiddenException('ContraseÃ±a incorrecta');
        }

        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new NotFoundException('Negocio no encontrado');
        }

        // 1. Get all products to collect image URLs before they are deleted
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            select: { images: true }
        });

        const imagesToDelete: string[] = [];
        products.forEach(p => {
            if (p.images && p.images.length > 0) {
                imagesToDelete.push(...p.images);
            }
        });

        // 2. Get users for Supabase Auth deletion
        const usersToDelete = await this.prisma.user.findMany({
            where: { tenantId },
            select: { id: true },
        });

        // Delete all related data in transaction
        // Increased timeout to 30s to handle large datasets
        await this.prisma.$transaction(async (tx) => {
            // Delete in order of dependencies (Child to Parent)

            // 1. Invoice Items (child of Invoice)
            await tx.invoiceItem.deleteMany({
                where: { invoice: { tenantId } },
            });

            // 2. Invoices (child of Tenant/Customer/User)
            await tx.invoice.deleteMany({
                where: { tenantId },
            });

            // 3. Cash Transactions (child of CashShift)
            await tx.cashTransaction.deleteMany({
                where: { shift: { tenantId } },
            });

            // 4. Cash Shifts (child of Tenant/User)
            await tx.cashShift.deleteMany({
                where: { tenantId },
            });

            // 5. Stock Batches (child of Tenant/Product/Warehouse/PurchaseItem)
            await tx.stockBatch.deleteMany({
                where: { tenantId },
            });

            // 6. Stock Movements (child of Product/Warehouse/User)
            await tx.stockMovement.deleteMany({
                where: { product: { tenantId } },
            });

            // 7. Stock (child of Product/Warehouse)
            await tx.stock.deleteMany({
                where: { product: { tenantId } },
            });

            // 8. Purchase Items (child of Purchase)
            await tx.purchaseItem.deleteMany({
                where: { purchase: { tenantId } },
            });

            // 9. Purchase Payments (child of Purchase/User)
            await tx.purchasePayment.deleteMany({
                where: { tenantId },
            });

            // 10. Purchases (child of Tenant/Supplier/User)
            await tx.purchase.deleteMany({
                where: { tenantId },
            });

            // 11. Expenses (child of Tenant/Supplier/User)
            await tx.expense.deleteMany({
                where: { tenantId },
            });

            // 12. Products (child of Tenant/Category)
            await tx.product.deleteMany({
                where: { tenantId },
            });

            // 13. Categories (child of Tenant)
            await tx.category.deleteMany({
                where: { tenantId },
            });

            // 14. Suppliers (child of Tenant)
            await tx.supplier.deleteMany({
                where: { tenantId },
            });

            // 15. Customers (child of Tenant)
            await tx.customer.deleteMany({
                where: { tenantId },
            });

            // 16. Warehouses (child of Tenant)
            await tx.warehouse.deleteMany({
                where: { tenantId },
            });

            // 17. Users (last database dependency)
            await tx.user.deleteMany({
                where: { tenantId },
            });

            // 18. Finally, update tenant to show it's been wiped
            await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    name: `[ELIMINADO] ${tenant.name}`,
                    isBanned: true,
                    bannedAt: new Date(),
                },
            });
        }, {
            timeout: 30000, // 30 seconds
        });

        // 3. AFTER transaction succeeds, delete users from Supabase Auth
        for (const user of usersToDelete) {
            try {
                await this.supabaseService.getClient().auth.admin.deleteUser(user.id);
            } catch (e) {
                console.error(`Error deleting user ${user.id} from Supabase:`, e);
            }
        }

        // 4. Clean up images from Storage
        if (imagesToDelete.length > 0) {
            try {
                const supabase = this.supabaseService.getClient();
                // Extract relative paths from URLs
                const paths = imagesToDelete
                    .filter(url => url && url.includes('supabase'))
                    .map(url => {
                        try {
                            const urlObj = new URL(url);
                            const parts = urlObj.pathname.split('/product-images/');
                            return parts.length > 1 ? parts[1] : null;
                        } catch (e) { return null; }
                    })
                    .filter(p => p !== null) as string[];

                if (paths.length > 0) {
                    console.log(`ðŸ§¹ [SuperAdmin] Eliminando ${paths.length} imÃ¡genes del storage para negocio wipeado`);
                    await supabase.storage.from('product-images').remove(paths);
                }
            } catch (error) {
                console.error('âš ï¸ [SuperAdmin] Error al limpiar storage de imÃ¡genes:', error.message);
            }
        }

        return { success: true, message: 'Todos los datos del negocio han sido eliminados' };
    }

        async generateCatalogImage(image: any, description = '', whatsapp = '', count = 3) {
        if (!image?.buffer) {
            throw new BadRequestException('No se recibio una imagen valida');
        }

        const textModelCandidates = [
            'gemini-2.0-flash-exp',
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-1.5-flash',
        ];

        const imageModelCandidates = [
            'gemini-2.5-flash-image',
            'gemini-2.0-flash-preview-image-generation',
            'gemini-2.0-flash-exp-image-generation',
        ];

        const mimeType = this.detectMimeType(image);
        const imageBase64 = Buffer.from(image.buffer).toString('base64').replace(/\s/g, '');
        const userDescription = (description || '').trim();
        const normalizedWhatsapp = (whatsapp || '').trim();
        const safeCount = Math.min(3, Math.max(1, Number(count) || 3));

        const analysisPayload = {
            contents: [
                {
                    parts: [
                        {
                            text: 'Analiza esta imagen y describe detalladamente SOLO los PRODUCTOS PRINCIPALES (muebles, electrodomesticos, colchones, bases de cama, armarios, etc.). Enfocate en: tipo de producto, materiales, colores del producto, texturas, dimensiones aparentes, detalles como costuras, patas, herrajes, acabados, etiquetas, caracteristicas distintivas. IGNORA completamente: paredes, pisos, decoracion del ambiente, otros muebles secundarios. Se MUY preciso sobre las caracteristicas del PRODUCTO PRINCIPAL que se va a vender.',
                        },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: imageBase64,
                            },
                        },
                    ],
                },
            ],
        };

        const { data: analysisResponse, modelUsed: analysisModelUsed } = await this.callGeminiWithFallback(
            textModelCandidates,
            analysisPayload,
        );
        const analyzedProductDescription = this.extractTextFromGeminiResponse(
            analysisResponse,
            'No fue posible obtener una descripcion del producto desde Gemini',
        );

        const metaPrompt = this.buildCatalogMetaPrompt(analyzedProductDescription, userDescription, normalizedWhatsapp);
        const refinePayload = {
            contents: [{ parts: [{ text: metaPrompt }] }],
        };

        const { data: refineResponse, modelUsed: refineModelUsed } = await this.callGeminiWithFallback(
            textModelCandidates,
            refinePayload,
        );
        const refinedPrompt = this.extractTextFromGeminiResponse(
            refineResponse,
            'No fue posible obtener el prompt refinado desde Gemini',
        );

        const generationPayload = {
            contents: [
                {
                    parts: [
                        { text: refinedPrompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: imageBase64,
                            },
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
            },
        };

        const images = await Promise.all(
            Array.from({ length: safeCount }).map(async (_, index) => {
                const variantPayload = {
                    ...generationPayload,
                    contents: [
                        {
                            parts: [
                                { text: `${refinedPrompt}\n\nVariacion ${index + 1} de ${safeCount}: cambia solo encuadre/iluminacion/fondo, manteniendo producto identico.` },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: imageBase64,
                                    },
                                },
                            ],
                        },
                    ],
                };

                const { data: generationResponse, modelUsed } = await this.callGeminiWithFallback(
                    imageModelCandidates,
                    variantPayload,
                );
                const generatedImageBase64 = this.extractImageBase64FromGeminiResponse(generationResponse);

                if (!generatedImageBase64) {
                    throw new BadRequestException(`Gemini no devolvio una imagen en la variacion ${index + 1}`);
                }

                return {
                    index: index + 1,
                    model: modelUsed,
                    image_base64: generatedImageBase64,
                    image_url: `data:image/png;base64,${generatedImageBase64}`,
                };
            }),
        );

        return {
            success: true,
            message: 'Imagen publicitaria de catalogo generada exitosamente',
            modelo: images[0]?.model || 'Gemini',
            modelos_usados: {
                analisis: analysisModelUsed,
                refinado: refineModelUsed,
                generacion: images[0]?.model || null,
            },
            timestamp: new Date().toISOString(),
            whatsapp: normalizedWhatsapp,
            prompt_final: refinedPrompt,
            count: safeCount,
            images,
            image_base64: images[0]?.image_base64 || null,
            image_url: images[0]?.image_url || null,
        };
    }

    // Delete a registration code
    async deleteCode(codeId: string) {
        const code = await this.prisma.registrationCode.findUnique({
            where: { id: codeId },
        });

        if (!code) {
            throw new NotFoundException('CÃ³digo no encontrado');
        }

        if (code.isUsed) {
            throw new BadRequestException('No se puede eliminar un cÃ³digo que ya fue utilizado');
        }

        return this.prisma.registrationCode.delete({
            where: { id: codeId },
        });
    }
}

