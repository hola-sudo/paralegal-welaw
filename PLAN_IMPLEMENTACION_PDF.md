# 📋 PLAN DE IMPLEMENTACIÓN - GENERACIÓN DE PDFs

## 🎯 **OBJETIVO**

Reconfigurar el agente para que en lugar de intentar crear documentos en Google Drive, genere archivos PDF descargables con todos los datos extraídos, listos para procesamiento por un agente externo.

---

## 🔄 **CAMBIO ARQUITECTÓNICO**

### **ESTADO ACTUAL**
```
Transcripción → Extracción → Google Drive (❌ Bloqueado) → Error
```

### **ESTADO OBJETIVO**
```
Transcripción → Extracción → PDF Generator → Archivo Descargable (✅)
```

---

## 🛠️ **IMPLEMENTACIÓN TÉCNICA**

### **PASO 1: Dependencias Nuevas**
```json
{
  "puppeteer": "^22.0.0",           // Para PDF generation
  "@types/puppeteer": "^5.4.0",     // Types para TypeScript
  "html-pdf": "^3.0.1"              // Alternativa ligera (backup)
}
```

### **PASO 2: Nuevo Módulo PDF Generator**
**Archivo**: `src/pdf-generator.ts`

```typescript
interface PDFGeneratorOptions {
  templateType: DocumentType;
  extractedData: ExtractedDataReal;
  documentName: string;
  includeMetadata: boolean;
}

interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  fileName?: string;
  downloadUrl?: string;
  error?: string;
}

// Función principal
export async function generatePDF(options: PDFGeneratorOptions): Promise<PDFGenerationResult>

// Templates HTML por tipo de documento
const htmlTemplates = {
  contrato_base: (data) => `<!-- HTML template -->`
  anexo_a: (data) => `<!-- HTML template -->`,
  // ... etc
}
```

### **PASO 3: Templates HTML por Tipo de Documento**

#### **Contrato Base Template**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{NOMBRE_EVENTO}} - Contrato Base</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 2cm; }
    .header { text-align: center; border-bottom: 2px solid #333; }
    .section { margin: 20px 0; }
    .field { margin: 10px 0; }
    .signature { margin-top: 50px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
    <h2>3D PIXEL PERFECTION</h2>
  </div>
  
  <div class="section">
    <h3>DATOS DEL CLIENTE</h3>
    <div class="field"><strong>Nombre:</strong> {{NOMBRE_CLIENTE}}</div>
    <div class="field"><strong>RFC:</strong> {{RFC_cliente}}</div>
  </div>
  
  <div class="section">
    <h3>DATOS DEL EVENTO</h3>
    <div class="field"><strong>Evento:</strong> {{NOMBRE_EVENTO}}</div>
    <div class="field"><strong>Tipo:</strong> {{EVENTO}}</div>
    <div class="field"><strong>Fecha:</strong> {{FECHA_EVENTO}} a las {{HH:MM}}</div>
    <div class="field"><strong>Ubicación:</strong> {{UBICACION}}</div>
  </div>
  
  <div class="signature">
    <p>Fecha del contrato: {{DD/MM/AAAA}}</p>
    <br><br>
    <table width="100%">
      <tr>
        <td width="50%">_________________________<br>Firma del Cliente</td>
        <td width="50%">_________________________<br>3D Pixel Perfection</td>
      </tr>
    </table>
  </div>
</body>
</html>
```

#### **Anexo A Template (Especificaciones)**
```html
<!-- Template especializado para montaje y decoración -->
<div class="section">
  <h3>ESPECIFICACIONES DEL SALÓN</h3>
  <div class="field">Largo: {{MEDIDA_LARGO_SALON}} metros</div>
  <div class="field">Ancho: {{MEDIDA_ANCHO_SALON}} metros</div>
  <!-- ... más campos específicos -->
</div>
```

### **PASO 4: Modificación de API Endpoints**

#### **En `api/process.ts`**
```typescript
// REEMPLAZAR esta sección:
const googleDriveResult = await createDocumentFromTemplate(...)

// POR:
const pdfResult = await generatePDF({
  templateType: result.tipo_documento,
  extractedData: result.datos,
  documentName: `${result.tipo_documento}_${Date.now()}`,
  includeMetadata: true
});

if (pdfResult.success) {
  return res.status(200).json({
    success: true,
    tipo_documento: result.tipo_documento,
    download_url: pdfResult.downloadUrl,
    file_name: pdfResult.fileName,
    datos_extraidos: result.datos,
    // ... resto de response
  });
}
```

#### **En `api/chat.ts`**
```typescript
// Similar modificación para el endpoint conversacional
```

### **PASO 5: Nuevo Endpoint de Descarga**
**Archivo**: `api/download/[fileId].ts`

```typescript
// Endpoint para servir archivos PDF generados
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { fileId } = req.query;
  
  // Validar fileId, servir PDF con headers correctos
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  
  return res.send(pdfBuffer);
}
```

---

## 📱 **ACTUALIZACIÓN DE FRONTEND**

### **Modificación en `demo.html`**
```javascript
// Cambiar manejo de respuesta exitosa:
if (data.success && data.download_url) {
  // Mostrar botón de descarga
  addMessage('agent', `✅ ${data.resumen}
  
  📄 **Documento generado:** ${data.tipo_documento}
  📋 **Datos extraídos:** ${Object.keys(data.datos_extraidos).length} campos
  
  [⬇️ DESCARGAR PDF](${data.download_url})`);
  
  // Crear botón de descarga automática
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = 'Descargar PDF';
  downloadBtn.onclick = () => window.open(data.download_url, '_blank');
  messagesContainer.appendChild(downloadBtn);
}
```

---

## 🔧 **CONFIGURACIÓN VERCEL**

### **Ajustes en `vercel.json`**
```json
{
  "functions": {
    "api/process.ts": {
      "maxDuration": 45       // Aumentar por generación PDF
    },
    "api/chat.ts": {
      "maxDuration": 45
    },
    "api/download/[fileId].ts": {
      "maxDuration": 10
    }
  }
}
```

### **Variables de Entorno Nuevas**
```bash
PDF_STORAGE_STRATEGY=memory    # memory | vercel-blob | temporary
PDF_CLEANUP_TIMEOUT=300       # 5 minutos para limpiar archivos temp
```

---

## 📊 **ESTRATEGIAS DE ALMACENAMIENTO PDF**

### **OPCIÓN A: En Memoria (Recomendada)**
- PDFs se generan y sirven inmediatamente
- No persisten en servidor
- Ideal para archivos pequeños (<5MB)

### **OPCIÓN B: Vercel Blob Storage**
- PDFs se almacenan temporalmente
- URLs de descarga con expiración
- Ideal para archivos grandes

### **OPCIÓN C: Base64 Embebido**
- PDF como string base64 en response
- Frontend maneja descarga
- Más simple pero limitado por tamaño

---

## 🧪 **PLAN DE TESTING**

### **Pruebas Unitarias**
```typescript
describe('PDF Generator', () => {
  it('should generate PDF for contrato_base', async () => {
    const result = await generatePDF({
      templateType: 'contrato_base',
      extractedData: mockContratoData,
      documentName: 'test_contrato',
      includeMetadata: true
    });
    
    expect(result.success).toBe(true);
    expect(result.pdfBuffer).toBeInstanceOf(Buffer);
  });
});
```

### **Pruebas de Integración**
1. **Flujo completo**: Transcripción → PDF descargable
2. **Todos los tipos**: contrato_base, anexo_a, anexo_b, anexo_c, anexo_d
3. **Campos faltantes**: PDFs con datos parciales
4. **Error handling**: PDFs de error informativos

---

## 📈 **VENTAJAS DE LA NUEVA ARQUITECTURA**

### **Técnicas**
- ✅ **Sin dependencias externas** - No Google Drive
- ✅ **Latencia baja** - Generación in-memory
- ✅ **Escalabilidad** - Serverless nativo
- ✅ **Debugging fácil** - Logs locales

### **de Negocio**
- ✅ **Entrega inmediata** - PDF listo en segundos
- ✅ **Compatible con agente externo** - Formato estándar
- ✅ **Presentable** - PDFs con formato profesional
- ✅ **Archivable** - Usuarios pueden guardar localmente

---

## 📅 **CRONOGRAMA DE IMPLEMENTACIÓN**

### **Día 1: Setup y Dependencies**
1. ⚙️ Instalar puppeteer y dependencias
2. 🏗️ Crear estructura `src/pdf-generator.ts`
3. 🧪 Setup básico de testing

### **Día 1: Templates y Generación**
4. 📝 Implementar template HTML para contrato_base
5. 🎨 Styling CSS profesional 
6. 🔧 Función básica de generación PDF

### **Día 1: Integración con APIs**
7. 🔌 Modificar `/api/process.ts` 
8. 🔌 Modificar `/api/chat.ts`
9. 📱 Actualizar frontend para descarga

### **Día 2: Templates Restantes**
10. 📋 Templates para anexos A, B, C, D
11. 🎨 Styling específico por tipo
12. 🧪 Testing de todos los tipos

### **Día 2: Pulimiento**
13. 🛡️ Error handling robusto
14. 📊 Logging y debugging
15. 🚀 Deploy y testing en producción

---

## 🎯 **CRITERIOS DE ÉXITO**

### **Funcionales**
- [ ] PDFs generados para los 5 tipos de documentos
- [ ] Datos correctamente mapeados en templates
- [ ] Descarga automática funcionando
- [ ] Compatibilidad con agente externo verificada

### **No Funcionales**
- [ ] Tiempo de generación < 10 segundos
- [ ] PDFs < 1MB de tamaño
- [ ] 100% uptime en producción
- [ ] Error rate < 1%

### **de Negocio**
- [ ] Flujo usuario final optimizado
- [ ] Documentos con calidad profesional
- [ ] Integración con pipeline existente
- [ ] Reducción de trabajo manual

---

## 🚀 **RESULTADO ESPERADO**

### **Flujo Final**
```
1. Usuario ingresa transcripción
2. Agente extrae datos (5-15s)
3. Agente genera PDF profesional (3-5s)
4. Usuario descarga PDF inmediatamente
5. Usuario procesa PDF con agente externo
```

### **Archivos Generados**
```
📄 contrato_base_2024-11-17_1234567890.pdf
📄 anexo_a_2024-11-17_1234567891.pdf
📄 anexo_b_2024-11-17_1234567892.pdf
```

---

**📋 Plan creado:** {new Date().toISOString()}  
**⏱️ Tiempo estimado:** 1-2 días de implementación  
**🎯 Complejidad:** Media (modificación de arquitectura existente)

---

*Ready para implementación. ¿Procedemos con el PASO 1?*