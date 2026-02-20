# API de DKO para Bot n8n (Consulta de Productos)

Este documento resume lo necesario para que un bot en n8n consulte productos (disponibilidad, descripcion, imagenes, precio, etc.).

## 1. Modelo de datos del producto

### 1.1 Modelo interno (`Product` en base de datos)

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "barcode": "string | null",
  "sku": "string | null",
  "images": ["url1", "url2"],
  "costPrice": "decimal",
  "salePrice": "decimal",
  "isPublic": true,
  "isSellable": true,
  "active": true,
  "tenantId": "uuid",
  "categoryId": "uuid | null",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### 1.2 Campos utiles para bot (equivalencia)

```json
{
  "id": "id",
  "nombre": "name",
  "descripcion": "description",
  "precio": "price",
  "stock": "stock",
  "imagenes": "images",
  "categoria": "category.name"
}
```

## 2. Endpoint de busqueda para n8n (nuevo)

Endpoint recomendado:

- `GET /integrations/n8n/products`

Headers requeridos:

- `x-api-key: <N8N_INTEGRATION_API_KEY>`
- `x-tenant-id: <TENANT_ID>`

Query params:

- `q` (opcional): busqueda por nombre, descripcion, sku o barcode
- `barcode` (opcional): busqueda exacta por codigo de barras
- `categoryId` (opcional): filtra categoria
- `onlyAvailable` (opcional): `true|false` (default `true`)
- `limit` (opcional): 1 a 50 (default 10)

Ejemplo:

```http
GET /integrations/n8n/products?q=sofa&onlyAvailable=true&limit=5
x-api-key: ********
x-tenant-id: 0d7b3ab8-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 3. Respuesta del endpoint

### 3.1 Cuando encuentra productos

```json
{
  "tenantId": "0d7b3ab8-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "count": 2,
  "products": [
    {
      "id": "uuid",
      "name": "Sofa Cama",
      "description": "Tela gris",
      "barcode": "PRD-AB12CD34",
      "sku": "SOFA-001",
      "images": ["https://..."],
      "price": 850,
      "stock": 7,
      "available": true,
      "category": {
        "id": "uuid",
        "name": "Sofas"
      }
    }
  ]
}
```

### 3.2 Cuando no encuentra

```json
{
  "tenantId": "0d7b3ab8-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "count": 0,
  "products": []
}
```

### 3.3 Errores comunes

API key invalida o faltante (401):

```json
{
  "statusCode": 401,
  "message": "Invalid API key",
  "error": "Unauthorized"
}
```

Falta `x-tenant-id` (400):

```json
{
  "statusCode": 400,
  "message": "x-tenant-id header is required",
  "error": "Bad Request"
}
```

## 4. URL base de la API

No hay URL fija hardcodeada en el backend.

- Local: `http://localhost:3000`
- Produccion: la URL de tu despliegue (Railway/Render/VPS/etc.)

En n8n define:

- `DKO_API_BASE_URL=https://tu-backend.com`

## 5. Configuracion necesaria en backend

Variable de entorno nueva:

- `N8N_INTEGRATION_API_KEY=tu_clave_larga_y_segura`

## 6. Flujo sugerido en n8n

1. Nodo `HTTP Request` a `GET {{$env.DKO_API_BASE_URL}}/integrations/n8n/products`.
2. En headers enviar `x-api-key` y `x-tenant-id`.
3. En query enviar `q` (o `barcode`) y `onlyAvailable=true`.
4. Responder al usuario con el primer producto o una lista corta.
