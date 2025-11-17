# Agente Paralegal AI

Agente de inteligencia artificial desarrollado con OpenAI Agents SDK para procesar transcripciones de documentos legales. Clasifica documentos en 5 tipos diferentes y extrae información estructurada usando schemas Zod.

## 🎯 Características

- **Clasificación automática**: Identifica el tipo de documento (contrato_base, anexo_a, anexo_b, anexo_c, anexo_d)
- **Extracción estructurada**: Extrae placeholders específicos según el tipo de documento usando GPT-4o
- **Guardrails de seguridad**: Protección contra PII (Información Personal Identificable) y moderación de contenido
- **Validación con Zod**: Todos los datos extraídos son validados con schemas TypeScript/Zod
- **Listo para Vercel**: Endpoint API configurado para despliegue inmediato

## 📋 Requisitos

- Node.js 18+ 
- Cuenta de OpenAI con API key
- (Opcional) Cuenta de Vercel para despliegue

## 🚀 Instalación

1. Clona el repositorio o descarga los archivos
2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

Copia `.env.example` a `.env` y agrega tu API key de OpenAI:

```bash
cp .env.example .env
```

Edita `.env` y agrega tu API key:

```
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
```

## 💻 Uso

### Como API en Vercel

El proyecto está configurado para funcionar como API serverless en Vercel.

**Endpoint**: `POST /api/process`

**Body**:
```json
{
  "transcript": "Texto de la transcripción del documento aquí..."
}
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "data": {
    "tipo_documento": "contrato_base",
    "datos": {
      "parte_1_nombre": "...",
      "parte_2_nombre": "...",
      "fecha_firma": "01/01/2024",
      ...
    },
    "guardrails": {
      "pii": { "passed": true, "warnings": [] },
      "moderation": { "passed": true, "warnings": [] },
      "overall_passed": true
    },
    "metadata": {
      "processed_at": "2024-01-01T00:00:00.000Z",
      "model_used": "gpt-4o"
    }
  }
}
```

### Uso directo en código

```typescript
import { processTranscript } from './paralegal-agent';

const transcript = "Texto de la transcripción...";
const result = await processTranscript(transcript);

console.log('Tipo de documento:', result.tipo_documento);
console.log('Datos extraídos:', result.datos);
```

## 📁 Estructura del Proyecto

```
.
├── api/
│   └── process.ts          # Endpoint API para Vercel
├── src/
│   ├── schemas.ts          # Schemas Zod para cada tipo de documento
│   ├── classification.ts   # Funciones de clasificación y extracción
│   ├── guardrails.ts       # Guardrails de seguridad (PII y moderación)
│   └── agent.ts            # Agente principal que coordina todo
├── paralegal-agent.ts      # Punto de entrada principal
├── package.json
├── tsconfig.json
└── vercel.json             # Configuración de Vercel
```

## 🔒 Guardrails de Seguridad

El agente incluye dos tipos de guardrails:

1. **Detección de PII**: Identifica información personal como CURP, RFC, tarjetas de crédito, etc.
2. **Moderación de contenido**: Usa la API de moderación de OpenAI para detectar contenido inapropiado

Si el contenido es bloqueado por los guardrails, el procesamiento se detiene y se retorna un error.

## 📝 Tipos de Documentos

### contrato_base
Contrato principal con información de partes, fechas, términos generales.

**Campos principales**:
- `parte_1_nombre`, `parte_2_nombre`
- `fecha_firma`, `fecha_inicio`, `fecha_vencimiento`
- `objeto_contrato`
- `monto_total`, `moneda`
- `condiciones_pago`, `jurisdiccion`, `ley_aplicable`

### anexo_a
Anexo con términos y condiciones adicionales, cláusulas modificatorias.

**Campos principales**:
- `id_anexo`, `referencia_contrato`
- `clausulas_adicionales`, `modificaciones`
- `fecha_anexo`, `vigencia`
- `descripcion`, `firmantes`

### anexo_b
Anexo con especificaciones técnicas, productos, servicios o entregables.

**Campos principales**:
- `id_anexo`, `referencia_contrato`
- `especificaciones_tecnicas`, `productos_servicios`
- `cantidades`, `precios_unitarios`
- `entregables`

### anexo_c
Anexo con términos financieros, condiciones de pago, métodos de pago.

**Campos principales**:
- `id_anexo`, `referencia_contrato`
- `condiciones_pago`, `metodo_pago`, `cuenta_bancaria`
- `monto_total`, `moneda`
- `plazo_pago`, `fechas_pago`
- `penalizaciones`

### anexo_d
Anexo con información de contacto, direcciones y procedimientos de comunicación.

**Campos principales**:
- `id_anexo`, `referencia_contrato`
- `contactos_parte_1`, `contactos_parte_2`
- `direccion_notificaciones`
- `procedimientos_comunicacion`

## 🚢 Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura la variable de entorno `OPENAI_API_KEY` en el dashboard de Vercel
3. Vercel detectará automáticamente la configuración y desplegará el proyecto

O usa la CLI de Vercel:

```bash
npm i -g vercel
vercel
```

## 🔧 Desarrollo Local

Para probar localmente con Vercel Dev:

```bash
npm run dev
```

Esto iniciará un servidor local en `http://localhost:3000` donde puedes probar el endpoint `/api/process`.

## 📄 Licencia

ISC

## 🤝 Contribuciones

Este es un proyecto interno. Para sugerencias o mejoras, contacta al equipo de desarrollo.

