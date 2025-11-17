# 🔧 CONFIGURACIÓN COMPLETA MCP - 3D PIXEL PERFECTION

## 1. CREAR CUENTA Y PROYECTO MCP ZAPIER

### Paso 1: Registro en Zapier
1. Ve a https://zapier.com/
2. Crea cuenta o inicia sesión
3. Ve a https://zapier.com/app/developer
4. Click en "Create App"

### Paso 2: Crear App MCP
1. **App Name**: `3D Pixel Perfection Docs`
2. **App Description**: `Document generation for event rendering business`
3. **Category**: `File Management`
4. **Intended Audience**: `Private`

### Paso 3: Configurar Authentication
1. En tu app → Authentication
2. Seleccionar **API Key** authentication
3. **API Key**: Tu Google API Service Account JSON (completo)

## 2. GOOGLE DRIVE SETUP

### Paso 1: Crear Service Account
1. Ve a https://console.cloud.google.com/
2. Crear nuevo proyecto: `3d-pixel-docs`
3. Habilitar APIs:
   - Google Drive API
   - Google Docs API
4. Crear Service Account:
   - **Name**: `3d-pixel-service`
   - **Description**: `Service account for document generation`

### Paso 2: Generar Credenciales
1. Click en el service account creado
2. Tab "Keys" → "Add Key" → "Create New Key"
3. Seleccionar **JSON**
4. Descargar archivo (será algo como `3d-pixel-docs-xxxxx.json`)

### Paso 3: Compartir Carpeta con Service Account
1. En Google Drive, crear carpeta: `3D Pixel Perfection - Plantillas`
2. Click derecho → "Share"
3. Agregar el email del service account (está en el JSON)
4. Dar permisos de **Editor**
5. Copiar el **ID de la carpeta** desde la URL

## 3. SUBIR PLANTILLAS A GOOGLE DRIVE

### Nombres exactos requeridos:
```
📄 Contrato Base 3D Pixel Perfection - Plantilla.docx
📋 ANEXO A - Plantilla.docx
🎨 ANEXO B - Plantilla.docx
✏️ ANEXO C - Plantilla.docx
✅ ANEXO D - Plantilla.docx
```

### Formato de placeholders en las plantillas:
```
{{NOMBRE_CLIENTE}}
{{RFC_cliente}}
{{NOMBRE_EVENTO}}
{{FECHA_EVENTO}}
{{UBICACION}}
{{EVENTO}}
{{DD/MM/AAAA}}
{{HH:MM}}
```

## 4. CONFIGURAR MCP ZAPIER

### Paso 1: Crear Zap
1. En Zapier → Create Zap
2. **Trigger**: Webhooks by Zapier
3. **Event**: Catch Hook
4. **Action**: Google Docs
5. **Event**: Create Document from Template

### Paso 2: Configurar Webhook Trigger
1. **Webhook URL**: Copiar (será tu MCP_ENDPOINT)
2. **Request Method**: POST
3. **Headers**: Authorization required

### Paso 3: Configurar Google Docs Action
1. **Account**: Conectar tu cuenta Google
2. **Template Document**: Seleccionar plantilla base
3. **Destination Folder**: Tu carpeta de plantillas
4. **Replacements**: Mapear campos del webhook

### Paso 4: Activar Zap
1. Test & Review
2. Activar Zap
3. Copiar Webhook URL

## 5. OBTENER CREDENCIALES FINALES

### MCP_ENDPOINT
```
https://hooks.zapier.com/hooks/catch/XXXXXXX/YYYYYYY/
```
*Este es el webhook URL de tu Zap*

### MCP_API_KEY
```
usuario:contraseña
```
*O el API key que configuraste en authentication*

### DRIVE_FOLDER_ID
```
1AbCdEfGhIjKlMnOpQrStUvWxYz123456789
```
*Solo el ID, extraído de la URL de tu carpeta*

### GOOGLE_SERVICE_ACCOUNT (Opcional - para uso directo)
```json
{
  "type": "service_account",
  "project_id": "3d-pixel-docs",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "3d-pixel-service@3d-pixel-docs.iam.gserviceaccount.com",
  "client_id": "xxxxx"
}
```

## 6. VARIABLES DE ENTORNO VERCEL

```bash
OPENAI_API_KEY=sk-proj-tu-api-key-de-openai
MCP_ENDPOINT=https://hooks.zapier.com/hooks/catch/XXXXXXX/YYYYYYY/
MCP_API_KEY=tu-usuario:tu-contraseña
DRIVE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz123456789
```

## 7. ESTRUCTURA DE DATOS QUE ENVÍA EL AGENTE

### Para Contrato Base:
```json
{
  "accion": "guardar",
  "template_name": "Contrato Base 3D Pixel Perfection - Plantilla",
  "folder_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz123456789",
  "replacements": {
    "NOMBRE_CLIENTE": "José Pablo García",
    "RFC_cliente": "MEGP910319JT13",
    "NOMBRE_EVENTO": "Boda Unicornio",
    "FECHA_EVENTO": "15/03/2026",
    "UBICACION": "La Florida",
    "EVENTO": "Boda",
    "DD/MM/AAAA": "17/11/2025",
    "HH:MM": "18:00"
  }
}
```

## 8. ALTERNATIVA: MCP DIRECTO

Si prefieres usar MCP oficial en lugar de Zapier:

### MCP_ENDPOINT
```
https://mcp.zapier.com/api/mcp/mcp
```

### Configuración en Zapier Platform
1. Ve a https://developer.zapier.com/
2. Crear nueva app
3. Configurar MCP integration
4. Obtener client_id y client_secret

### MCP_API_KEY formato
```
client_id:client_secret
```

## 9. TESTING

### Test manual del webhook:
```bash
curl -X POST "TU_MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_MCP_API_KEY" \
  -d '{
    "accion": "test",
    "template_name": "Contrato Base 3D Pixel Perfection - Plantilla",
    "folder_id": "TU_FOLDER_ID",
    "replacements": {
      "NOMBRE_CLIENTE": "Test Cliente",
      "NOMBRE_EVENTO": "Test Evento"
    }
  }'
```

## 10. TROUBLESHOOTING COMÚN

### Error 401: Authentication failed
- Revisar MCP_API_KEY formato
- Verificar credenciales en Zapier

### Error 404: Template not found
- Verificar nombres exactos de plantillas
- Confirmar que están en la carpeta correcta

### Error 403: Permission denied
- Service account debe tener acceso a la carpeta
- Carpeta debe ser compartida con el service account

### [object Object] error
- Zapier retorna objeto de error
- Revisar logs de Zap para detalles específicos

---

## 🚀 RESUMEN DE PASOS CRÍTICOS

1. ✅ Crear proyecto Google Cloud + Service Account
2. ✅ Crear carpeta Google Drive + compartir con service account
3. ✅ Subir plantillas con nombres exactos
4. ✅ Crear Zap en Zapier (Webhook → Google Docs)
5. ✅ Configurar variables en Vercel
6. ✅ Test de conexión

**¿Por cuál paso quieres empezar?**