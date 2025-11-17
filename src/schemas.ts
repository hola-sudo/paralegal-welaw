/**
 * Schemas Zod para validar y estructurar los datos extraídos de cada tipo de documento
 * 
 * Cada tipo de documento tiene placeholders específicos que necesitamos extraer.
 * Zod nos ayuda a validar que los datos extraídos tienen el formato correcto.
 */

import { z } from 'zod';

// Tipo de documento: define los 5 tipos posibles
export const DocumentTypeSchema = z.enum([
  'contrato_base',
  'anexo_a',
  'anexo_b',
  'anexo_c',
  'anexo_d'
]);

// Tipo TypeScript derivado del schema
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

/**
 * Schema para CONTRATO_BASE
 * Contiene los campos básicos de un contrato principal
 */
export const ContratoBaseSchema = z.object({
  // Información de las partes
  parte_1_nombre: z.string().describe('Nombre completo de la primera parte del contrato'),
  parte_1_tipo: z.string().optional().describe('Tipo de entidad: persona física, empresa, etc.'),
  parte_2_nombre: z.string().describe('Nombre completo de la segunda parte del contrato'),
  parte_2_tipo: z.string().optional().describe('Tipo de entidad: persona física, empresa, etc.'),
  
  // Fechas importantes
  fecha_firma: z.string().describe('Fecha de firma del contrato (formato: DD/MM/YYYY)'),
  fecha_inicio: z.string().optional().describe('Fecha de inicio del contrato'),
  fecha_vencimiento: z.string().optional().describe('Fecha de vencimiento del contrato'),
  
  // Términos del contrato
  objeto_contrato: z.string().describe('Descripción del objeto o propósito del contrato'),
  monto_total: z.string().optional().describe('Monto total del contrato si aplica'),
  moneda: z.string().optional().describe('Moneda del monto (MXN, USD, etc.)'),
  
  // Condiciones generales
  condiciones_pago: z.string().optional().describe('Condiciones de pago establecidas'),
  jurisdiccion: z.string().optional().describe('Jurisdicción aplicable al contrato'),
  ley_aplicable: z.string().optional().describe('Ley que rige el contrato'),
});

/**
 * Schema para ANEXO_A
 * Generalmente contiene términos y condiciones adicionales
 */
export const AnexoASchema = z.object({
  id_anexo: z.string().describe('Identificador único del anexo A'),
  referencia_contrato: z.string().optional().describe('Referencia al contrato base'),
  
  // Términos específicos
  clausulas_adicionales: z.array(z.string()).optional().describe('Lista de cláusulas adicionales'),
  modificaciones: z.string().optional().describe('Modificaciones al contrato base'),
  
  // Fechas
  fecha_anexo: z.string().describe('Fecha del anexo A'),
  vigencia: z.string().optional().describe('Período de vigencia del anexo'),
  
  // Otros campos
  descripcion: z.string().describe('Descripción general del anexo A'),
  firmantes: z.array(z.string()).optional().describe('Lista de firmantes del anexo'),
});

/**
 * Schema para ANEXO_B
 * Generalmente contiene especificaciones técnicas o productos
 */
export const AnexoBSchema = z.object({
  id_anexo: z.string().describe('Identificador único del anexo B'),
  referencia_contrato: z.string().optional().describe('Referencia al contrato base'),
  
  // Especificaciones
  especificaciones_tecnicas: z.array(z.string()).optional().describe('Lista de especificaciones técnicas'),
  productos_servicios: z.array(z.string()).optional().describe('Lista de productos o servicios detallados'),
  
  // Cantidades y precios
  cantidades: z.record(z.string(), z.string()).optional().describe('Cantidades por producto/servicio'),
  precios_unitarios: z.record(z.string(), z.string()).optional().describe('Precios unitarios por producto/servicio'),
  
  // Fechas
  fecha_anexo: z.string().describe('Fecha del anexo B'),
  
  // Otros
  descripcion: z.string().describe('Descripción general del anexo B'),
  entregables: z.array(z.string()).optional().describe('Lista de entregables'),
});

/**
 * Schema para ANEXO_C
 * Generalmente contiene términos de pago o financieros
 */
export const AnexoCSchema = z.object({
  id_anexo: z.string().describe('Identificador único del anexo C'),
  referencia_contrato: z.string().optional().describe('Referencia al contrato base'),
  
  // Información financiera
  condiciones_pago: z.string().describe('Condiciones de pago detalladas'),
  metodo_pago: z.string().optional().describe('Método de pago (transferencia, cheque, etc.)'),
  cuenta_bancaria: z.string().optional().describe('Información de cuenta bancaria si aplica'),
  
  // Montos y fechas
  monto_total: z.string().optional().describe('Monto total del anexo C'),
  moneda: z.string().optional().describe('Moneda'),
  fecha_anexo: z.string().describe('Fecha del anexo C'),
  
  // Plazos
  plazo_pago: z.string().optional().describe('Plazo de pago establecido'),
  fechas_pago: z.array(z.string()).optional().describe('Fechas específicas de pago'),
  
  // Otros
  descripcion: z.string().describe('Descripción general del anexo C'),
  penalizaciones: z.string().optional().describe('Penalizaciones por incumplimiento de pago'),
});

/**
 * Schema para ANEXO_D
 * Generalmente contiene información de contacto o administrativa
 */
export const AnexoDSchema = z.object({
  id_anexo: z.string().describe('Identificador único del anexo D'),
  referencia_contrato: z.string().optional().describe('Referencia al contrato base'),
  
  // Información de contacto
  contactos_parte_1: z.array(z.object({
    nombre: z.string(),
    cargo: z.string().optional(),
    email: z.string().optional(),
    telefono: z.string().optional(),
  })).optional().describe('Contactos de la primera parte'),
  
  contactos_parte_2: z.array(z.object({
    nombre: z.string(),
    cargo: z.string().optional(),
    email: z.string().optional(),
    telefono: z.string().optional(),
  })).optional().describe('Contactos de la segunda parte'),
  
  // Direcciones
  direccion_notificaciones: z.string().optional().describe('Dirección para notificaciones'),
  
  // Fechas
  fecha_anexo: z.string().describe('Fecha del anexo D'),
  
  // Otros
  descripcion: z.string().describe('Descripción general del anexo D'),
  procedimientos_comunicacion: z.string().optional().describe('Procedimientos de comunicación establecidos'),
});

/**
 * Schema unificado que mapea cada tipo de documento a su schema correspondiente
 */
export const DocumentSchemas = {
  contrato_base: ContratoBaseSchema,
  anexo_a: AnexoASchema,
  anexo_b: AnexoBSchema,
  anexo_c: AnexoCSchema,
  anexo_d: AnexoDSchema,
} as const;

/**
 * Tipo TypeScript que representa los datos extraídos de cualquier documento
 */
export type ExtractedData = 
  | z.infer<typeof ContratoBaseSchema>
  | z.infer<typeof AnexoASchema>
  | z.infer<typeof AnexoBSchema>
  | z.infer<typeof AnexoCSchema>
  | z.infer<typeof AnexoDSchema>;

