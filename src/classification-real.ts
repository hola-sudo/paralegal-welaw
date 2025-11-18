/**
 * Clasificación y extracción REAL para el negocio de 3D Pixel Perfection
 * 
 * Especializado en eventos, renders 3D, y documentos de producción audiovisual.
 * Entiende el flujo: Contrato → Especificaciones → Renders → Cambios → Entrega
 */

import OpenAI from 'openai';
import { DocumentType, DocumentTypeSchema, DocumentSchemasReal, ExtractedDataReal } from './schemas-real';

// Inicializamos el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

/**
 * Clasifica transcripciones relacionadas con eventos y producción audiovisual
 * 
 * Entiende el contexto del negocio de 3D Pixel Perfection para determinar
 * qué tipo de documento necesita generar el cliente.
 */
export async function classifyDocumentReal(transcript: string): Promise<DocumentType> {
  const systemPrompt = `Eres un experto en el negocio de eventos y producción de renders 3D para la empresa "3D Pixel Perfection".

Analiza la siguiente transcripción de una reunión con un cliente y determina qué tipo de documento necesita generar:

TIPOS DE DOCUMENTOS DEL NEGOCIO:

1. contrato_base: 
   - Contrato inicial del evento
   - Información básica: cliente, evento, fecha, ubicación
   - Se menciona: "contrato", "nuevo evento", "cotización", "propuesta inicial"

2. anexo_a:
   - Especificaciones técnicas de montaje y decoración
   - Detalles del salón, medidas, decoración, mobiliario
   - Se menciona: "montaje", "decoración", "medidas del salón", "centro de mesa", "sillas", "mesas"

3. anexo_b:
   - Renders y temas visuales del evento
   - Estilos, temas, confirmación de renders
   - Se menciona: "renders", "imágenes", "visualización", "temas", "estilos"

4. anexo_c:
   - Control de cambios y revisiones
   - Modificaciones a renders existentes, rondas de corrección
   - Se menciona: "cambios", "correcciones", "modificar", "revisión", "ronda"

5. anexo_d:
   - Entrega final y autorización de pago
   - Entrega de renders finales, calidad, autorización
   - Se menciona: "entrega", "final", "pago", "autorizar", "completado"

CONTEXTO DEL NEGOCIO:
- 3D Pixel Perfection crea renders fotorrealistas para eventos (bodas, XV años, corporativos)
- El flujo típico es: Contrato → Especificaciones → Renders → Cambios → Entrega
- Los clientes suelen hablar de "salones", "decoración", "ambientación", "visualización"

Responde ÚNICAMENTE con uno de estos tipos: contrato_base, anexo_a, anexo_b, anexo_c, o anexo_d.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
      temperature: 0.1,
      max_tokens: 50,
    });

    const classification = response.choices[0]?.message?.content?.trim().toLowerCase();
    
    if (!classification) {
      throw new Error('No se pudo obtener una clasificación del documento');
    }

    // Validamos que la respuesta sea uno de los tipos válidos
    const parsed = DocumentTypeSchema.safeParse(classification);
    
    if (!parsed.success) {
      // Si la respuesta no es exacta, intentamos inferir del contexto
      const lowerTranscript = transcript.toLowerCase();
      
      // Búsqueda por palabras clave del negocio
      if (lowerTranscript.includes('anexo a') || 
          lowerTranscript.includes('montaje') || 
          lowerTranscript.includes('decoración') ||
          lowerTranscript.includes('medidas') ||
          lowerTranscript.includes('salón')) {
        return 'anexo_a';
      }
      
      if (lowerTranscript.includes('anexo b') || 
          lowerTranscript.includes('render') || 
          lowerTranscript.includes('imagen') ||
          lowerTranscript.includes('visualización') ||
          lowerTranscript.includes('tema')) {
        return 'anexo_b';
      }
      
      if (lowerTranscript.includes('anexo c') || 
          lowerTranscript.includes('cambio') || 
          lowerTranscript.includes('modificar') ||
          lowerTranscript.includes('corrección') ||
          lowerTranscript.includes('revisión')) {
        return 'anexo_c';
      }
      
      if (lowerTranscript.includes('anexo d') || 
          lowerTranscript.includes('entrega') || 
          lowerTranscript.includes('final') ||
          lowerTranscript.includes('pago') ||
          lowerTranscript.includes('autorizar')) {
        return 'anexo_d';
      }
      
      // Por defecto, si hablan de un nuevo evento, es contrato base
      return 'contrato_base';
    }

    return parsed.data;
  } catch (error) {
    console.error('Error al clasificar documento:', error);
    // En caso de error, retornamos contrato_base como valor por defecto
    return 'contrato_base';
  }
}

/**
 * Extrae datos específicos del negocio de eventos y renders 3D
 * 
 * Especializado en entender transcripciones de reuniones con clientes
 * donde se habla de eventos, decoración, renders, etc.
 */
export async function extractPlaceholdersReal(
  transcript: string,
  documentType: DocumentType
): Promise<ExtractedDataReal> {
  // Obtenemos el schema correspondiente al tipo de documento
  const schema = DocumentSchemasReal[documentType];
  
  // Prompts especializados por tipo de documento
  const contextPrompts = {
    contrato_base: `Extrae información BÁSICA del evento:
- Nombre del cliente/empresa
- Tipo de evento (boda, XV años, evento corporativo, etc.)
- Nombre específico del evento (ej: "Boda de María y Juan")
- Fecha del evento
- Ubicación/venue del evento
- Descripción del evento
- RFC del cliente (si se menciona)`,

    anexo_a: `Extrae ESPECIFICACIONES TÉCNICAS del montaje:
- Medidas del salón (largo, ancho, alto)
- Información de mesas (cantidad, formato, medidas)
- Sillas (cantidad, tipo)
- Centro de mesa (descripción, flores, base, medidas)
- Elementos decorativos
- Estructuras especiales (barra, pista, candiles, etc.)
- Posicionamiento de elementos`,

    anexo_b: `Extrae información sobre RENDERS Y VISUALIZACIÓN:
- Temas o estilos solicitados
- Tipo de renders requeridos
- Estados de confirmación
- Representante de 3D Pixel Perfection
- Fechas relevantes`,

    anexo_c: `Extrae información sobre CAMBIOS Y REVISIONES:
- Ronda de revisión actual
- Cambios solicitados (hasta 7)
- Estados actuales vs solicitados
- Qué cambios han sido ejecutados
- Aceptación del cliente`,

    anexo_d: `Extrae información de ENTREGA FINAL:
- Tipo de paquete
- Fecha de entrega
- Cantidad de renders entregados
- Calidad y formatos
- Información de costos y pagos
- Autorización del cliente`
  };

  const systemPrompt = `Extrae datos de esta transcripción de eventos para ${documentType}.

CAMPOS A EXTRAER:
- NOMBRE_CLIENTE: Nombre completo del cliente
- RFC_cliente: RFC si se menciona
- NOMBRE_EVENTO: Nombre del evento (ej: "Boda de María")
- FECHA_EVENTO: Fecha en formato DD/MM/AAAA
- UBICACION: Lugar del evento
- EVENTO: Tipo de evento (boda, XV años, etc.)
- DD/MM/AAAA: Fecha del contrato
- HH:MM: Hora del evento

REGLAS:
- Extrae solo lo que está en el texto
- Si no se menciona, usa cadena vacía ""
- Responde solo con JSON válido

Ejemplo:
{"NOMBRE_CLIENTE":"Juan Pérez","RFC_cliente":"","NOMBRE_EVENTO":"Boda de Juan","FECHA_EVENTO":"15/03/2024","UBICACION":"Salón Eventos","EVENTO":"Boda","DD/MM/AAAA":"","HH:MM":""}`;

  try {
    // Usamos structured outputs para obtener JSON válido
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const jsonContent = response.choices[0]?.message?.content;
    
    if (!jsonContent) {
      throw new Error('No se pudieron extraer los datos del documento');
    }

    // Parseamos el JSON y validamos con Zod
    const parsed = JSON.parse(jsonContent);
    return schema.parse(parsed);
  } catch (error) {
    console.error('Error al extraer placeholders:', error);
    
    // Fallback: intentamos con un prompt más simple
    try {
      const fallbackResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: `Extrae datos estructurados de esta transcripción sobre eventos/renders 3D.
            Responde ÚNICAMENTE con JSON válido. Si no tienes un dato, usa null.` 
          },
          { role: 'user', content: transcript },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const jsonContent = fallbackResponse.choices[0]?.message?.content;
      if (jsonContent) {
        const parsed = JSON.parse(jsonContent);
        return schema.parse(parsed);
      }
    } catch (fallbackError) {
      console.error('Error en fallback de extracción:', fallbackError);
    }
    
    throw new Error(`Error al extraer datos del documento tipo ${documentType}: ${error}`);
  }
}

/**
 * Función helper para identificar campos faltantes críticos
 * según el tipo de documento y el contexto del negocio
 */
export function findMissingCriticalFields(
  data: Partial<ExtractedDataReal>, 
  documentType: DocumentType
): string[] {
  const criticalFields = {
    contrato_base: ['NOMBRE_CLIENTE', 'NOMBRE_EVENTO', 'FECHA_EVENTO', 'UBICACION'],
    anexo_a: ['NOMBRE_CLIENTE', 'FECHA_EVENTO', 'MEDIDA_LARGO_SALON', 'MEDIDA_ANCHO_SALON'],
    anexo_b: ['CLIENTE', 'NOMBRE_EVENTO', 'TEMA_1'],
    anexo_c: ['NOMBRE_EVENTO', 'RONDA', 'CAMBIO_1'],
    anexo_d: ['NOMBRE_EVENTO', 'FECHA_ENTREGA', 'CANTIDAD_RENDERS_ENTREGADOS']
  };
  
  const required = criticalFields[documentType] || [];
  return required.filter(field => {
    const value = (data as any)[field];
    return !value || value === '' || value === null;
  });
}

/**
 * Genera preguntas específicas para campos faltantes
 * en el contexto del negocio de eventos
 */
export function generateFollowUpQuestions(
  missingFields: string[], 
  documentType: DocumentType
): string[] {
  const fieldQuestions: Record<string, string> = {
    // Contrato base
    'NOMBRE_CLIENTE': '¿Cuál es el nombre completo del cliente?',
    'NOMBRE_EVENTO': '¿Cuál es el nombre del evento? (ej: "Boda de María y Juan")',
    'FECHA_EVENTO': '¿Cuál es la fecha del evento? (formato DD/MM/AAAA)',
    'UBICACION': '¿En qué lugar se realizará el evento?',
    'EVENTO': '¿Qué tipo de evento es? (boda, XV años, corporativo, etc.)',
    'RFC_cliente': '¿Tienes el RFC del cliente?',
    
    // Anexo A
    'MEDIDA_LARGO_SALON': '¿Cuántos metros de largo tiene el salón?',
    'MEDIDA_ANCHO_SALON': '¿Cuántos metros de ancho tiene el salón?',
    'MEDIDA_ALTO_SALON': '¿Cuál es la altura del salón?',
    'DESCRIPCION_CENTRO_MESA': '¿Cómo quieren los centros de mesa?',
    'CANTIDAD_SILLAS': '¿Cuántas sillas necesitan?',
    'FORMATO_MESA': '¿Qué formato de mesa prefieren? (redondas, rectangulares, etc.)',
    
    // Anexo B
    'TEMA_1': '¿Cuál es el tema o estilo visual que quieren para los renders?',
    'TEMA_2': '¿Tienen algún tema secundario o alternativo?',
    'PIXEL_REPRESENTANTE': '¿Quién es el representante asignado de 3D Pixel Perfection?',
    
    // Anexo C
    'RONDA': '¿En qué ronda de revisión están?',
    'CAMBIO_1': '¿Cuál es el primer cambio que solicitan?',
    'TOTAL_CAMBIOS_RONDA': '¿Cuántos cambios solicitan en total esta ronda?',
    
    // Anexo D
    'FECHA_ENTREGA': '¿Para cuándo necesitan la entrega final?',
    'CANTIDAD_RENDERS_ENTREGADOS': '¿Cuántos renders se van a entregar?',
    'PAQUETE': '¿Qué paquete contrataron?',
    'TOTAL': '¿Cuál es el costo total del proyecto?',
    'COSTO': '¿Cuál es el costo del servicio?',
    'AUTORIZA_PAGO': '¿El cliente autoriza el pago final?'
  };
  
  return missingFields
    .map(field => fieldQuestions[field])
    .filter(Boolean);
}