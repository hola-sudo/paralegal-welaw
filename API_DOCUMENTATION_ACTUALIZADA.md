# 📖 API Documentation - Agente Paralegal 3D Pixel Perfection

**Versión:** 2.0.0-pdfmake  
**Base URL:** https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app  
**Estado:** Producción ✅

---

## 🚀 **Endpoints Disponibles**

### **1. Chat Conversacional**
Endpoint principal para interactuar con el agente paralegal.

```http
POST /api/agentkit-chat
```

#### **Request:**
```json
{
  "message": "Descripción del evento o solicitud del cliente",
  "conversationId": "opcional_id_de_conversacion"
}
```

#### **Response exitosa:**
```json
{
  "success": true,
  "response": "Respuesta conversacional del agente",
  "conversationId": "conv_1732042519557",
  "documentType": "anexo_a",
  "progress": {
    "step": "Recopilando especificaciones técnicas",
    "completionRate": 35,
    "missingFields": 40
  },
  "pdfGenerated": false,
  "pdfData": null,
  "needsInput": true,
  "metadata": {
    "timestamp": "2024-11-18T20:05:19.557Z",
    "agentVersion": "ConversationalAgent-v2.0",
    "processingTime": "Sub-5-seconds"
  }
}
```

#### **Response con PDF generado:**
```json
{
  "success": true,
  "response": "¡PDF ANEXO_A generado exitosamente! Descarga disponible.",
  "conversationId": "conv_1732042519557",
  "documentType": "anexo_a",
  "progress": {
    "step": "Documento generado exitosamente",
    "completionRate": 100,
    "missingFields": 0
  },
  "pdfGenerated": true,
  "pdfData": {
    "base64": "JVBERi0xLjMKJf////8KOCAwIG9iago8PAov...",
    "fileName": "anexo_a_1732042519557.pdf",
    "size": 45632
  },
  "needsInput": false,
  "metadata": {
    "timestamp": "2024-11-18T20:05:19.557Z",
    "agentVersion": "ConversationalAgent-v2.0",
    "processingTime": "Sub-5-seconds"
  }
}
```

### **2. Health Check**
Verificación del estado del sistema y configuración.

```http
GET /api/health
```

#### **Response:**
```json
{
  "status": "ok",
  "service": "Agente Paralegal API",
  "version": "2.0.0-pdfmake",
  "timestamp": "2024-11-18T20:05:19.557Z",
  "environment": "production",
  "uptime": 1532.450494086,
  "configuration": {
    "all_env_vars_configured": true,
    "details": {
      "OPENAI_API_KEY": true
    },
    "architecture": "Native PDF generation (pdfmake)",
    "pdf_generator": "Direct generation - no external storage"
  },
  "endpoints": {
    "health": {
      "method": "GET",
      "path": "/api/health",
      "description": "Health check and configuration status"
    },
    "chat": {
      "method": "POST", 
      "path": "/api/agentkit-chat",
      "description": "Main conversational endpoint"
    }
  }
}
```

---

## 📊 **Tipos de Documentos**

El sistema clasifica automáticamente en 5 tipos:

| Tipo | Descripción | Uso Principal |
|------|-------------|---------------|
| `contrato_base` | Contrato principal | Acuerdo general entre 3D Pixel Perfection y cliente |
| `anexo_a` | Especificaciones técnicas | Insumos detallados para renders (61 campos) |
| `anexo_b` | Renders y visuales | Especificaciones de renderizado y temas |
| `anexo_c` | Control de cambios | Gestión de revisiones y modificaciones |
| `anexo_d` | Entrega final | Autorización de pago y cierre (21 campos) |

---

## 💬 **Flujo de Conversación**

### **Paso 1: Iniciar conversación**
```bash
curl -X POST https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app/api/agentkit-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, necesito decoración para mi boda el 25 de diciembre"
  }'
```

### **Paso 2: Continuar con más información**
```bash
curl -X POST https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app/api/agentkit-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "El salón mide 15x20 metros y esperamos 150 invitados",
    "conversationId": "conv_1732042519557"
  }'
```

### **Paso 3: Completar información hasta generar PDF**
El agente mantendrá la conversación hasta recopilar todos los campos necesarios y generará automáticamente el PDF correspondiente.

---

## 🔧 **Códigos de Estado**

| Código | Descripción | Acción |
|--------|-------------|--------|
| `200` | Éxito | Conversación procesada correctamente |
| `400` | Error de solicitud | Verificar formato JSON y campos requeridos |
| `405` | Método no permitido | Usar POST para /agentkit-chat, GET para /health |
| `500` | Error interno | Verificar configuración de OPENAI_API_KEY |

---

## 🛡️ **Medidas de Seguridad**

### **Guardrails Automáticos:**
- ✅ **PII Detection:** Identifica CURP, RFC, tarjetas de crédito
- ✅ **Content Moderation:** Bloquea contenido inapropiado
- ✅ **Rate Limiting:** Previene abuso del sistema
- ✅ **Input Validation:** Valida estructura de requests

### **Headers de Seguridad:**
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📝 **Ejemplos de Uso**

### **JavaScript/Node.js:**
```javascript
async function solicitarEvento(descripcion) {
  const response = await fetch('https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app/api/agentkit-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: descripcion
    })
  });

  const result = await response.json();
  
  if (result.pdfGenerated) {
    // Descargar PDF
    const pdfBlob = new Blob([
      Uint8Array.from(atob(result.pdfData.base64), c => c.charCodeAt(0))
    ], { type: 'application/pdf' });
    
    // Crear enlace de descarga
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.pdfData.fileName;
    a.click();
  }
  
  return result;
}

// Ejemplo de uso
const resultado = await solicitarEvento(
  "Necesito decoración para quinceañeros el 15 de enero en Jardín Las Rosas"
);
```

### **Python:**
```python
import requests
import base64

def solicitar_evento(descripcion, conversation_id=None):
    url = "https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app/api/agentkit-chat"
    
    payload = {"message": descripcion}
    if conversation_id:
        payload["conversationId"] = conversation_id
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    if result.get("pdfGenerated"):
        # Guardar PDF
        pdf_data = base64.b64decode(result["pdfData"]["base64"])
        with open(result["pdfData"]["fileName"], "wb") as f:
            f.write(pdf_data)
        print(f"PDF guardado: {result['pdfData']['fileName']}")
    
    return result

# Ejemplo de uso
resultado = solicitar_evento("Quiero decoración para boda en diciembre")
```

### **cURL:**
```bash
# Solicitud básica
curl -X POST https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app/api/agentkit-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Necesito decoración para bautizo el 20 de febrero"
  }'

# Health check
curl -X GET https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app/api/health
```

---

## 📊 **Límites y Cuotas**

| Recurso | Límite | Descripción |
|---------|--------|-------------|
| **Requests por minuto** | 60 | Límite por IP |
| **Tamaño de mensaje** | 10KB | Máximo por request |
| **Timeout** | 30s | Tiempo máximo de respuesta |
| **Conversations concurrentes** | 100 | Máximo simultáneo |

---

## 🔍 **Debugging**

### **Logs de Request:**
```bash
# Ver logs en tiempo real
vercel logs --follow

# Buscar errores específicos
vercel logs | grep "ERROR"
```

### **Test de Conectividad:**
```bash
# Verificar que el servicio esté funcionando
curl -I https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app/api/health

# Test rápido de conversación
curl -X POST https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app/api/agentkit-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' \
  -w "\nResponse time: %{time_total}s\n"
```

---

## 📈 **Monitoreo**

### **Métricas Clave:**
- **Uptime:** >99.9%
- **Response Time:** 2-5 segundos promedio
- **Success Rate:** >95%
- **PDF Generation:** <3 segundos
- **Memory Usage:** ~512MB

### **Alertas Automáticas:**
- ❌ Error rate >5%
- ⏱️ Response time >10s
- 🚫 Health check fails
- 💾 Memory usage >80%

---

**API Version:** 2.0.0-pdfmake  
**Última actualización:** Noviembre 2024  
**Soporte:** Sistema automatizado 24/7