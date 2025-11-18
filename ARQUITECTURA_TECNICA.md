# 🏗️ Arquitectura Técnica - Agente Paralegal 3D Pixel Perfection

**Versión:** 2.0.0-pdfmake  
**Estado:** Producción ✅

---

## 📋 **Visión General del Sistema**

Sistema especializado en el procesamiento conversacional de solicitudes de decoración de eventos, con generación automática de documentos contractuales profesionales.

### **Flujo Principal:**
1. **Cliente** describe su evento
2. **Agente AI** clasifica el tipo de documento necesario
3. **Sistema** recopila información faltante conversacionalmente  
4. **Generador** crea PDF profesional basado en templates exactos
5. **Cliente** recibe documento descargable

---

## 🔧 **Stack Tecnológico Detallado**

### **Backend Infrastructure:**
- **Runtime:** Node.js 18+ en Vercel Serverless
- **Language:** TypeScript 5.0+ con strict mode
- **Framework:** Express-like handlers con @vercel/node
- **Memory:** 1024MB allocated per function

### **AI & Machine Learning:**
- **Model:** OpenAI GPT-4o (latest)
- **API:** OpenAI SDK v6.9.0
- **Features:** Structured outputs, function calling
- **Validation:** Zod v3.25.76 para type safety

### **PDF Generation:**
- **Engine:** PDFMake v0.2+ (nativo)
- **Fonts:** VFS integrado, sin dependencias externas
- **Output:** Buffer → Base64 → Cliente
- **Performance:** 2-3 segundos generación promedio

### **Security & Validation:**
- **Guardrails:** OpenAI Moderation API
- **PII Detection:** Regex patterns para datos mexicanos
- **Input Validation:** Zod schemas en todos los endpoints
- **CORS:** Configurado para acceso cross-origin

---

## 📁 **Arquitectura de Archivos**

```
proyecto/
├── 📂 api/                    # Endpoints Vercel Serverless
│   ├── agentkit-chat.ts      # Endpoint conversacional principal
│   └── health.ts             # Monitoreo y diagnostics
│
├── 📂 src/                   # Core business logic
│   ├── agent-real.ts         # Agente conversacional con estado
│   ├── classification-real.ts # AI classification & extraction
│   ├── schemas-real.ts       # Zod schemas para validación
│   ├── guardrails.ts         # Security & content moderation
│   └── pdf-generator.ts      # PDF generation con PDFMake
│
├── 📂 public/                # Frontend assets
│   ├── agentkit-demo.html    # UI principal (AgentKit)
│   └── index.html            # Landing page
│
├── 📂 platillas contratos y anexos/ # Referencias .docx
│   ├── contrato_base.docx    # Template contrato principal
│   ├── anexo_a.docx          # Template especificaciones (61 campos)
│   ├── anexo_b.docx          # Template renders visuales
│   ├── anexo_c.docx          # Template control cambios
│   └── anexo_d.docx          # Template entrega final (21 campos)
│
├── 📄 paralegal-agent.ts     # Entry point principal
├── 📄 package.json           # Dependencies & scripts
├── 📄 tsconfig.json          # TypeScript configuration
├── 📄 vercel.json            # Deployment configuration
└── 📄 .env                   # Environment variables
```

---

## 🔄 **Flujo de Datos Detallado**

### **1. Request Processing:**
```typescript
// api/agentkit-chat.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  // Method validation (POST only)
  // Environment check (OPENAI_API_KEY)
  // Input validation (message required)
  
  // Proceed to agent processing...
}
```

### **2. Conversational Agent:**
```typescript
// src/agent-real.ts
export async function processTranscriptConversational(
  transcript: string, 
  conversationId?: string
): Promise<ConversationResult> {
  // State management
  // Document classification
  // Data extraction
  // Progress tracking
  // PDF generation trigger
}
```

### **3. AI Classification:**
```typescript
// src/classification-real.ts
export async function classifyDocumentReal(transcript: string): Promise<DocumentType> {
  // GPT-4o prompt engineering
  // Response parsing
  // Fallback logic
  // Type validation
}
```

### **4. PDF Generation:**
```typescript
// src/pdf-generator.ts
export async function generatePDF(options: PDFGeneratorOptions): Promise<PDFGenerationResult> {
  // Template selection
  // Data injection
  // PDFMake document definition
  // Buffer generation
  // Base64 encoding
}
```

---

## 🧠 **Sistema de Schemas**

### **Document Types:**
```typescript
export type DocumentType = 
  | 'contrato_base'    // Contrato principal
  | 'anexo_a'          // Especificaciones técnicas (61 campos)
  | 'anexo_b'          // Renders y visuales
  | 'anexo_c'          // Control de cambios
  | 'anexo_d';         // Entrega final (21 campos)
```

### **Validation Schemas:**
```typescript
// Ejemplo Anexo A (61 campos técnicos)
export const AnexoASchema = z.object({
  // Información general
  NOMBRE_CLIENTE: z.string().optional(),
  FECHA_EVENTO: z.string().optional(),
  
  // Medidas del salón
  MEDIDA_LARGO_SALON: z.string().optional(),
  MEDIDA_ANCHO_SALON: z.string().optional(),
  MEDIDA_ALTO_SALON: z.string().optional(),
  
  // ... 56 campos adicionales
});
```

### **Conversation State:**
```typescript
export interface ConversationState {
  conversationId: string;
  documentType: DocumentType;
  extractedData: ExtractedDataReal;
  missingCriticalFields: string[];
  step: 'classification' | 'extraction' | 'completion';
  lastInteraction: Date;
}
```

---

## ⚡ **Optimizaciones de Performance**

### **Memory Management:**
- **Lazy Loading:** PDFMake cargado bajo demanda
- **Buffer Optimization:** Conversión directa sin archivos temporales
- **State Management:** Conversaciones en memoria (no persistence)
- **Garbage Collection:** Cleanup automático post-generation

### **API Optimizations:**
- **Response Compression:** Gzip habilitado
- **Concurrent Requests:** 100+ simultaneous conversations
- **Timeout Management:** 30s max per request
- **Error Handling:** Graceful degradation

### **AI Model Optimization:**
- **Temperature:** 0.1 para consistencia
- **Max Tokens:** Limitado por tipo de operación
- **Structured Outputs:** Zod validation directa
- **Fallback Logic:** Multiple retry strategies

---

## 🛡️ **Seguridad y Guardrails**

### **Input Validation:**
```typescript
// Todas las entradas validadas con Zod
const requestSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().optional()
});
```

### **Content Moderation:**
```typescript
export async function runGuardrails(text: string) {
  // PII Detection (CURP, RFC, tarjetas)
  // OpenAI Moderation API
  // Custom business rules
  // Auto-blocking malicious content
}
```

### **Rate Limiting:**
- **Per IP:** 60 requests/minute
- **Per Conversation:** Max 50 exchanges
- **Global:** 1000 requests/minute total
- **Emergency:** Circuit breaker en sobrecarga

---

## 📊 **Monitoring y Observability**

### **Health Metrics:**
```typescript
// api/health.ts incluye:
{
  status: "ok" | "error",
  uptime: number,           // Segundos desde deploy
  environment: "production",
  configuration: {
    all_env_vars_configured: boolean,
    details: { OPENAI_API_KEY: boolean }
  }
}
```

### **Performance Metrics:**
- **Response Time:** Tracking automático en headers
- **Success Rate:** Monitoreado en logs
- **Memory Usage:** Vercel analytics
- **Error Rate:** Alertas automáticas >5%

### **Logging Strategy:**
```typescript
// Structured logging en todos los componentes
console.log('🤖 Procesando mensaje:', { 
  conversationId, 
  documentType, 
  extractedFields: Object.keys(data).length 
});
```

---

## 🚀 **Deployment Pipeline**

### **Build Process:**
```bash
# Automated via Vercel
npm install           # Dependencies
tsc                  # TypeScript compilation
vercel build         # Vercel optimization
vercel deploy --prod # Production deployment
```

### **Environment Variables:**
```env
# Requeridas para producción
OPENAI_API_KEY=sk-proj-...     # OpenAI API access

# Opcionales para debugging
NODE_ENV=production            # Environment mode
DEBUG=false                    # Debug logging
```

### **Vercel Configuration:**
```json
{
  "version": 2,
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,           // 1GB memory allocation
      "maxDuration": 30         // 30s timeout
    }
  },
  "build": {
    "env": {
      "OPENAI_API_KEY": "@openai-key"
    }
  }
}
```

---

## 🔧 **Troubleshooting Guide**

### **Common Issues:**

**❌ "OPENAI_API_KEY not configured"**
```bash
# Verificar en Vercel dashboard
vercel env ls
vercel env add OPENAI_API_KEY
```

**❌ "PDF generation timeout"**
```bash
# Check memory usage y optimize
# Increase function timeout si necesario
```

**❌ "Classification failed"**
```bash
# Verificar OpenAI API status
curl https://status.openai.com
# Check quota limits
```

### **Debug Commands:**
```bash
# Local development
npm run dev

# Production logs  
vercel logs --follow

# Function analytics
vercel inspect https://paralegal-3d-pixel-9maafj4b7-we-law.vercel.app
```

---

## 📈 **Métricas de Producción**

### **Performance Benchmarks:**
- ⚡ **API Response:** 2-5s avg, 10s max
- 💾 **Memory Usage:** 300-500MB per request
- 📦 **PDF Size:** 25-50KB average
- 🔄 **Throughput:** 100+ concurrent conversations

### **Availability Targets:**
- 📊 **Uptime:** >99.9% SLA
- 🎯 **Success Rate:** >95% conversation completion
- 🚀 **Time to First Byte:** <500ms
- 📱 **Mobile Compatibility:** 100%

---

**Arquitectura Version:** 2.0.0-pdfmake  
**Última revisión técnica:** Noviembre 2024  
**Status:** Stable Production ✅