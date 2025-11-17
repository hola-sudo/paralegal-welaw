# 📚 API Documentation - Agente Paralegal

## 🔗 **BASE URL**
```
Production: https://tu-dominio.vercel.app
Development: http://localhost:3000
```

## 📋 **ENDPOINTS**

### 1. Health Check
```http
GET /api/health
```

**Descripción**: Verifica el estado del servicio y configuración

**Respuesta 200 - Success:**
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
  "endpoints": {
    "health": {
      "method": "GET",
      "path": "/api/health",
      "description": "Health check and configuration status"
    },
    "process": {
      "method": "POST",
      "path": "/api/process",
      "description": "Process legal document transcription",
      "required_fields": ["transcripcion"],
      "response_time_avg": "5-15 seconds",
      "max_duration": "30 seconds"
    }
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

**Ejemplo cURL:**
```bash
curl -X GET https://tu-dominio.vercel.app/api/health \
  -H "Accept: application/json"
```

---

### 2. Process Transcription
```http
POST /api/process
```

**Descripción**: Procesa transcripciones de documentos legales y crea documentos en Google Drive

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "transcripcion": "CONTRATO DE PRESTACIÓN DE SERVICIOS\n\nEntre los suscritos:\n- PARTE 1: Empresa ABC S.A. de C.V..."
}
```

**Respuesta 200 - Success:**
```json
{
  "success": true,
  "tipo_documento": "contrato_base",
  "documento_creado": "https://docs.google.com/document/d/1234567890/edit",
  "datos_extraidos": {
    "parte_1_nombre": "Empresa ABC S.A. de C.V.",
    "parte_2_nombre": "Consultoría XYZ S.C.",
    "fecha_firma": "15/03/2024",
    "objeto_contrato": "Prestación de servicios de consultoría",
    "monto_total": "$500,000.00 MXN",
    "jurisdiccion": "Ciudad de México"
  },
  "guardrails": {
    "pii_warnings": [],
    "moderation_passed": true
  },
  "metadata": {
    "processed_at": "2024-01-15T10:30:00.000Z",
    "model_used": "gpt-4o"
  },
  "resumen": "¡Documento contrato_base procesado y creado exitosamente en Google Drive!"
}
```

**Respuesta 400 - Bad Request (Transcripción faltante):**
```json
{
  "error": "Falta transcripción en el cuerpo de la petición"
}
```

**Respuesta 400 - Bad Request (Contenido bloqueado):**
```json
{
  "error": "Contenido bloqueado por medidas de seguridad",
  "warnings": [
    "Se detectó posible RFC en el texto",
    "Se detectaron múltiples números de teléfono en el texto"
  ],
  "blocked": true
}
```

**Respuesta 500 - Server Error (Configuración):**
```json
{
  "error": "Configuración del servidor incompleta",
  "missing_vars": ["OPENAI_API_KEY", "MCP_API_KEY"]
}
```

**Respuesta 500 - Server Error (OpenAI):**
```json
{
  "error": "Invalid API key provided",
  "details": "Error trace (only in development)"
}
```

**Respuesta 500 - Server Error (Google Drive):**
```json
{
  "error": "Error al crear documento en Google Drive: Authentication failed"
}
```

**Ejemplo cURL:**
```bash
curl -X POST https://tu-dominio.vercel.app/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "transcripcion": "CONTRATO DE PRESTACIÓN DE SERVICIOS\n\nEntre los suscritos:\n- PARTE 1: Empresa ABC S.A. de C.V., representada por Juan Pérez\n- PARTE 2: Consultoría XYZ S.C., representada por María González\n\nFECHA DE FIRMA: 15/03/2024\nOBJETO DEL CONTRATO: Prestación de servicios de consultoría en tecnología"
  }'
```

---

## 📊 **CÓDIGOS DE ESTADO HTTP**

| Código | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Respuesta exitosa |
| 400 | Bad Request | Datos faltantes o contenido bloqueado |
| 405 | Method Not Allowed | Método HTTP incorrecto |
| 500 | Internal Server Error | Error del servidor o configuración |

---

## 🔧 **CONFIGURACIÓN MCP (Google Drive)**

### ¿Qué es MCP?
MCP (Model Context Protocol) es el protocolo de Zapier para conectar con aplicaciones externas como Google Drive.

### Variables requeridas:
```bash
MCP_ENDPOINT=https://mcp.zapier.com/api/mcp/mcp
MCP_API_KEY=tu_client_id:tu_secret_key
DRIVE_FOLDER_ID=1234567890abcdef
```

### Cómo obtener las credenciales:
1. Ir a [Zapier MCP Platform](https://docs.zapier.com/mcp/clients)
2. Crear un nuevo cliente MCP
3. Obtener client_id y secret
4. Combinar como: `client_id:secret`
5. Obtener ID de carpeta de Google Drive desde la URL

### Estructura de la llamada MCP:
```json
{
  "accion": "guardar",
  "template_name": "Contrato Base 3D Pixel Perfection - Plantilla",
  "folder_id": "1234567890abcdef",
  "replacements": {
    "parte_1_nombre": "Empresa ABC S.A.",
    "fecha_firma": "15/03/2024",
    "monto_total": "$500,000.00 MXN"
  }
}
```

---

## 🧪 **PRUEBAS LOCALES**

### 1. Configurar entorno local:
```bash
# Clonar e instalar
git clone tu-repo
cd paralegal-welaw
npm install

# Configurar variables (crear .env)
cp .env.example .env
# Editar .env con tus valores reales
```

### 2. Ejecutar en desarrollo:
```bash
# Compilar
npm run build

# Iniciar servidor de desarrollo
npm run dev

# En otra terminal, probar health
curl http://localhost:3000/api/health
```

### 3. Probar con datos reales:
```bash
# Prueba básica
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"transcripcion":"CONTRATO DE PRUEBA ENTRE PARTES"}'

# Prueba con documento completo
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d @test-contract.json
```

---

## 📈 **LÍMITES Y MONITOREO**

### Límites actuales:
- **Tamaño máximo**: 1MB por request
- **Timeout**: 30 segundos para /api/process
- **Rate limiting**: No configurado (recomendado para producción)
- **Concurrencia**: Limitada por plan de Vercel

### Monitoreo recomendado:
1. **Health checks**: GET /api/health cada 5 minutos
2. **Alertas**: Configurar en Vercel para errores 5xx
3. **Logs**: Revisar function logs en Vercel dashboard
4. **Métricas**: Tiempo de respuesta, tasa de éxito/error

### Logs importantes:
```bash
# Ver logs en Vercel
vercel logs tu-proyecto --follow

# Buscar errores específicos
vercel logs tu-proyecto --grep "Error"
```

---

## 🚨 **TROUBLESHOOTING COMÚN**

### Error: "Missing environment variables"
```bash
# Verificar en Vercel
vercel env ls

# Agregar variable faltante
vercel env add OPENAI_API_KEY
```

### Error: "Invalid API key"
```bash
# Verificar formato OpenAI key
echo $OPENAI_API_KEY | grep "sk-proj-"
```

### Error: "MCP Authentication failed"
```bash
# Verificar formato MCP key
echo $MCP_API_KEY | grep ":"
```

### Error: "Document creation failed"
```bash
# Verificar folder ID
curl "https://drive.google.com/drive/folders/$DRIVE_FOLDER_ID"
```

---

**Documentación completa actualizada** ✅