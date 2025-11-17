# 🔍 DEBUG - Cómo revisar los problemas del agente

## 1. **VER LOGS EN VERCEL**

### Opción A: Vercel CLI
```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Ver logs en tiempo real
vercel logs tu-proyecto --follow

# Ver logs de los últimos 100 requests
vercel logs tu-proyecto --limit=100
```

### Opción B: Vercel Dashboard
1. Ir a https://vercel.com/dashboard
2. Click en tu proyecto
3. Tab "Functions" 
4. Click en cualquier función (process, chat, health)
5. Ver "Logs" tab

## 2. **ENDPOINTS DE DEBUG**

### Health Check Completo
```bash
curl https://tu-dominio.vercel.app/api/health
```

**¿Qué revisar?**
- `all_env_vars_configured: true` ✅
- `openai.configured: true` ✅  
- `mcp_google_drive.configured: true` ✅

### Test Manual del Process
```bash
curl -X POST https://tu-dominio.vercel.app/api/process \
  -H "Content-Type: application/json" \
  -d '{"transcripcion":"José Pablo García, boda unicornio, marzo 2026, La Florida"}' \
  -v
```

### Test Manual del Chat
```bash
# 1. Iniciar sesión
curl -X POST https://tu-dominio.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"debug123","action":"start"}' \
  -v

# 2. Enviar mensaje
curl -X POST https://tu-dominio.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"debug123","message":"Necesito un contrato","documentType":"contrato_base","action":"continue"}' \
  -v
```

## 3. **POSIBLES PROBLEMAS**

### A. Variables de Entorno
```bash
# En Vercel Dashboard → Settings → Environment Variables
# Verificar que tienes:
OPENAI_API_KEY=sk-proj-...    # ✅ Debe empezar con sk-proj- o sk-
MCP_ENDPOINT=https://mcp.zapier.com/api/mcp/mcp    # ✅ Exacto
MCP_API_KEY=client_id:secret  # ✅ Formato correcto
DRIVE_FOLDER_ID=1234567890    # ✅ Solo el ID, sin URL
```

### B. OpenAI API Key
```bash
# Probar que tu API key funciona
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer TU_API_KEY"

# Si falla: API key incorrecta o sin créditos
```

### C. MCP Zapier
```bash
# Probar endpoint MCP directamente
curl -X POST https://mcp.zapier.com/api/mcp/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_MCP_API_KEY" \
  -d '{"accion":"test"}' \
  -v

# Si falla 401: MCP_API_KEY incorrecta
# Si falla 404: MCP_ENDPOINT incorrecto
```

## 4. **DEBUGGING PASO A PASO**

### Paso 1: Verificar Health
```javascript
fetch('/api/health').then(r => r.json()).then(console.log)
```

### Paso 2: Test Process Simple
```javascript
fetch('/api/process', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    transcripcion: "José Pablo García necesita un contrato para boda unicornio en marzo 2026"
  })
}).then(r => r.json()).then(console.log)
```

### Paso 3: Ver Errores en Network Tab
1. F12 → Network tab
2. Hacer request
3. Click en request fallido
4. Ver "Response" tab para error completo

## 5. **ERRORES COMUNES Y SOLUCIONES**

### Error: "Missing environment variables"
**Solución:** Configurar variables en Vercel Dashboard

### Error: "Invalid API key"
**Solución:** Verificar OPENAI_API_KEY en Vercel

### Error: "Authentication failed" (MCP)
**Solución:** Verificar MCP_API_KEY formato `client_id:secret`

### Error: "Document creation failed"
**Solución:** Verificar DRIVE_FOLDER_ID y permisos

### Sin respuesta del chat
**Solución:** Ver logs de la función `api/chat` en Vercel

### Chat responde pero no genera documento
**Solución:** Ver logs de MCP call en función `api/chat`

## 6. **COMANDO RÁPIDO DE DEBUG**

Guarda esto en un archivo `debug-test.js`:

```javascript
async function debugAgent(baseUrl) {
  console.log('🔍 DEBUGGING AGENTE...');
  
  // 1. Health check
  console.log('\n1️⃣ Health Check:');
  const health = await fetch(`${baseUrl}/api/health`).then(r => r.json());
  console.log('ENV configurado:', health.configuration?.all_env_vars_configured);
  console.log('OpenAI:', health.integrations?.openai?.configured);
  console.log('MCP:', health.integrations?.mcp_google_drive?.configured);
  
  // 2. Process test
  console.log('\n2️⃣ Process Test:');
  const process = await fetch(`${baseUrl}/api/process`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      transcripcion: "José Pablo García, boda unicornio, marzo 2026, La Florida"
    })
  }).then(r => r.json());
  console.log('Resultado:', process);
  
  return { health, process };
}

// Usar: debugAgent('https://tu-dominio.vercel.app')
```

---

**💡 PRÓXIMO PASO:** Ejecuta el health check y compárteme el resultado completo.