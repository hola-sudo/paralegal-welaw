/**
 * Generador de PDFs profesional usando PDFMake
 * 
 * Solución 100% compatible con Vercel Serverless
 * Sin dependencias pesadas, sin timeouts, sin vulnerabilidades
 */

import { DocumentType } from './schemas-real';

// Importación dinámica de pdfmake para evitar problemas de tipos
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

// Configurar fuentes de pdfmake
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else {
  console.warn('⚠️ Fuentes de pdfMake no encontradas, usando fuentes del sistema');
}

// Tipo flexible para datos extraídos
type ExtractedData = Record<string, any>;

export interface PDFGeneratorOptions {
  templateType: DocumentType;
  extractedData: ExtractedData;
  documentName: string;
  includeMetadata: boolean;
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  fileName?: string;
  downloadUrl?: string;
  error?: string;
}

/**
 * Estilos base para todos los documentos
 */
const baseStyles = {
  header: {
    fontSize: 18,
    bold: true,
    alignment: 'center' as const,
    margin: [0, 0, 0, 20] as [number, number, number, number]
  },
  subheader: {
    fontSize: 14,
    bold: true,
    margin: [0, 20, 0, 10] as [number, number, number, number]
  },
  clausula: {
    fontSize: 12,
    bold: true,
    margin: [0, 15, 0, 5] as [number, number, number, number]
  },
  subclausula: {
    fontSize: 11,
    bold: true,
    margin: [0, 10, 0, 3] as [number, number, number, number]
  },
  normal: {
    fontSize: 11,
    lineHeight: 1.3,
    margin: [0, 0, 0, 10] as [number, number, number, number]
  },
  firma: {
    fontSize: 11,
    margin: [0, 30, 0, 5] as [number, number, number, number],
    alignment: 'center' as const
  },
  fecha: {
    fontSize: 11,
    margin: [0, 20, 0, 20] as [number, number, number, number],
    alignment: 'center' as const
  }
};

/**
 * Template para Contrato Base - CAMPOS EXACTOS DEL .DOCX REAL
 */
function createContratoBase(data: any) {
  return {
    content: [
      { text: 'CONTRATO BASE 3D PIXEL PERFECTION', style: 'header' },
      { text: 'ENCABEZADO', style: 'subheader' },
      { text: 'CONTRATO DE PRESTACIÓN DE SERVICIOS DE RENDERIZACIÓN 3D', style: 'subheader' },
      
      { text: '\nEntre 3D PIXEL PERFECTION (Emmanuel Meneses García, RFC—)', style: 'normal' },
      { text: '— de aquí en adelante "3D Pixel Perfection" —', style: 'normal' },
      
      { 
        text: [
          'y ',
          { text: data.NOMBRE_CLIENTE || '{{NOMBRE_CLIENTE}}', bold: true },
          ' RFC ',
          { text: data.RFC_cliente || '{{RFC_cliente}}', bold: true }
        ], 
        style: 'normal' 
      },
      { text: '— de aquí en adelante "El Planner".', style: 'normal' },

      { text: '\nSECCIÓN 1: BÁSICOS DEL ACUERDO', style: 'clausula' },
      
      { text: '1.1 Qué es esto', style: 'subclausula' },
      { 
        text: [
          'El Planner quiere que hagamos renders 3D del evento ',
          { text: data.NOMBRE_EVENTO || '{{NOMBRE_EVENTO}}', bold: true },
          ' para ',
          { text: data.FECHA_EVENTO || '{{FECHA_EVENTO}}', bold: true },
          ' en ',
          { text: data.UBICACION || '{{UBICACIÓN}}', bold: true },
          '.'
        ], 
        style: 'normal' 
      },

      { text: '3D Pixel Perfection prometemos:', style: 'normal' },
      { 
        text: [
          'Renders fotorrealistas del evento ',
          { text: data.EVENTO || '{{EVENTO}}', bold: true }
        ], 
        style: 'normal' 
      },
      { text: 'Archivos en alta resolución', style: 'normal' },
      { text: 'Revisiones incluidas (hasta 3 rondas)', style: 'normal' },
      { text: 'Entrega dentro del timeline acordado', style: 'normal' },

      { text: '1.2 Qué NO Cubre', style: 'subclausula' },
      { text: '✗ Cambios estéticos (El Planner cambió de opinión) → Se cobran como cambios', style: 'normal' },
      { text: '✗ Especificaciones no incluidas en este contrato', style: 'normal' },
      { text: '✗ Renders adicionales fuera del paquete original', style: 'normal' },

      { text: '1.3 Timeline', style: 'subclausula' },
      { 
        text: [
          'Fecha del evento: ',
          { text: data.FECHA_EVENTO || '{{FECHA_EVENTO}}', bold: true },
          ' a las ',
          { text: data['HH:MM'] || '{{HH:MM}}', bold: true }
        ], 
        style: 'normal' 
      },
      { 
        text: [
          'Fecha de firma del contrato: ',
          { text: data['DD/MM/AAAA'] || '{{DD/MM/AAAA}}', bold: true }
        ], 
        style: 'normal' 
      },

      { text: '\nSECCIÓN 2: DETALLES TÉCNICOS', style: 'clausula' },
      { text: 'Las especificaciones técnicas completas se encuentran en los anexos:', style: 'normal' },
      { text: '• ANEXO A - Especificaciones de montaje y medidas', style: 'normal' },
      { text: '• ANEXO B - Renders y temas visuales', style: 'normal' },
      { text: '• ANEXO C - Control de cambios y revisiones', style: 'normal' },
      { text: '• ANEXO D - Entrega final y autorización', style: 'normal' },

      { text: '\n\nFIRMAS DE CONFORMIDAD:', style: 'clausula' },
      
      {
        columns: [
          {
            width: '50%',
            text: [
              '\n\n_________________________\n',
              { text: data.NOMBRE_CLIENTE || '{{NOMBRE_CLIENTE}}', bold: true },
              '\n"El Planner"'
            ],
            style: 'firma'
          },
          {
            width: '50%',
            text: [
              '\n\n_________________________\n',
              { text: 'Emmanuel Meneses García', bold: true },
              '\n3D PIXEL PERFECTION'
            ],
            style: 'firma'
          }
        ]
      },

      { 
        text: [
          '\nFecha de firma: ',
          { text: data['DD/MM/AAAA'] || new Date().toLocaleDateString('es-ES'), bold: true }
        ],
        style: 'fecha' 
      }
    ],
    styles: baseStyles,
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Template para Anexo A - ESPECIFICACIONES EXACTAS DEL .DOCX REAL (61 campos)
 */
function createAnexoA(data: any) {
  return {
    content: [
      { text: 'ANEXO A - ESPECIFICACIONES TÉCNICAS DE MONTAJE', style: 'header' },
      { text: 'INSUMOS PARA RENDERS 3D', style: 'subheader' },
      
      { 
        text: [
          'Asunto: "INSUMOS — ',
          { text: data.NOMBRE_CLIENTE || '{{NOMBRE_CLIENTE}}', bold: true },
          ' — ',
          { text: data.FECHA_EVENTO || '{{FECHA_EVENTO}}', bold: true },
          '"'
        ],
        style: 'clausula' 
      },

      { text: '\nMEDIDAS DEL SALÓN', style: 'clausula' },
      { text: 'Archivos en formato pdf de los planos del salón con cotas (medidas):', style: 'normal' },
      { text: `Largo (m): ${data.MEDIDA_LARGO_SALON || '{{MEDIDA_LARGO_SALON}}'}`, style: 'normal' },
      { text: `Ancho (m): ${data.MEDIDA_ANCHO_SALON || '{{MEDIDA_ANCHO_SALON}}'}`, style: 'normal' },
      { text: `Alto (m): ${data.MEDIDA_ALTO_SALON || '{{MEDIDA_ALTO_SALON}}'}`, style: 'normal' },
      { text: `Número total de fotografías: ${data.NUMERO_FOTOS_SALON || '{{NUMERO_FOTOS_SALON}}'}`, style: 'normal' },

      { text: '\nESTADO DEL SALÓN', style: 'clausula' },
      { text: 'Fotografías y videos del estado actual del salón:', style: 'normal' },
      { text: `Número total de fotografías entregadas: ${data.NUMERO_FOTOS_ESTADO_SALON || '{{NUMERO_FOTOS_ESTADO_SALON}}'}`, style: 'normal' },
      { text: `Número total de videos entregados: ${data.NUMERO_VIDEOS_ESTADO_SALON || '{{NUMERO_VIDEOS_ESTADO_SALON}}'}`, style: 'normal' },

      { text: '\nMESAS', style: 'clausula' },
      { text: 'Tener referencia real de mesa con los siguientes datos:', style: 'normal' },
      { text: `Formato de mesa (tipo y forma): ${data.FORMATO_MESA || '{{FORMATO_MESA}}'}`, style: 'normal' },
      { text: `Medidas (largo, ancho, alto): ${data.MEDIDAS_MESA || '{{MEDIDAS_MESA}}'}`, style: 'normal' },
      { text: `Recubrimiento de mesa (mantel, camino): ${data.RECUBRIMIENTO_MESA || '{{RECUBRIMIENTO_MESA}}'}`, style: 'normal' },

      { text: '\nSILLAS', style: 'clausula' },
      { text: `Cantidad de sillas: ${data.CANTIDAD_SILLAS || '{{CANTIDAD_SILLAS}}'}`, style: 'normal' },
      { text: `Tipo de sillas: ${data.TIPO_SILLA || '{{TIPO_SILLA}}'}`, style: 'normal' },
      { text: `Número de fotografías de sillas: ${data.NUMERO_FOTOS_SILLAS || '{{NUMERO_FOTOS_SILLAS}}'}`, style: 'normal' },

      { text: '\nMONTAJE DE MESA', style: 'clausula' },
      { text: `Descripción del montaje: ${data.DESCRIPCION_MONTAJE_MESA || '{{DESCRIPCION_MONTAJE_MESA}}'}`, style: 'normal' },
      { text: `Número de fotografías del montaje: ${data.NUMERO_FOTOS_MONTAJE_MESA || '{{NUMERO_FOTOS_MONTAJE_MESA}}'}`, style: 'normal' },

      { text: '\nCENTRO DE MESA', style: 'clausula' },
      { text: `Descripción: ${data.DESCRIPCION_CENTRO_MESA || '{{DESCRIPCION_CENTRO_MESA}}'}`, style: 'normal' },
      { text: `Número de piezas: ${data.NUMERO_PIEZAS_CENTRO_MESA || '{{NUMERO_PIEZAS_CENTRO_MESA}}'}`, style: 'normal' },
      { text: `Número de fotografías: ${data.NUMERO_FOTOS_CENTRO_MESA || '{{NUMERO_FOTOS_CENTRO_MESA}}'}`, style: 'normal' },
      { text: `Flores (rosas, crisantemos, etc.): ${data.FLORES_CENTRO_MESA || '{{FLORES_CENTRO_MESA}}'}`, style: 'normal' },
      { text: `Follaje (dólar, eucalipto, etc.): ${data.FOLLAJE_CENTRO_MESA || '{{FOLLAJE_CENTRO_MESA}}'}`, style: 'normal' },
      { text: `Tipo de Base (florero, jarrón, estructura, oasis, etc.): ${data.BASE_CENTRO_MESA || '{{BASE_CENTRO_MESA}}'}`, style: 'normal' },
      { text: `Medidas de Base: ${data.MEDIDAS_BASE_CENTRO_MESA || '{{MEDIDAS_BASE_CENTRO_MESA}}'}`, style: 'normal' },
      { text: `Velas (tipo, cantidad y estilo): ${data.DETALLES_VELAS_CENTRO_MESA || '{{DETALLES_VELAS_CENTRO_MESA}}'}`, style: 'normal' },
      { text: `Fotografías de referencia de velas: ${data.NUMERO_FOTOS_VELAS_CENTRO_MESA || '{{NUMERO_FOTOS_VELAS_CENTRO_MESA}}'}`, style: 'normal' },

      { text: '\nPISTA DE BAILE', style: 'clausula' },
      { text: `Formato de pista: ${data.FORMATO_PISTA || '{{FORMATO_PISTA}}'}`, style: 'normal' },
      { text: `Medidas: ${data.MEDIDAS_PISTA || '{{MEDIDAS_PISTA}}'}`, style: 'normal' },
      { text: `Diseño: ${data.DISENO_PISTA || '{{DISENO_PISTA}}'}`, style: 'normal' },
      { text: `Número de fotografías: ${data.NUMERO_FOTOS_PISTA || '{{NUMERO_FOTOS_PISTA}}'}`, style: 'normal' },

      { text: '\nBARRA', style: 'clausula' },
      { text: `¿Hay barra?: ${data.HAY_BARRA || '{{HAY_BARRA}}'}`, style: 'normal' },
      ...(data.HAY_BARRA === 'Sí' || !data.HAY_BARRA ? [
        { text: `Medidas: ${data.MEDIDAS_BARRA || '{{MEDIDAS_BARRA}}'}`, style: 'normal' },
        { text: `Diseño: ${data.DISENO_BARRA || '{{DISENO_BARRA}}'}`, style: 'normal' },
        { text: `Número de fotografías: ${data.NUMERO_FOTOS_BARRA || '{{NUMERO_FOTOS_BARRA}}'}`, style: 'normal' }
      ] : []),

      { text: '\nCONTRABARRA', style: 'clausula' },
      { text: `¿Hay contrabarra?: ${data.HAY_CONTRABARRA || '{{HAY_CONTRABARRA}}'}`, style: 'normal' },
      ...(data.HAY_CONTRABARRA === 'Sí' || !data.HAY_CONTRABARRA ? [
        { text: `Medidas: ${data.MEDIDAS_CONTRABARRA || '{{MEDIDAS_CONTRABARRA}}'}`, style: 'normal' },
        { text: `Diseño: ${data.DISENO_CONTRABARRA || '{{DISENO_CONTRABARRA}}'}`, style: 'normal' },
        { text: `Número de fotografías: ${data.NUMERO_FOTOS_CONTRABARRA || '{{NUMERO_FOTOS_CONTRABARRA}}'}`, style: 'normal' }
      ] : []),

      { text: '\nESTRUCTURA DE JARDÍN', style: 'clausula' },
      { text: `¿Hay estructura de jardín?: ${data.HAY_JARDIN_ESTRUCTURA || '{{HAY_JARDIN_ESTRUCTURA}}'}`, style: 'normal' },
      ...(data.HAY_JARDIN_ESTRUCTURA === 'Sí' || !data.HAY_JARDIN_ESTRUCTURA ? [
        { text: `Medidas: ${data.MEDIDAS_JARDIN_ESTRUCTURA || '{{MEDIDAS_JARDIN_ESTRUCTURA}}'}`, style: 'normal' },
        { text: `Diseño: ${data.DISENO_JARDIN_ESTRUCTURA || '{{DISENO_JARDIN_ESTRUCTURA}}'}`, style: 'normal' },
        { text: `Número de fotografías: ${data.NUMERO_FOTOS_JARDIN_ESTRUCTURA || '{{NUMERO_FOTOS_JARDIN_ESTRUCTURA}}'}`, style: 'normal' }
      ] : []),

      { text: '\nCANDILES', style: 'clausula' },
      { text: `¿Hay candiles?: ${data.HAY_CANDILES || '{{HAY_CANDILES}}'}`, style: 'normal' },
      ...(data.HAY_CANDILES === 'Sí' || !data.HAY_CANDILES ? [
        { text: `Medidas: ${data.MEDIDAS_CANDILES || '{{MEDIDAS_CANDILES}}'}`, style: 'normal' },
        { text: `Diseño: ${data.DISENO_CANDILES || '{{DISENO_CANDILES}}'}`, style: 'normal' },
        { text: `Número de fotografías: ${data.NUMERO_FOTOS_CANDILES || '{{NUMERO_FOTOS_CANDILES}}'}`, style: 'normal' }
      ] : []),

      { text: '\nENTELADO DE TECHO', style: 'clausula' },
      { text: `¿Hay entelado de techo?: ${data.HAY_ENTELADO_TECHO || '{{HAY_ENTELADO_TECHO}}'}`, style: 'normal' },
      ...(data.HAY_ENTELADO_TECHO === 'Sí' || !data.HAY_ENTELADO_TECHO ? [
        { text: `Medidas: ${data.MEDIDAS_ENTELADO_TECHO || '{{MEDIDAS_ENTELADO_TECHO}}'}`, style: 'normal' },
        { text: `Diseño: ${data.DISENO_ENTELADO_TECHO || '{{DISENO_ENTELADO_TECHO}}'}`, style: 'normal' },
        { text: `Número de fotografías: ${data.NUMERO_FOTOS_ENTELADO_TECHO || '{{NUMERO_FOTOS_ENTELADO_TECHO}}'}`, style: 'normal' }
      ] : []),

      { text: '\nELEMENTOS DECORATIVOS', style: 'clausula' },
      { text: `Descripción: ${data.DESCRIPCION_ELEMENTO_DECORATIVO || '{{DESCRIPCION_ELEMENTO_DECORATIVO}}'}`, style: 'normal' },
      { text: `Medidas: ${data.MEDIDAS_ELEMENTO_DECORATIVO || '{{MEDIDAS_ELEMENTO_DECORATIVO}}'}`, style: 'normal' },
      { text: `Ubicación: ${data.UBICACION_ELEMENTO_DECORATIVO || '{{UBICACION_ELEMENTO_DECORATIVO}}'}`, style: 'normal' },
      { text: `Elementos incluidos: ${data.ELEMENTOS_INCLUIDOS || '{{ELEMENTOS_INCLUIDOS}}'}`, style: 'normal' },
      { text: `Número de fotografías: ${data.NUMERO_FOTOS_ELEMENTO_DECORATIVO || '{{NUMERO_FOTOS_ELEMENTO_DECORATIVO}}'}`, style: 'normal' },

      { text: '\nLAYOUT Y POSICIONAMIENTO', style: 'clausula' },
      { text: `Archivo de layout: ${data.ARCHIVO_LAYOUT || '{{ARCHIVO_LAYOUT}}'}`, style: 'normal' },
      { text: `Posición de mesas: ${data.POSICION_MESAS || '{{POSICION_MESAS}}'}`, style: 'normal' },
      { text: `Posición de elementos decorativos: ${data.POSICION_ELEMENTOS_DECORATIVOS || '{{POSICION_ELEMENTOS_DECORATIVOS}}'}`, style: 'normal' },
      { text: `Posición de elementos en techo: ${data.POSICION_ELEMENTOS_TECHO || '{{POSICION_ELEMENTOS_TECHO}}'}`, style: 'normal' },
      { text: `Posición de escenario: ${data.POSICION_ESCENARIO || '{{POSICION_ESCENARIO}}'}`, style: 'normal' },
      { text: `Posición de pista: ${data.POSICION_PISTA || '{{POSICION_PISTA}}'}`, style: 'normal' },
      { text: `Número de fotografías de layout: ${data.NUMERO_FOTOS_LAYOUT || '{{NUMERO_FOTOS_LAYOUT}}'}`, style: 'normal' }
    ].flat(),
    styles: baseStyles,
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Template para Anexo B - RENDERS Y TEMAS EXACTOS DEL .DOCX REAL (13 campos)
 */
function createAnexoB(data: any) {
  return {
    content: [
      { text: 'ANEXO B - RENDERS Y TEMAS', style: 'header' },
      { text: 'GESTIÓN DE RENDERS 3D', style: 'subheader' },

      { text: `Evento: ${data.NOMBRE_EVENTO || '{{NOMBRE_EVENTO}}'}`, style: 'normal' },
      { text: `Fecha del evento: ${data.FECHA_EVENTO || '{{FECHA_EVENTO}}'}`, style: 'normal' },

      { text: '\nTEMAS DE RENDERS', style: 'clausula' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'TEMA', style: 'clausula' },
              { text: 'DESCRIPCIÓN', style: 'clausula' },
              { text: 'EN RENDERS', style: 'clausula' },
              { text: 'CONFIRMADO', style: 'clausula' }
            ],
            [
              'Tema 1',
              data.TEMA_1 || '{{TEMA_1}}',
              data.EN_RENDERS_1 || '{{EN_RENDERS_1}}',
              data.CONFIRMADO_1 || '{{CONFIRMADO_1}}'
            ],
            [
              'Tema 2',
              data.TEMA_2 || '{{TEMA_2}}',
              data.EN_RENDERS_2 || '{{EN_RENDERS_2}}',
              data.CONFIRMADO_2 || '{{CONFIRMADO_2}}'
            ]
          ]
        },
        style: 'normal'
      },

      { text: '\nOBSERVACIONES ADICIONALES:', style: 'clausula' },
      { text: data['Agregar más si necesario'] || '{{Agregar más si necesario}}', style: 'normal' },

      { text: '\nINFORMACIÓN DE CONTACTO Y FECHAS', style: 'clausula' },
      
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [
              { text: 'CLIENTE', style: 'clausula' },
              { text: '3D PIXEL PERFECTION', style: 'clausula' }
            ],
            [
              `Nombre: ${data.CLIENTE || '{{CLIENTE}}'}`,
              `Representante: ${data.PIXEL_REPRESENTANTE || '{{PIXEL_REPRESENTANTE}}'}`
            ],
            [
              `Fecha: ${data.FECHA_CLIENTE || '{{FECHA_CLIENTE}}'}`,
              `Fecha: ${data.FECHA_PIXEL || '{{FECHA_PIXEL}}'}`
            ],
            [
              'Firma: _________________',
              'Firma: _________________'
            ]
          ]
        },
        style: 'normal'
      },

      { text: '\nNOTAS IMPORTANTES:', style: 'clausula' },
      { text: '• Los temas confirmados procesan a renders 3D', style: 'normal' },
      { text: '• Cualquier cambio posterior requiere nueva aprobación', style: 'normal' },
      { text: '• Los renders se basan en las especificaciones del Anexo A', style: 'normal' },
      { text: '• Tiempo estimado de renders: 5-7 días hábiles', style: 'normal' }
    ],
    styles: baseStyles,
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Template para Anexo C - CONTROL DE CAMBIOS EXACTO DEL .DOCX REAL (32 campos)
 */
function createAnexoC(data: any) {
  return {
    content: [
      { text: 'ANEXO C - CONTROL DE CAMBIOS', style: 'header' },
      { text: 'GESTIÓN DE RONDAS DE REVISIÓN', style: 'subheader' },

      { text: `Ronda #: ${data.RONDA || '{{RONDA}}'}`, style: 'clausula' },
      { text: `Evento: ${data.NOMBRE_EVENTO || '{{NOMBRE_EVENTO}}'}`, style: 'normal' },

      { text: '\nREGISTRO DETALLADO DE CAMBIOS', style: 'clausula' },
      
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', '*', 'auto'],
          body: [
            [
              { text: '#', style: 'clausula' },
              { text: 'CAMBIO SOLICITADO', style: 'clausula' },
              { text: 'ESTADO ACTUAL', style: 'clausula' },
              { text: 'ESTADO SOLICITADO', style: 'clausula' },
              { text: 'EJECUTADO', style: 'clausula' }
            ],
            [
              '1',
              data.CAMBIO_1 || '{{CAMBIO_1}}',
              data.ESTADO_ACTUAL_1 || '{{ESTADO_ACTUAL_1}}',
              data.ESTADO_SOLICITADO_1 || '{{ESTADO_SOLICITADO_1}}',
              data.EJECUTADO_1 || '{{EJECUTADO_1}}'
            ],
            [
              '2',
              data.CAMBIO_2 || '{{CAMBIO_2}}',
              data.ESTADO_ACTUAL_2 || '{{ESTADO_ACTUAL_2}}',
              data.ESTADO_SOLICITADO_2 || '{{ESTADO_SOLICITADO_2}}',
              data.EJECUTADO_2 || '{{EJECUTADO_2}}'
            ],
            [
              '3',
              data.CAMBIO_3 || '{{CAMBIO_3}}',
              data.ESTADO_ACTUAL_3 || '{{ESTADO_ACTUAL_3}}',
              data.ESTADO_SOLICITADO_3 || '{{ESTADO_SOLICITADO_3}}',
              data.EJECUTADO_3 || '{{EJECUTADO_3}}'
            ],
            [
              '4',
              data.CAMBIO_4 || '{{CAMBIO_4}}',
              data.ESTADO_ACTUAL_4 || '{{ESTADO_ACTUAL_4}}',
              data.ESTADO_SOLICITADO_4 || '{{ESTADO_SOLICITADO_4}}',
              data.EJECUTADO_4 || '{{EJECUTADO_4}}'
            ],
            [
              '5',
              data.CAMBIO_5 || '{{CAMBIO_5}}',
              data.ESTADO_ACTUAL_5 || '{{ESTADO_ACTUAL_5}}',
              data.ESTADO_SOLICITADO_5 || '{{ESTADO_SOLICITADO_5}}',
              data.EJECUTADO_5 || '{{EJECUTADO_5}}'
            ],
            [
              '6',
              data.CAMBIO_6 || '{{CAMBIO_6}}',
              data.ESTADO_ACTUAL_6 || '{{ESTADO_ACTUAL_6}}',
              data.ESTADO_SOLICITADO_6 || '{{ESTADO_SOLICITADO_6}}',
              data.EJECUTADO_6 || '{{EJECUTADO_6}}'
            ],
            [
              '7',
              data.CAMBIO_7 || '{{CAMBIO_7}}',
              data.ESTADO_ACTUAL_7 || '{{ESTADO_ACTUAL_7}}',
              data.ESTADO_SOLICITADO_7 || '{{ESTADO_SOLICITADO_7}}',
              data.EJECUTADO_7 || '{{EJECUTADO_7}}'
            ]
          ]
        },
        style: 'normal'
      },

      { text: '\nRESUMEN DE LA RONDA', style: 'clausula' },
      { text: `Total de cambios en esta ronda: ${data.TOTAL_CAMBIOS_RONDA || '{{TOTAL_CAMBIOS_RONDA}}'}`, style: 'normal' },
      { text: `¿Cliente acepta la ronda?: ${data.CLIENTE_ACEPTA_RONDA || '{{CLIENTE_ACEPTA_RONDA}}'}`, style: 'normal' },

      { text: '\nPROCESO DE RONDAS', style: 'clausula' },
      { text: '1. Cliente revisa renders y solicita cambios específicos', style: 'normal' },
      { text: '2. 3D Pixel Perfection evalúa factibilidad técnica', style: 'normal' },
      { text: '3. Se ejecutan cambios aprobados', style: 'normal' },
      { text: '4. Cliente revisa y acepta o solicita nueva ronda', style: 'normal' },
      { text: '5. Máximo 4 rondas incluidas sin costo adicional', style: 'normal' },

      { text: '\nIMPORTANTE:', style: 'clausula' },
      { text: '• Cada cambio debe estar claramente definido', style: 'normal' },
      { text: '• Solo se procede cuando toda la ronda esté aceptada', style: 'normal' },
      { text: '• Cambios adicionales pueden generar costos extras', style: 'normal' }
    ],
    styles: baseStyles,
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Template para Anexo D - ENTREGA FINAL EXACTO DEL .DOCX REAL (21 campos)
 */
function createAnexoD(data: any) {
  return {
    content: [
      { text: 'ANEXO D - ENTREGA FINAL', style: 'header' },
      { text: 'AUTORIZACIÓN DE PAGO Y CIERRE DE PROYECTO', style: 'subheader' },

      { text: `Evento: ${data.NOMBRE_EVENTO || '{{NOMBRE_EVENTO}}'}`, style: 'normal' },
      { text: `Fecha de entrega: ${data.FECHA_ENTREGA || '{{FECHA_ENTREGA}}'}`, style: 'normal' },

      { text: '\nDETALLES DE ENTREGA', style: 'clausula' },
      { text: `Cantidad de renders entregados: ${data.CANTIDAD_RENDERS_ENTREGADOS || '{{CANTIDAD_RENDERS_ENTREGADOS}}'}`, style: 'normal' },
      { text: `Paquete contratado: ${data.PAQUETE || '{{PAQUETE}}'}`, style: 'normal' },

      { text: '\nVERIFICACIÓN DE CALIDAD', style: 'clausula' },
      
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'CRITERIO DE CALIDAD', style: 'clausula' },
              { text: 'CUMPLE', style: 'clausula' }
            ],
            [
              'Formatos correctos (JPG, PNG alta resolución)',
              data.FORMATOS_CORRECTOS || '{{FORMATOS_CORRECTOS}}'
            ],
            [
              'Resolución alta (mínimo 1920x1080)',
              data.RESOLUCION_ALTA || '{{RESOLUCION_ALTA}}'
            ],
            [
              'Sin defectos visuales aparentes',
              data.DEFECTOS_VISUALES || '{{DEFECTOS_VISUALES}}'
            ]
          ]
        },
        style: 'normal'
      },

      { text: '\nCAMBIOS EJECUTADOS', style: 'clausula' },
      { text: `Total de cambios ejecutados: ${data.CAMBIOS_EJECUTADOS || '{{CAMBIOS_EJECUTADOS}}'}`, style: 'normal' },
      { text: `Cambio 1: ${data.CAMBIO_1 || '{{CAMBIO_1}}'}`, style: 'normal' },
      { text: `Cambio 2: ${data.CAMBIO_2 || '{{CAMBIO_2}}'}`, style: 'normal' },
      { text: `Cambio 3: ${data.CAMBIO_3 || '{{CAMBIO_3}}'}`, style: 'normal' },

      { text: '\nMOTIVOS DE CAMBIOS', style: 'clausula' },
      { text: `Motivo 1: ${data.MOTIVO_1 || '{{MOTIVO_1}}'}`, style: 'normal' },
      { text: `Motivo 2: ${data.MOTIVO_2 || '{{MOTIVO_2}}'}`, style: 'normal' },
      { text: `Motivo 3: ${data.MOTIVO_3 || '{{MOTIVO_3}}'}`, style: 'normal' },

      { text: '\nINFORMACIÓN FINANCIERA', style: 'clausula' },
      { text: `Costo del proyecto: ${data.COSTO || '{{COSTO}}'}`, style: 'normal' },
      { text: `Total a pagar: ${data.TOTAL || '{{TOTAL}}'}`, style: 'normal' },
      { text: `¿Cliente autoriza el pago?: ${data.AUTORIZA_PAGO || '{{AUTORIZA_PAGO}}'}`, style: 'normal' },

      { text: '\nRONDA 4 (Si aplica)', style: 'clausula' },
      { text: `Costo adicional Ronda 4: ${data.COSTO_RONDA_4 || '{{COSTO_RONDA_4}}'}`, style: 'normal' },
      { text: `¿Autoriza pago Ronda 4?: ${data.AUTORIZA_PAGO_RONDA_4 || '{{AUTORIZA_PAGO_RONDA_4}}'}`, style: 'normal' },

      { text: '\nFIRMA Y CONFORMIDAD', style: 'clausula' },
      
      {
        table: {
          headerRows: 1,
          widths: ['*', '*'],
          body: [
            [
              { text: 'CLIENTE', style: 'clausula' },
              { text: '3D PIXEL PERFECTION', style: 'clausula' }
            ],
            [
              `Firma: ${data.FIRMA_CLIENTE || '{{FIRMA_CLIENTE}}'}`,
              'Firma: _________________'
            ],
            [
              `Fecha: ${data.FECHA_CLIENTE || '{{FECHA_CLIENTE}}'}`,
              `Fecha: ${data.FECHA_ENTREGA || new Date().toLocaleDateString('es-ES')}`
            ]
          ]
        },
        style: 'normal'
      },

      { text: '\nPROCESO COMPLETADO', style: 'clausula' },
      { text: '• Cliente ha recibido todos los renders en formato solicitado', style: 'normal' },
      { text: '• Calidad verificada y aprobada por el cliente', style: 'normal' },
      { text: '• Pago autorizado y proyecto cerrado exitosamente', style: 'normal' },
      { text: '• Soporte post-entrega disponible por 30 días', style: 'normal' }
    ],
    styles: baseStyles,
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Función principal para generar PDFs
 */
export async function generatePDF(options: PDFGeneratorOptions): Promise<PDFGenerationResult> {
  try {
    console.log('🚀 Iniciando generación de PDF con PDFMake...');
    console.log('📄 Tipo:', options.templateType);
    
    let documentDefinition;
    
    // Seleccionar template según tipo de documento
    switch (options.templateType) {
      case 'contrato_base':
        documentDefinition = createContratoBase(options.extractedData);
        break;
      case 'anexo_a':
        documentDefinition = createAnexoA(options.extractedData);
        break;
      case 'anexo_b':
        documentDefinition = createAnexoB(options.extractedData);
        break;
      case 'anexo_c':
        documentDefinition = createAnexoC(options.extractedData);
        break;
      case 'anexo_d':
        documentDefinition = createAnexoD(options.extractedData);
        break;
      default:
        throw new Error(`Tipo de documento no soportado: ${options.templateType}`);
    }

    // Generar PDF
    const pdfDoc = pdfMake.createPdf(documentDefinition);
    
    return new Promise((resolve, reject) => {
      pdfDoc.getBuffer((buffer: Buffer) => {
        const fileName = `${options.documentName}.pdf`;
        
        console.log('✅ PDF generado exitosamente');
        console.log('📦 Tamaño:', buffer.length, 'bytes');
        
        resolve({
          success: true,
          pdfBuffer: buffer,
          fileName: fileName,
          downloadUrl: `/api/download/${options.documentName}`
        });
      });
    });

  } catch (error: any) {
    console.error('❌ Error generando PDF:', error);
    return {
      success: false,
      error: `Error en generación de PDF: ${error.message}`
    };
  }
}