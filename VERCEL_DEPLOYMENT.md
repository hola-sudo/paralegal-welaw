# 🚀 Guía de Deployment en Vercel

## ✅ **PREREQUISITOS COMPLETADOS**

### Archivos de Configuración:
- ✅ `vercel.json` - Configuración optimizada para Vercel
- ✅ `.vercelignore` - Archivos excluidos del deployment
- ✅ `package.json` - Dependencias limpias y scripts correctos
- ✅ `api/process.ts` - API principal con CORS y validaciones
- ✅ `api/health.ts` - Health check endpoint

### Optimizaciones Implementadas:
- ✅ **CORS Headers** configurados globalmente
- ✅ **Variables de entorno** validadas en runtime
- ✅ **Timeout** configurado (30s para process, 10s para health)
- ✅ **Error handling** mejorado para producción
- ✅ **Health check** endpoint disponible

## 🔧 **PASOS PARA DEPLOYMENT**

### 1. Configurar Variables de Entorno en Vercel

Ir a tu proyecto en Vercel → Settings → Environment Variables y agregar:

```bash
OPENAI_API_KEY=sk-proj-tu-api-key-real
MCP_ENDPOINT=https://mcp.zapier.com/api/mcp/mcp
MCP_API_KEY=tu-mcp-api-key-real
DRIVE_FOLDER_ID=tu-folder-id-real
```

### 2. Deploy Automático
```bash
# Conectar repo con Vercel (una vez)
npx vercel --prod

# O via Git push (si ya está conectado)
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3. Verificar Deployment
```bash
# Health check
curl https://tu-dominio.vercel.app/api/health

# Test API
curl -X POST https://tu-dominio.vercel.app/api/process \
  -H "Content-Type: application/json" \
  -d '{"transcripcion":"CONTRATO DE PRUEBA..."}'
```

## 🧪 **ENDPOINTS DISPONIBLES**

### Health Check
```
GET /api/health
```
**Respuesta completa:**
```json
{
  "status": "ok",
  "service": "Agente Paralegal API",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "uptime": 3600.5,
  "configuration": {
    "all_env_vars_configured": true,
    "details": {
      "OPENAI_API_KEY": true,
      "MCP_ENDPOINT": true,
      "MCP_API_KEY": true,
      "DRIVE_FOLDER_ID": true
    },
    "mcp_endpoint_configured": true,
    "drive_integration_ready": true
  },
  "limits": {
    "max_request_size": "1MB",
    "max_response_time": "30 seconds",
    "rate_limiting": "None (configure in production)"
  },
  "integrations": {
    "openai": {
      "configured": true,
      "models_used": ["gpt-4o"]
    },
    "mcp_google_drive": {
      "configured": true,
      "endpoint": "Configured"
    }
  }
}
```

### Procesar Transcripción
```
POST /api/process
Content-Type: application/json
```
**Body:**
```json
{
  "transcripcion": "CONTRATO DE PRESTACIÓN DE SERVICIOS\n\nEntre los suscritos:\n- PARTE 1: Empresa ABC S.A. de C.V..."
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "tipo_documento": "contrato_base",
  "documento_creado": "https://docs.google.com/document/d/1234567890/edit",
  "datos_extraidos": {
    "parte_1_nombre": "Empresa ABC S.A. de C.V.",
    "fecha_firma": "15/03/2024",
    "objeto_contrato": "Prestación de servicios de consultoría"
  },
  "guardrails": {
    "pii_warnings": [],
    "moderation_passed": true
  },
  "metadata": {
    "processed_at": "2024-01-15T10:30:00.000Z",
    "model_used": "gpt-4o"
  }
}
```

**Errores posibles:**
- **400**: Transcripción faltante o contenido bloqueado
- **500**: Variables de entorno faltantes o errores de integración

### Demo Interface
```
GET /
```
Interface HTML para probar la API con ejemplos predefinidos

## ⚠️ **VERIFICACIONES FINALES**

### Antes del Deploy:
- [ ] Variables de entorno configuradas en Vercel
- [ ] API Keys válidas (OpenAI, MCP)
- [ ] Folder ID de Google Drive correcto

### Después del Deploy:
- [ ] `/api/health` responde 200 OK
- [ ] `/api/health` muestra `all_env_vars_configured: true`
- [ ] `/api/process` procesa transcripciones correctamente
- [ ] `/` muestra la interface de demo

## 🔧 **INFORMACIÓN DETALLADA MCP**

### ¿Qué es MCP?
MCP (Model Context Protocol) es el protocolo oficial de Zapier para conectar aplicaciones externas como Google Drive, permitiendo crear y modificar documentos automáticamente.

### Configuración MCP paso a paso:
1. **Ir a Zapier MCP Platform**: https://docs.zapier.com/mcp/clients
2. **Crear cliente MCP**:
   - Registrar nueva aplicación
   - Obtener `client_id` y `client_secret`
3. **Configurar variables**:
   ```bash
   MCP_ENDPOINT=https://mcp.zapier.com/api/mcp/mcp
   MCP_API_KEY=tu_client_id:tu_client_secret
   DRIVE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
   ```
4. **Obtener DRIVE_FOLDER_ID**:
   - Ir a Google Drive
   - Crear carpeta para plantillas
   - Copiar ID desde URL: `drive.google.com/drive/folders/[ESTE_ES_EL_ID]`

### Estructura de plantillas esperada:
El sistema busca estos archivos en tu carpeta de Google Drive:
- `Contrato Base 3D Pixel Perfection - Plantilla`
- `ANEXO A - Plantilla`
- `ANEXO B - Plantilla`
- `ANEXO C - Plantilla`
- `ANEXO D - Plantilla`

### Ejemplo de llamada MCP:
```json
{
  "accion": "guardar",
  "template_name": "Contrato Base 3D Pixel Perfection - Plantilla",
  "folder_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  "replacements": {
    "parte_1_nombre": "Empresa ABC S.A. de C.V.",
    "parte_2_nombre": "Consultoría XYZ S.C.",
    "fecha_firma": "15/03/2024",
    "monto_total": "$500,000.00 MXN"
  }
}
```

## 🧪 **PRUEBAS LOCALES DETALLADAS**

### 1. Setup inicial:
```bash
# Clonar repositorio
git clone tu-repositorio-url
cd paralegal-welaw

# Instalar dependencias
npm install

# Verificar instalación
npm run pre-deploy
```

### 2. Configurar entorno local:
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores reales
nano .env
```

Contenido de `.env`:
```bash
OPENAI_API_KEY=sk-proj-tu-api-key-real
MCP_ENDPOINT=https://mcp.zapier.com/api/mcp/mcp
MCP_API_KEY=tu_client_id:tu_secret_real
DRIVE_FOLDER_ID=tu_folder_id_real
```

### 3. Probar compilación:
```bash
# Compilar TypeScript
npm run build

# Verificar que no hay errores
echo $?  # Debe mostrar 0
```

### 4. Pruebas con datos reales:
```bash
# Iniciar servidor local (si tienes uno configurado)
npm run dev &

# Esperar unos segundos y probar health
curl http://localhost:3000/api/health

# Probar con transcripción básica
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"transcripcion":"CONTRATO DE PRUEBA ENTRE PARTES A Y B"}'
```

### 5. Validar integración MCP:
```bash
# Crear archivo de test
cat > test-contract.json << EOF
{
  "transcripcion": "CONTRATO DE PRESTACIÓN DE SERVICIOS\n\nEntre los suscritos:\n- PARTE 1: Empresa ABC S.A. de C.V., representada por Juan Pérez\n- PARTE 2: Consultoría XYZ S.C., representada por María González\n\nFECHA DE FIRMA: 15/03/2024\nFECHA DE INICIO: 01/04/2024\nOBJETO DEL CONTRATO: Prestación de servicios de consultoría en tecnología\nMONTO TOTAL: $500,000.00 MXN"
}
EOF

# Ejecutar test completo
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d @test-contract.json
```

## 📊 **SCRIPT PRE-DEPLOY DOCUMENTADO**

El script `npm run pre-deploy` ejecuta las siguientes verificaciones:

### Archivos requeridos:
- ✅ `vercel.json` - Configuración de deployment
- ✅ `package.json` - Dependencias y scripts
- ✅ `api/process.ts` - Endpoint principal
- ✅ `api/health.ts` - Health check
- ✅ `public/index.html` - Interface demo
- ✅ `src/agent.ts` - Lógica principal
- ✅ `src/schemas.ts` - Validaciones Zod
- ✅ `src/classification.ts` - Clasificación GPT-4o
- ✅ `src/guardrails.ts` - Seguridad PII/moderación

### Dependencias verificadas:
- **Producción**: `@openai/agents`, `openai`, `zod`
- **Desarrollo**: `@vercel/node`, `typescript`

### Configuraciones validadas:
- **Functions**: Timeouts y configuración correcta (30s process, 10s health)
- **CORS**: Headers configurados globalmente para /api/*
- **Rewrites**: Configuración moderna de Vercel (sin routes)

### Comandos post-deployment sugeridos:
```bash
# Health check inmediato
curl https://tu-dominio.vercel.app/api/health

# Test básico de funcionalidad
curl -X POST https://tu-dominio.vercel.app/api/process \
  -H "Content-Type: application/json" \
  -d '{"transcripcion":"CONTRATO DE PRUEBA"}'

# Monitoreo de logs
vercel logs tu-proyecto --follow
```

## 🔍 **TROUBLESHOOTING**

### Error 500 - Variables de entorno
```json
{
  "error": "Configuración del servidor incompleta",
  "missing_vars": ["OPENAI_API_KEY"]
}
```
**Solución**: Verificar variables en Vercel Settings

### Error 400 - Guardrails
```json
{
  "error": "Contenido bloqueado por medidas de seguridad",
  "blocked": true
}
```
**Solución**: Normal, contenido inapropiado detectado

### Error 500 - OpenAI API
```json
{
  "error": "Invalid API key"
}
```
**Solución**: Verificar OPENAI_API_KEY en Vercel

### Error 500 - MCP
```json
{
  "error": "Error al crear documento en Google Drive"
}
```
**Solución**: Verificar MCP_ENDPOINT, MCP_API_KEY y DRIVE_FOLDER_ID

## 🎯 **DOMAINS & URLs**

Después del deployment, tu API estará disponible en:
- **Production**: `https://tu-proyecto.vercel.app`
- **Preview**: `https://tu-proyecto-hash.vercel.app` (para branches)

---
*Configuración lista para deployment en Vercel* ✅