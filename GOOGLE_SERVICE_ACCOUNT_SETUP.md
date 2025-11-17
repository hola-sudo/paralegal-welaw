# 🔧 CONFIGURACIÓN GOOGLE SERVICE ACCOUNT - GUÍA EXACTA

## PASO 1: CREAR PROYECTO EN GOOGLE CLOUD CONSOLE

### 1.1 Ir a Google Cloud Console
- Ve a: **https://console.cloud.google.com/**
- Inicia sesión con tu cuenta de Google

### 1.2 Crear nuevo proyecto
1. Click en el **dropdown del proyecto** (arriba izquierda, junto al logo de Google Cloud)
2. Click en **"NEW PROJECT"**
3. **Project name**: `3d-pixel-perfection-docs`
4. **Organization**: Dejar en blanco o seleccionar tu organización
5. Click **"CREATE"**
6. **Esperar 1-2 minutos** hasta que aparezca el proyecto

### 1.3 Seleccionar el proyecto
1. Click en el **dropdown del proyecto** nuevamente
2. Seleccionar **"3d-pixel-perfection-docs"**
3. Verificar que aparece el nombre del proyecto en la barra superior

---

## PASO 2: HABILITAR APIs REQUERIDAS

### 2.1 Ir a APIs & Services
- En el menú hamburguesa (☰) → **"APIs & Services"** → **"Library"**
- O ir directo a: **https://console.cloud.google.com/apis/library**

### 2.2 Habilitar Google Drive API
1. En el buscador escribir: **"Google Drive API"**
2. Click en **"Google Drive API"**
3. Click en **"ENABLE"**
4. Esperar a que se habilite (aparece checkmark verde)

### 2.3 Habilitar Google Docs API  
1. Click en **"← Back to Library"** (o usar navegador back)
2. En el buscador escribir: **"Google Docs API"**
3. Click en **"Google Docs API"**
4. Click en **"ENABLE"**
5. Esperar a que se habilite

### 2.4 Verificar APIs habilitadas
- Ir a: **APIs & Services → Enabled APIs**
- Deberías ver:
  - ✅ Google Drive API
  - ✅ Google Docs API

---

## PASO 3: CREAR SERVICE ACCOUNT

### 3.1 Ir a Service Accounts
- En el menú: **APIs & Services → Credentials**
- O ir a: **https://console.cloud.google.com/apis/credentials**

### 3.2 Crear Service Account
1. Click en **"+ CREATE CREDENTIALS"**
2. Seleccionar **"Service account"**

### 3.3 Configurar Service Account - Página 1
- **Service account name**: `3d-pixel-service`
- **Service account ID**: Se genera automático: `3d-pixel-service@3d-pixel-perfection-docs.iam.gserviceaccount.com`
- **Description**: `Service account para generación automática de documentos de eventos`
- Click **"CREATE AND CONTINUE"**

### 3.4 Configurar permisos - Página 2
- **Select a role**: Seleccionar **"Editor"**
  - Path: IAM → Basic → Editor
- Click **"CONTINUE"**

### 3.5 Finalizar - Página 3
- **Grant users access**: Dejar en blanco
- Click **"DONE"**

### 3.6 Descargar JSON Key
1. En la lista de Service Accounts, click en **`3d-pixel-service@...`**
2. Ir a la pestaña **"KEYS"**
3. Click **"ADD KEY"** → **"Create new key"**
4. Seleccionar **"JSON"**
5. Click **"CREATE"**
6. **Se descarga automáticamente** un archivo .json
7. **GUARDAR ESTE ARCHIVO** - lo necesitarás para Vercel

### 3.7 Copiar email del Service Account
- **Copiar este email**: `3d-pixel-service@3d-pixel-perfection-docs.iam.gserviceaccount.com`
- **LO NECESITAS PARA EL PASO 4**

---

## PASO 4: COMPARTIR CARPETA DE GOOGLE DRIVE

### 4.1 Ir a tu carpeta de plantillas
- Ve a: **https://drive.google.com/**
- Navega a tu carpeta: **"3D Pixel Perfection - Plantillas"**
- Si no existe, créala primero

### 4.2 Compartir carpeta con Service Account
1. **Click derecho** en la carpeta
2. Seleccionar **"Share"**
3. En **"Add people and groups"**:
   - Pegar: `3d-pixel-service@3d-pixel-perfection-docs.iam.gserviceaccount.com`
4. **Permission level**: **"Editor"**
5. **Desmarcar**: "Notify people" (no marcar la casilla)
6. Click **"Send"**

### 4.3 Obtener ID de la carpeta
1. **Abrir la carpeta** (doble click)
2. **Copiar la URL** de la barra del navegador
3. La URL será algo como: `https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz123456789`
4. **Copiar solo la parte final**: `1AbCdEfGhIjKlMnOpQrStUvWxYz123456789`
5. **ESTE ES TU DRIVE_FOLDER_ID**

### 4.4 Verificar plantillas en la carpeta
Asegúrate de que tienes estos archivos exactos:
- ✅ `Contrato Base 3D Pixel Perfection - Plantilla.docx`
- ✅ `ANEXO A - Plantilla.docx`  
- ✅ `ANEXO B - Plantilla.docx`
- ✅ `ANEXO C - Plantilla.docx`
- ✅ `ANEXO D - Plantilla.docx`

---

## PASO 5: CONFIGURAR VARIABLES EN VERCEL

### 5.1 Abrir el archivo JSON descargado
1. **Abrir** el archivo .json que descargaste en el Paso 3.6
2. **Copiar TODO el contenido** (es un JSON largo)
3. **Ejemplo** del contenido:
```json
{
  "type": "service_account",
  "project_id": "3d-pixel-perfection-docs",
  "private_key_id": "abcd1234...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...",
  "client_email": "3d-pixel-service@3d-pixel-perfection-docs.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### 5.2 Ir a Vercel Dashboard
- Ve a: **https://vercel.com/dashboard**
- Click en tu proyecto: **"paralegal-welaw"**

### 5.3 Ir a Environment Variables
- Click en **"Settings"**
- Click en **"Environment Variables"**

### 5.4 ELIMINAR variables MCP antiguas
**Eliminar estas si existen:**
- ❌ `MCP_ENDPOINT`
- ❌ `MCP_API_KEY`

### 5.5 AGREGAR nuevas variables

**Variable 1:**
- **Name**: `GOOGLE_SERVICE_ACCOUNT_KEY`
- **Value**: **PEGAR TODO EL JSON** del archivo descargado
- **Environments**: ✅ Production ✅ Preview ✅ Development
- Click **"Save"**

**Variable 2:**
- **Name**: `DRIVE_FOLDER_ID`
- **Value**: El ID que copiaste en el Paso 4.3 (ej: `1AbCdEfGhIjKlMnOpQrStUvWxYz123456789`)
- **Environments**: ✅ Production ✅ Preview ✅ Development  
- Click **"Save"**

**Variable 3 (verificar que existe):**
- **Name**: `OPENAI_API_KEY`
- **Value**: Tu API key de OpenAI (debe existir ya)
- Si no existe, agregarla

### 5.6 Verificar variables finales
Deberías tener exactamente **3 variables**:
- ✅ `GOOGLE_SERVICE_ACCOUNT_KEY` - JSON completo
- ✅ `DRIVE_FOLDER_ID` - ID de carpeta  
- ✅ `OPENAI_API_KEY` - API key de OpenAI

---

## PASO 6: REDEPLOY Y PROBAR

### 6.1 Forzar redeploy
- En Vercel Dashboard → tu proyecto
- Click en **"Deployments"**
- Click en **"..."** del último deployment
- Click **"Redeploy"**

### 6.2 Esperar deployment
- **Esperar 1-2 minutos** hasta que aparezca "Ready"

### 6.3 Probar health check
- Ve a: `https://tu-dominio.vercel.app/api/health`
- **Deberías ver** algo como:
```json
{
  "status": "ok",
  "configuration": {
    "all_env_vars_configured": true,
    "google_drive_configured": true
  }
}
```

### 6.4 PROBAR EL AGENTE COMPLETO
- Ve a: `https://tu-dominio.vercel.app/`
- Probar con tu transcripción original
- **Debería crear un documento REAL en Google Drive**

---

## ✅ CHECKLIST FINAL

Antes de probar, verificar:
- [ ] Proyecto creado en Google Cloud Console
- [ ] Google Drive API habilitada
- [ ] Google Docs API habilitada  
- [ ] Service Account creado
- [ ] JSON key descargado
- [ ] Carpeta compartida con service account
- [ ] DRIVE_FOLDER_ID copiado correctamente
- [ ] Variables configuradas en Vercel
- [ ] Redeploy realizado
- [ ] Health check responde OK

---

## 🚨 TROUBLESHOOTING

### Error: "Service account key not found"
- Verificar que `GOOGLE_SERVICE_ACCOUNT_KEY` está configurada
- Verificar que el JSON es válido (completo, sin caracteres extra)

### Error: "Permission denied"  
- Verificar que la carpeta está compartida con el service account
- Verificar que el permission level es "Editor"

### Error: "Folder not found"
- Verificar que `DRIVE_FOLDER_ID` es correcto
- Verificar que copiaste solo el ID, no toda la URL

### Error: "Template not found"
- Verificar nombres exactos de las plantillas
- Verificar que están en la carpeta compartida

---

## 🎯 RESULTADO ESPERADO

**Después de completar todos los pasos:**
- ✅ Tu agente creará documentos REALES en Google Drive
- ✅ Los placeholders {{}} serán reemplazados con datos reales  
- ✅ Recibirás URLs directas a documentos creados
- ✅ Todo funcionará sin dependencia de MCP/Zapier

**¡El agente estará 100% funcional con Google Drive API directo!**