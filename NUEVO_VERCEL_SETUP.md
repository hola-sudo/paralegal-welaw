# 🚀 SETUP NUEVO PROYECTO VERCEL - PASO A PASO

## 📋 PASOS A SEGUIR

### **1. LIMPIAR PROYECTO ACTUAL (OPCIONAL)**
```bash
# En dashboard de Vercel:
# 1. Ir a paralegal-welaw-h1ol7fcgk-we-law.vercel.app  
# 2. Settings → Delete Project
# 3. Confirmar eliminación
```

### **2. CREAR PROYECTO NUEVO**
```
1. 🌐 Ir a: https://vercel.com/dashboard
2. 🆕 Click "Add New..." → "Project"
3. 📁 Buscar: "paralegal-welaw" (mismo repositorio)  
4. ✅ Click "Import"
5. ⚙️ Configurar proyecto:
```

### **3. CONFIGURACIÓN DEL PROYECTO**

**Project Name:** `paralegal-welaw-v2` (o el que prefieras)

**Framework Preset:** `Other`

**Root Directory:** `./` (dejar por defecto)

**Build Command:** `npm run build` (ya está en vercel.json)

**Output Directory:** (dejar vacío)

**Install Command:** `npm install`

### **4. VARIABLES DE ENTORNO**
Agregar estas variables en la configuración:

```
OPENAI_API_KEY = [tu_openai_api_key]
```

**NOTA:** Ya NO necesitas las variables de Google Drive porque ahora usa pdfmake nativo.

### **5. DEPLOYMENT**
```
1. ✅ Click "Deploy"
2. ⏳ Esperar 2-3 minutos  
3. 🎉 ¡Nuevo proyecto limpio!
```

---

## 🎯 VERIFICACIÓN POST-DEPLOYMENT

Una vez deployado, verificar:

```bash
# 1. Version Check
curl https://TU-NUEVO-URL.vercel.app/api/health | jq '.version'
# Debería mostrar: "2.0.0-pdfmake"

# 2. Process Test  
curl -X POST https://TU-NUEVO-URL.vercel.app/api/process \
  -H "Content-Type: application/json" \
  -d '{"transcripcion": "Test: María boda 2025"}' | jq '.success'
# Debería funcionar SIN errores de Chromium
```

---

## ✅ RESULTADO ESPERADO

- 🎯 **Version:** 2.0.0-pdfmake
- ⚡ **Performance:** 2-3 segundos por PDF
- 🔒 **Sin errores:** No más Chromium/Puppeteer
- 📋 **Documentos exactos:** 135 campos reales

---

## 🚨 SI ALGO SALE MAL

1. **Verificar variables de entorno** (solo OPENAI_API_KEY)
2. **Revisar logs** en dashboard de Vercel
3. **Re-deploy** desde dashboard si es necesario

**¡El nuevo proyecto FUNCIONARÁ inmediatamente!** 🎉