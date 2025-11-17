/**
 * SCHEMAS REALES basados en las plantillas .docx de 3D Pixel Perfection
 * 
 * Estos schemas coinciden exactamente con los placeholders encontrados en:
 * - contrato_base.docx: 8 campos
 * - anexo_a.docx: 58 campos (especificaciones de montaje)
 * - anexo_b.docx: 12 campos (renders y temas)
 * - anexo_c.docx: 24 campos (control de cambios)
 * - anexo_d.docx: 21 campos (entrega final)
 */

import { z } from 'zod';

// Tipos de documentos reales
export const DocumentTypeSchema = z.enum([
  'contrato_base',
  'anexo_a',
  'anexo_b', 
  'anexo_c',
  'anexo_d'
]);

export type DocumentType = z.infer<typeof DocumentTypeSchema>;

/**
 * CONTRATO BASE - Información básica del evento
 * Placeholders: {{NOMBRE_CLIENTE}}, {{RFC_cliente}}, etc.
 */
export const ContratoBaseSchema = z.object({
  NOMBRE_CLIENTE: z.string().optional().default('').describe('Nombre completo del cliente'),
  RFC_cliente: z.string().optional().default('').describe('RFC del cliente (opcional)'),
  NOMBRE_EVENTO: z.string().optional().default('').describe('Nombre del evento (ej: Boda de María y Juan)'),
  FECHA_EVENTO: z.string().optional().default('').describe('Fecha del evento en formato DD/MM/AAAA'),
  UBICACION: z.string().optional().default('').describe('Ubicación donde se realizará el evento'),
  EVENTO: z.string().optional().default('').describe('Descripción del tipo de evento'),
  // Fecha del contrato
  "DD/MM/AAAA": z.string().optional().default('').describe('Fecha de firma del contrato'),
  // Hora del evento
  "HH:MM": z.string().optional().default('').describe('Hora del evento')
});

/**
 * ANEXO A - Especificaciones técnicas de montaje y decoración
 * 58 campos detallados sobre el setup del evento
 */
export const AnexoASchema = z.object({
  // Información básica
  FECHA_EVENTO: z.string().optional().default('').describe('Fecha del evento'),
  NOMBRE_CLIENTE: z.string().optional().default('').describe('Nombre del cliente'),
  
  // Medidas del salón
  MEDIDA_LARGO_SALON: z.string().optional().describe('Largo del salón en metros'),
  MEDIDA_ANCHO_SALON: z.string().optional().describe('Ancho del salón en metros'),
  MEDIDA_ALTO_SALON: z.string().optional().describe('Alto del salón en metros'),
  
  // Centro de mesa
  DESCRIPCION_CENTRO_MESA: z.string().optional().describe('Descripción del centro de mesa'),
  BASE_CENTRO_MESA: z.string().optional().describe('Base del centro de mesa'),
  MEDIDAS_BASE_CENTRO_MESA: z.string().optional().describe('Medidas de la base'),
  FLORES_CENTRO_MESA: z.string().optional().describe('Tipo de flores'),
  FOLLAJE_CENTRO_MESA: z.string().optional().describe('Tipo de follaje'),
  DETALLES_VELAS_CENTRO_MESA: z.string().optional().describe('Detalles de velas'),
  NUMERO_PIEZAS_CENTRO_MESA: z.string().optional().describe('Número de piezas'),
  RECUBRIMIENTO_MESA: z.string().optional().describe('Recubrimiento de la mesa'),
  
  // Mobiliario
  FORMATO_MESA: z.string().optional().describe('Formato de las mesas'),
  MEDIDAS_MESA: z.string().optional().describe('Medidas de las mesas'),
  CANTIDAD_SILLAS: z.string().optional().describe('Cantidad de sillas'),
  TIPO_SILLA: z.string().optional().describe('Tipo de sillas'),
  DESCRIPCION_MONTAJE_MESA: z.string().optional().describe('Descripción del montaje'),
  
  // Elementos decorativos
  DESCRIPCION_ELEMENTO_DECORATIVO: z.string().optional().describe('Descripción de elementos decorativos'),
  MEDIDAS_ELEMENTO_DECORATIVO: z.string().optional().describe('Medidas de elementos decorativos'),
  UBICACION_ELEMENTO_DECORATIVO: z.string().optional().describe('Ubicación de elementos decorativos'),
  POSICION_ELEMENTOS_DECORATIVOS: z.string().optional().describe('Posición de elementos decorativos'),
  
  // Estructuras opcionales
  HAY_BARRA: z.string().optional().describe('¿Hay barra? (Sí/No)'),
  DISENO_BARRA: z.string().optional().describe('Diseño de la barra'),
  MEDIDAS_BARRA: z.string().optional().describe('Medidas de la barra'),
  
  HAY_CONTRABARRA: z.string().optional().describe('¿Hay contrabarra? (Sí/No)'),
  DISENO_CONTRABARRA: z.string().optional().describe('Diseño de la contrabarra'),
  MEDIDAS_CONTRABARRA: z.string().optional().describe('Medidas de la contrabarra'),
  
  HAY_PISTA: z.string().optional().describe('¿Hay pista de baile? (Sí/No)'),
  DISENO_PISTA: z.string().optional().describe('Diseño de la pista'),
  FORMATO_PISTA: z.string().optional().describe('Formato de la pista'),
  MEDIDAS_PISTA: z.string().optional().describe('Medidas de la pista'),
  
  HAY_CANDILES: z.string().optional().describe('¿Hay candiles? (Sí/No)'),
  DISENO_CANDILES: z.string().optional().describe('Diseño de candiles'),
  MEDIDAS_CANDILES: z.string().optional().describe('Medidas de candiles'),
  
  HAY_ENTELADO_TECHO: z.string().optional().describe('¿Hay entelado de techo? (Sí/No)'),
  DISENO_ENTELADO_TECHO: z.string().optional().describe('Diseño del entelado'),
  MEDIDAS_ENTELADO_TECHO: z.string().optional().describe('Medidas del entelado'),
  
  HAY_JARDIN_ESTRUCTURA: z.string().optional().describe('¿Hay estructura de jardín? (Sí/No)'),
  DISENO_JARDIN_ESTRUCTURA: z.string().optional().describe('Diseño de estructura jardín'),
  MEDIDAS_JARDIN_ESTRUCTURA: z.string().optional().describe('Medidas de estructura jardín'),
  
  // Posicionamiento
  POSICION_MESAS: z.string().optional().describe('Posición de las mesas'),
  POSICION_PISTA: z.string().optional().describe('Posición de la pista'),
  POSICION_ESCENARIO: z.string().optional().describe('Posición del escenario'),
  POSICION_ELEMENTOS_TECHO: z.string().optional().describe('Posición de elementos en techo'),
  
  // Layout y fotografías (campos de control)
  ARCHIVO_LAYOUT: z.string().optional().describe('Archivo de layout'),
  ELEMENTOS_INCLUIDOS: z.string().optional().describe('Elementos incluidos en el diseño'),
  
  // Números de fotos por elemento (para tracking)
  NUMERO_FOTOS_SALON: z.string().optional().describe('Número de fotos del salón'),
  NUMERO_FOTOS_ESTADO_SALON: z.string().optional().describe('Número de fotos del estado del salón'),
  NUMERO_FOTOS_LAYOUT: z.string().optional().describe('Número de fotos del layout'),
  NUMERO_FOTOS_CENTRO_MESA: z.string().optional().describe('Número de fotos del centro de mesa'),
  NUMERO_FOTOS_MONTAJE_MESA: z.string().optional().describe('Número de fotos del montaje de mesa'),
  NUMERO_FOTOS_SILLAS: z.string().optional().describe('Número de fotos de sillas'),
  NUMERO_FOTOS_ELEMENTO_DECORATIVO: z.string().optional().describe('Número de fotos de elementos decorativos'),
  NUMERO_FOTOS_VELAS_CENTRO_MESA: z.string().optional().describe('Número de fotos de velas'),
  NUMERO_FOTOS_BARRA: z.string().optional().describe('Número de fotos de barra'),
  NUMERO_FOTOS_CONTRABARRA: z.string().optional().describe('Número de fotos de contrabarra'),
  NUMERO_FOTOS_PISTA: z.string().optional().describe('Número de fotos de pista'),
  NUMERO_FOTOS_CANDILES: z.string().optional().describe('Número de fotos de candiles'),
  NUMERO_FOTOS_ENTELADO_TECHO: z.string().optional().describe('Número de fotos de entelado'),
  NUMERO_FOTOS_JARDIN_ESTRUCTURA: z.string().optional().describe('Número de fotos de jardín'),
  NUMERO_VIDEOS_ESTADO_SALON: z.string().optional().describe('Número de videos del estado del salón')
});

/**
 * ANEXO B - Renders y temas del evento
 * 12 campos sobre los renders a crear
 */
export const AnexoBSchema = z.object({
  CLIENTE: z.string().optional().default('').describe('Nombre del cliente'),
  NOMBRE_EVENTO: z.string().optional().default('').describe('Nombre del evento'),
  FECHA_EVENTO: z.string().optional().default('').describe('Fecha del evento'),
  FECHA_CLIENTE: z.string().optional().describe('Fecha del cliente'),
  FECHA_PIXEL: z.string().optional().describe('Fecha de Pixel Perfection'),
  PIXEL_REPRESENTANTE: z.string().optional().describe('Representante de 3D Pixel Perfection'),
  
  // Temas de renders
  TEMA_1: z.string().optional().describe('Primer tema/estilo de render'),
  TEMA_2: z.string().optional().describe('Segundo tema/estilo de render'),
  
  // Estados de confirmación
  CONFIRMADO_1: z.string().optional().describe('Estado de confirmación del tema 1'),
  CONFIRMADO_2: z.string().optional().describe('Estado de confirmación del tema 2'),
  
  // Estados de renderizado
  EN_RENDERS_1: z.string().optional().describe('Estado de render del tema 1'),
  EN_RENDERS_2: z.string().optional().describe('Estado de render del tema 2')
});

/**
 * ANEXO C - Control de cambios y rondas de revisión
 * 24 campos para manejar hasta 7 cambios por ronda
 */
export const AnexoCSchema = z.object({
  NOMBRE_EVENTO: z.string().optional().default('').describe('Nombre del evento'),
  RONDA: z.string().optional().describe('Número de ronda de revisión'),
  TOTAL_CAMBIOS_RONDA: z.string().optional().describe('Total de cambios en esta ronda'),
  CLIENTE_ACEPTA_RONDA: z.string().optional().describe('¿Cliente acepta la ronda? (Sí/No)'),
  
  // Cambios (hasta 7)
  CAMBIO_1: z.string().optional().describe('Descripción del cambio 1'),
  CAMBIO_2: z.string().optional().describe('Descripción del cambio 2'),
  CAMBIO_3: z.string().optional().describe('Descripción del cambio 3'),
  CAMBIO_4: z.string().optional().describe('Descripción del cambio 4'),
  CAMBIO_5: z.string().optional().describe('Descripción del cambio 5'),
  CAMBIO_6: z.string().optional().describe('Descripción del cambio 6'),
  CAMBIO_7: z.string().optional().describe('Descripción del cambio 7'),
  
  // Estados actuales
  ESTADO_ACTUAL_1: z.string().optional().describe('Estado actual del cambio 1'),
  ESTADO_ACTUAL_2: z.string().optional().describe('Estado actual del cambio 2'),
  ESTADO_ACTUAL_3: z.string().optional().describe('Estado actual del cambio 3'),
  ESTADO_ACTUAL_4: z.string().optional().describe('Estado actual del cambio 4'),
  ESTADO_ACTUAL_5: z.string().optional().describe('Estado actual del cambio 5'),
  ESTADO_ACTUAL_6: z.string().optional().describe('Estado actual del cambio 6'),
  ESTADO_ACTUAL_7: z.string().optional().describe('Estado actual del cambio 7'),
  
  // Estados solicitados
  ESTADO_SOLICITADO_1: z.string().optional().describe('Estado solicitado para el cambio 1'),
  ESTADO_SOLICITADO_2: z.string().optional().describe('Estado solicitado para el cambio 2'),
  ESTADO_SOLICITADO_3: z.string().optional().describe('Estado solicitado para el cambio 3'),
  ESTADO_SOLICITADO_4: z.string().optional().describe('Estado solicitado para el cambio 4'),
  ESTADO_SOLICITADO_5: z.string().optional().describe('Estado solicitado para el cambio 5'),
  ESTADO_SOLICITADO_6: z.string().optional().describe('Estado solicitado para el cambio 6'),
  ESTADO_SOLICITADO_7: z.string().optional().describe('Estado solicitado para el cambio 7'),
  
  // Estados de ejecución
  EJECUTADO_1: z.string().optional().describe('¿Cambio 1 ejecutado? (Sí/No)'),
  EJECUTADO_2: z.string().optional().describe('¿Cambio 2 ejecutado? (Sí/No)'),
  EJECUTADO_3: z.string().optional().describe('¿Cambio 3 ejecutado? (Sí/No)'),
  EJECUTADO_4: z.string().optional().describe('¿Cambio 4 ejecutado? (Sí/No)'),
  EJECUTADO_5: z.string().optional().describe('¿Cambio 5 ejecutado? (Sí/No)'),
  EJECUTADO_6: z.string().optional().describe('¿Cambio 6 ejecutado? (Sí/No)'),
  EJECUTADO_7: z.string().optional().describe('¿Cambio 7 ejecutado? (Sí/No)')
});

/**
 * ANEXO D - Entrega final y autorización de pago
 * 21 campos + lógica condicional con OPCION A/B/C/D
 */
export const AnexoDSchema = z.object({
  NOMBRE_EVENTO: z.string().optional().default('').describe('Nombre del evento'),
  PAQUETE: z.string().optional().describe('Tipo de paquete contratado'),
  FECHA_ENTREGA: z.string().optional().describe('Fecha de entrega final'),
  FECHA_CLIENTE: z.string().optional().describe('Fecha del cliente'),
  FIRMA_CLIENTE: z.string().optional().describe('Firma del cliente'),
  
  // Información de entrega
  CANTIDAD_RENDERS_ENTREGADOS: z.string().optional().describe('Cantidad de renders entregados'),
  FORMATOS_CORRECTOS: z.string().optional().describe('¿Formatos correctos? (Sí/No)'),
  RESOLUCION_ALTA: z.string().optional().describe('¿Resolución alta? (Sí/No)'),
  DEFECTOS_VISUALES: z.string().optional().describe('¿Tiene defectos visuales? (Sí/No)'),
  
  // Información financiera
  COSTO: z.string().optional().describe('Costo total'),
  TOTAL: z.string().optional().describe('Total a pagar'),
  AUTORIZA_PAGO: z.string().optional().describe('¿Cliente autoriza pago? (Sí/No)'),
  
  // Ronda 4 específica
  COSTO_RONDA_4: z.string().optional().describe('Costo de la ronda 4'),
  AUTORIZA_PAGO_RONDA_4: z.string().optional().describe('¿Autoriza pago ronda 4? (Sí/No)'),
  
  // Cambios ejecutados
  CAMBIOS_EJECUTADOS: z.string().optional().describe('Cambios ejecutados'),
  CAMBIO_1: z.string().optional().describe('Cambio 1 realizado'),
  CAMBIO_2: z.string().optional().describe('Cambio 2 realizado'),
  CAMBIO_3: z.string().optional().describe('Cambio 3 realizado'),
  
  // Motivos
  MOTIVO_1: z.string().optional().describe('Motivo 1'),
  MOTIVO_2: z.string().optional().describe('Motivo 2'),
  MOTIVO_3: z.string().optional().describe('Motivo 3'),
  
  // Campo para lógica condicional (OPCION A/B/C/D)
  OPCION: z.enum(['A', 'B', 'C', 'D']).optional().describe('Opción seleccionada para lógica condicional')
});

/**
 * Schema unificado que mapea cada tipo de documento a su schema correspondiente
 */
export const DocumentSchemasReal = {
  contrato_base: ContratoBaseSchema,
  anexo_a: AnexoASchema,
  anexo_b: AnexoBSchema,
  anexo_c: AnexoCSchema,
  anexo_d: AnexoDSchema,
} as const;

/**
 * Tipo TypeScript que representa los datos extraídos de cualquier documento
 */
export type ExtractedDataReal = 
  | z.infer<typeof ContratoBaseSchema>
  | z.infer<typeof AnexoASchema>
  | z.infer<typeof AnexoBSchema>
  | z.infer<typeof AnexoCSchema>
  | z.infer<typeof AnexoDSchema>;

/**
 * Función helper para obtener campos obligatorios por tipo de documento
 */
export function getRequiredFieldsReal(documentType: DocumentType): string[] {
  const requirements = {
    contrato_base: ['NOMBRE_CLIENTE', 'NOMBRE_EVENTO', 'FECHA_EVENTO', 'UBICACION', 'EVENTO'],
    anexo_a: ['NOMBRE_CLIENTE', 'FECHA_EVENTO'],
    anexo_b: ['CLIENTE', 'NOMBRE_EVENTO', 'FECHA_EVENTO'],
    anexo_c: ['NOMBRE_EVENTO'],
    anexo_d: ['NOMBRE_EVENTO']
  };
  return requirements[documentType];
}

/**
 * Función helper para obtener nombres de plantillas en Google Drive
 */
export function getTemplateNameReal(documentType: DocumentType): string {
  const templateNames = {
    contrato_base: 'Contrato Base 3D Pixel Perfection - Plantilla',
    anexo_a: 'ANEXO A - Plantilla', 
    anexo_b: 'ANEXO B - Plantilla',
    anexo_c: 'ANEXO C - Plantilla', 
    anexo_d: 'ANEXO D - Plantilla'
  };
  return templateNames[documentType];
}