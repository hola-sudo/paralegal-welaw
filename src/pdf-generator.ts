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
 * Template para Contrato Base - EVENTOS Y DECORACIÓN
 */
function createContratoBase(data: any) {
  return {
    content: [
      { text: 'CONTRATO BASE 3D PIXEL PERFECTION', style: 'header' },
      { text: 'CONTRATO DE PRESTACIÓN DE SERVICIOS DE DECORACIÓN Y RENDERS 3D PARA EVENTOS', style: 'subheader' },
      
      { text: '\nDATOS DEL EVENTO:', style: 'clausula' },
      { 
        text: [
          'CLIENTE: ',
          { text: data.NOMBRE_CLIENTE || '[NOMBRE DEL CLIENTE]', bold: true }
        ], 
        style: 'normal' 
      },
      { 
        text: [
          'RFC: ',
          { text: data.RFC_cliente || '[RFC DEL CLIENTE]', bold: true }
        ], 
        style: 'normal' 
      },
      { 
        text: [
          'EVENTO: ',
          { text: data.NOMBRE_EVENTO || '[NOMBRE DEL EVENTO]', bold: true }
        ], 
        style: 'normal' 
      },
      { 
        text: [
          'TIPO DE EVENTO: ',
          { text: data.EVENTO || '[TIPO DE EVENTO]', bold: true }
        ], 
        style: 'normal' 
      },
      { 
        text: [
          'FECHA DEL EVENTO: ',
          { text: data.FECHA_EVENTO || '[DD/MM/AAAA]', bold: true }
        ], 
        style: 'normal' 
      },
      { 
        text: [
          'HORA: ',
          { text: data['HH:MM'] || '[HH:MM]', bold: true }
        ], 
        style: 'normal' 
      },
      { 
        text: [
          'UBICACIÓN: ',
          { text: data.UBICACION || '[UBICACIÓN DEL EVENTO]', bold: true }
        ], 
        style: 'normal' 
      },

      { text: '\nPARTES DEL CONTRATO:', style: 'clausula' },
      { 
        text: [
          'CONTRATANTE: ',
          { text: data.NOMBRE_CLIENTE || '[NOMBRE DEL CLIENTE]', bold: true },
          ', organizador del evento.'
        ], 
        style: 'normal' 
      },
      { 
        text: [
          'CONTRATADO: ',
          { text: '3D PIXEL PERFECTION', bold: true },
          ', empresa especializada en decoración de eventos y renders 3D profesionales.'
        ], 
        style: 'normal' 
      },

      { text: 'PRIMERA: OBJETO DEL CONTRATO', style: 'clausula' },
      { 
        text: 'El presente contrato tiene por objeto la prestación de servicios de decoración integral para eventos, incluyendo diseño, montaje, renders 3D previos y supervisión del evento especificado.',
        style: 'normal' 
      },

      { text: 'SEGUNDA: SERVICIOS INCLUIDOS', style: 'clausula' },
      {
        ul: [
          'Diseño y renders 3D previos del evento',
          'Decoración integral del salón',
          'Montaje de centros de mesa y elementos decorativos',
          'Instalación de mobiliario y estructuras especiales',
          'Supervisión durante el evento',
          'Desmontaje posterior'
        ],
        style: 'normal'
      },

      { text: 'TERCERA: FECHAS IMPORTANTES', style: 'clausula' },
      { 
        text: [
          'Fecha del evento: ',
          { text: data.FECHA_EVENTO || '[DD/MM/AAAA]', bold: true },
          '\nHora del evento: ',
          { text: data['HH:MM'] || '[HH:MM]', bold: true },
          '\nFecha de firma: ',
          { text: data['DD/MM/AAAA'] || new Date().toLocaleDateString('es-ES'), bold: true }
        ],
        style: 'normal' 
      },

      { text: 'CUARTA: RESPONSABILIDADES', style: 'clausula' },
      { 
        text: 'Las especificaciones técnicas detalladas se encuentran en los anexos correspondientes. 3D PIXEL PERFECTION se compromete a ejecutar el montaje según las especificaciones acordadas.',
        style: 'normal' 
      },

      { text: '\n\nFIRMAS:', style: 'clausula' },
      
      {
        columns: [
          {
            width: '50%',
            text: [
              '\n\n_________________________\n',
              { text: data.NOMBRE_CLIENTE || '[NOMBRE DEL CLIENTE]', bold: true },
              '\nCLIENTE'
            ],
            style: 'firma'
          },
          {
            width: '50%',
            text: [
              '\n\n_________________________\n',
              { text: 'DIRECTOR GENERAL', bold: true },
              '\n3D PIXEL PERFECTION'
            ],
            style: 'firma'
          }
        ]
      },

      { 
        text: `\nFecha de firma: ${data['DD/MM/AAAA'] || new Date().toLocaleDateString('es-ES')}`,
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
 * Template para Anexo A - ESPECIFICACIONES TÉCNICAS DE MONTAJE
 */
function createAnexoA(data: any) {
  return {
    content: [
      { text: 'ANEXO A - ESPECIFICACIONES TÉCNICAS DE MONTAJE', style: 'header' },
      { text: 'DECORACIÓN INTEGRAL DEL EVENTO', style: 'subheader' },
      
      { text: '\nDATOS DEL EVENTO:', style: 'clausula' },
      { text: `Cliente: ${data.NOMBRE_CLIENTE || '[NOMBRE CLIENTE]'}`, style: 'normal' },
      { text: `Fecha del evento: ${data.FECHA_EVENTO || '[FECHA EVENTO]'}`, style: 'normal' },

      { text: 'MEDIDAS DEL SALÓN:', style: 'clausula' },
      { text: `Largo: ${data.MEDIDA_LARGO_SALON || '[LARGO]'} metros`, style: 'normal' },
      { text: `Ancho: ${data.MEDIDA_ANCHO_SALON || '[ANCHO]'} metros`, style: 'normal' },
      { text: `Alto: ${data.MEDIDA_ALTO_SALON || '[ALTO]'} metros`, style: 'normal' },

      { text: 'CENTROS DE MESA:', style: 'clausula' },
      { text: `Descripción: ${data.DESCRIPCION_CENTRO_MESA || '[DESCRIPCIÓN]'}`, style: 'normal' },
      { text: `Base: ${data.BASE_CENTRO_MESA || '[TIPO DE BASE]'}`, style: 'normal' },
      { text: `Medidas de base: ${data.MEDIDAS_BASE_CENTRO_MESA || '[MEDIDAS]'}`, style: 'normal' },
      { text: `Flores: ${data.FLORES_CENTRO_MESA || '[TIPO DE FLORES]'}`, style: 'normal' },
      { text: `Follaje: ${data.FOLLAJE_CENTRO_MESA || '[TIPO DE FOLLAJE]'}`, style: 'normal' },
      { text: `Velas: ${data.DETALLES_VELAS_CENTRO_MESA || '[DETALLES DE VELAS]'}`, style: 'normal' },
      { text: `Número de piezas: ${data.NUMERO_PIEZAS_CENTRO_MESA || '[CANTIDAD]'}`, style: 'normal' },

      { text: 'MOBILIARIO:', style: 'clausula' },
      { text: `Formato de mesa: ${data.FORMATO_MESA || '[REDONDA/RECTANGULAR]'}`, style: 'normal' },
      { text: `Medidas de mesa: ${data.MEDIDAS_MESA || '[MEDIDAS]'}`, style: 'normal' },
      { text: `Cantidad de sillas: ${data.CANTIDAD_SILLAS || '[NÚMERO]'}`, style: 'normal' },
      { text: `Tipo de sillas: ${data.TIPO_SILLA || '[TIPO]'}`, style: 'normal' },
      { text: `Recubrimiento: ${data.RECUBRIMIENTO_MESA || '[MANTELERÍA]'}`, style: 'normal' },
      { text: `Montaje: ${data.DESCRIPCION_MONTAJE_MESA || '[DESCRIPCIÓN]'}`, style: 'normal' },

      { text: 'ELEMENTOS DECORATIVOS:', style: 'clausula' },
      { text: `Descripción: ${data.DESCRIPCION_ELEMENTO_DECORATIVO || '[ELEMENTOS]'}`, style: 'normal' },
      { text: `Medidas: ${data.MEDIDAS_ELEMENTO_DECORATIVO || '[MEDIDAS]'}`, style: 'normal' },
      { text: `Ubicación: ${data.UBICACION_ELEMENTO_DECORATIVO || '[UBICACIÓN]'}`, style: 'normal' },

      { text: 'ESTRUCTURAS ESPECIALES:', style: 'clausula' },
      
      // Barra
      data.HAY_BARRA === 'Sí' ? [
        { text: 'BARRA:', style: 'subclausula' },
        { text: `Diseño: ${data.DISENO_BARRA || '[DISEÑO]'}`, style: 'normal' },
        { text: `Medidas: ${data.MEDIDAS_BARRA || '[MEDIDAS]'}`, style: 'normal' }
      ] : { text: 'BARRA: No incluida', style: 'normal' },

      // Pista de baile
      data.HAY_PISTA === 'Sí' ? [
        { text: 'PISTA DE BAILE:', style: 'subclausula' },
        { text: `Diseño: ${data.DISENO_PISTA || '[DISEÑO]'}`, style: 'normal' },
        { text: `Formato: ${data.FORMATO_PISTA || '[FORMATO]'}`, style: 'normal' },
        { text: `Medidas: ${data.MEDIDAS_PISTA || '[MEDIDAS]'}`, style: 'normal' }
      ] : { text: 'PISTA DE BAILE: No incluida', style: 'normal' },

      // Candiles
      data.HAY_CANDILES === 'Sí' ? [
        { text: 'CANDILES:', style: 'subclausula' },
        { text: `Diseño: ${data.DISENO_CANDILES || '[DISEÑO]'}`, style: 'normal' },
        { text: `Medidas: ${data.MEDIDAS_CANDILES || '[MEDIDAS]'}`, style: 'normal' }
      ] : { text: 'CANDILES: No incluidos', style: 'normal' },

      // Entelado de techo
      data.HAY_ENTELADO_TECHO === 'Sí' ? [
        { text: 'ENTELADO DE TECHO:', style: 'subclausula' },
        { text: `Diseño: ${data.DISENO_ENTELADO_TECHO || '[DISEÑO]'}`, style: 'normal' },
        { text: `Medidas: ${data.MEDIDAS_ENTELADO_TECHO || '[MEDIDAS]'}`, style: 'normal' }
      ] : { text: 'ENTELADO DE TECHO: No incluido', style: 'normal' },

      { text: 'POSICIONAMIENTO:', style: 'clausula' },
      { text: `Posición de mesas: ${data.POSICION_MESAS || '[DISTRIBUCIÓN]'}`, style: 'normal' },
      { text: `Posición de pista: ${data.POSICION_PISTA || '[UBICACIÓN]'}`, style: 'normal' },
      { text: `Posición de escenario: ${data.POSICION_ESCENARIO || '[UBICACIÓN]'}`, style: 'normal' },

      { text: 'DOCUMENTACIÓN FOTOGRÁFICA:', style: 'clausula' },
      { text: 'Se realizará seguimiento fotográfico de:', style: 'normal' },
      {
        ul: [
          `Estado del salón (${data.NUMERO_FOTOS_ESTADO_SALON || 'X'} fotos)`,
          `Layout general (${data.NUMERO_FOTOS_LAYOUT || 'X'} fotos)`,
          `Centros de mesa (${data.NUMERO_FOTOS_CENTRO_MESA || 'X'} fotos)`,
          `Montaje de mobiliario (${data.NUMERO_FOTOS_MONTAJE_MESA || 'X'} fotos)`,
          `Elementos decorativos (${data.NUMERO_FOTOS_ELEMENTO_DECORATIVO || 'X'} fotos)`
        ],
        style: 'normal'
      }
    ].flat(),
    styles: baseStyles,
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Template para Anexo B - RENDERS Y TEMAS DEL EVENTO
 */
function createAnexoB(data: any) {
  return {
    content: [
      { text: 'ANEXO B - RENDERS Y TEMAS DEL EVENTO', style: 'header' },
      { text: 'VISUALIZACIÓN 3D PREVIA', style: 'subheader' },

      { text: 'DATOS DEL EVENTO:', style: 'clausula' },
      { text: `Cliente: ${data.CLIENTE || data.NOMBRE_CLIENTE || '[NOMBRE CLIENTE]'}`, style: 'normal' },
      { text: `Evento: ${data.NOMBRE_EVENTO || '[NOMBRE DEL EVENTO]'}`, style: 'normal' },
      { text: `Fecha del evento: ${data.FECHA_EVENTO || '[FECHA EVENTO]'}`, style: 'normal' },

      { text: 'FECHAS DE PROCESO:', style: 'clausula' },
      { text: `Fecha cliente: ${data.FECHA_CLIENTE || '[FECHA CLIENTE]'}`, style: 'normal' },
      { text: `Fecha Pixel: ${data.FECHA_PIXEL || '[FECHA PIXEL]'}`, style: 'normal' },
      { text: `Representante Pixel: ${data.PIXEL_REPRESENTANTE || '[REPRESENTANTE]'}`, style: 'normal' },

      { text: 'TEMAS Y ESTILOS DE RENDERS:', style: 'clausula' },
      
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'TEMA', style: 'clausula' },
              { text: 'DESCRIPCIÓN', style: 'clausula' },
              { text: 'CONFIRMADO', style: 'clausula' },
              { text: 'EN RENDERS', style: 'clausula' }
            ],
            [
              'Tema 1',
              data.TEMA_1 || '[DESCRIPCIÓN DEL TEMA 1]',
              data.CONFIRMADO_1 || '[SÍ/NO]',
              data.EN_RENDERS_1 || '[ESTADO]'
            ],
            [
              'Tema 2',
              data.TEMA_2 || '[DESCRIPCIÓN DEL TEMA 2]',
              data.CONFIRMADO_2 || '[SÍ/NO]',
              data.EN_RENDERS_2 || '[ESTADO]'
            ]
          ]
        },
        style: 'normal'
      },

      { text: '\nPROCESO DE RENDERS:', style: 'clausula' },
      {
        ol: [
          'Briefing inicial con el cliente',
          'Creación de renders 3D preliminares',
          'Revisión y ajustes con el cliente',
          'Renders finales para aprobación',
          'Entrega de archivos digitales'
        ],
        style: 'normal'
      },

      { text: 'ENTREGABLES:', style: 'clausula' },
      {
        ul: [
          'Renders 3D en alta resolución',
          'Vistas desde múltiples ángulos',
          'Archivos digitales en formato JPG/PNG',
          'Video recorrido 360° (opcional)',
          'Versión impresa para presentación'
        ],
        style: 'normal'
      },

      { text: 'NOTAS IMPORTANTES:', style: 'clausula' },
      { 
        text: 'Los renders se crean basándose en las especificaciones del Anexo A. Cualquier cambio posterior puede afectar el cronograma de entrega.',
        style: 'normal' 
      }
    ],
    styles: baseStyles,
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Template para Anexo C - CONTROL DE CAMBIOS Y REVISIONES
 */
function createAnexoC(data: any) {
  return {
    content: [
      { text: 'ANEXO C - CONTROL DE CAMBIOS Y REVISIONES', style: 'header' },
      { text: 'GESTIÓN DE MODIFICACIONES AL PROYECTO', style: 'subheader' },

      { text: 'INFORMACIÓN DEL EVENTO:', style: 'clausula' },
      { text: `Evento: ${data.NOMBRE_EVENTO || '[NOMBRE DEL EVENTO]'}`, style: 'normal' },
      { text: `Ronda de revisión: ${data.RONDA || '[NÚMERO DE RONDA]'}`, style: 'normal' },
      { text: `Total de cambios en esta ronda: ${data.TOTAL_CAMBIOS_RONDA || '[CANTIDAD]'}`, style: 'normal' },

      { text: 'REGISTRO DE CAMBIOS:', style: 'clausula' },
      
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', '*', 'auto'],
          body: [
            [
              { text: '#', style: 'clausula' },
              { text: 'DESCRIPCIÓN DEL CAMBIO', style: 'clausula' },
              { text: 'ESTADO ACTUAL', style: 'clausula' },
              { text: 'ESTADO SOLICITADO', style: 'clausula' },
              { text: 'EJECUTADO', style: 'clausula' }
            ],
            ...[1,2,3,4,5,6,7].map(num => [
              num.toString(),
              data[`CAMBIO_${num}`] || '[DESCRIPCIÓN DEL CAMBIO]',
              data[`ESTADO_ACTUAL_${num}`] || '[ESTADO ACTUAL]',
              data[`ESTADO_SOLICITADO_${num}`] || '[ESTADO SOLICITADO]',
              data[`EJECUTADO_${num}`] || '[SÍ/NO]'
            ])
          ]
        },
        style: 'normal'
      },

      { text: '\nAPROBACIÓN DEL CLIENTE:', style: 'clausula' },
      { text: `¿Cliente acepta la ronda?: ${data.CLIENTE_ACEPTA_RONDA || '[SÍ/NO]'}`, style: 'normal' },

      { text: 'POLÍTICAS DE CAMBIOS:', style: 'clausula' },
      {
        ul: [
          'Se permiten hasta 3 rondas de revisiones sin costo adicional',
          'Cambios que requieran nuevos materiales serán cotizados por separado',
          'Modificaciones estructurales pueden afectar el cronograma',
          'Los cambios deben ser solicitados por escrito',
          'Cada ronda debe ser aprobada completamente antes de continuar'
        ],
        style: 'normal'
      },

      { text: 'PROCESO DE REVISIÓN:', style: 'clausula' },
      {
        ol: [
          'Cliente solicita cambios específicos',
          'Evaluación técnica y de costos por parte de 3D Pixel',
          'Presentación de propuesta de modificación',
          'Aprobación o ajustes por parte del cliente',
          'Ejecución de cambios aprobados',
          'Verificación y cierre de ronda'
        ],
        style: 'normal'
      },

      { text: 'OBSERVACIONES:', style: 'clausula' },
      { 
        text: 'Cualquier cambio solicitado después de la fecha límite establecida puede generar costos adicionales y modificaciones al cronograma de entrega.',
        style: 'normal' 
      }
    ],
    styles: baseStyles,
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

/**
 * Template para Anexo D - ENTREGA FINAL
 */
function createAnexoD(data: any) {
  return {
    content: [
      { text: 'ANEXO D - ENTREGA FINAL', style: 'header' },
      { text: 'CIERRE Y DOCUMENTACIÓN DEL EVENTO', style: 'subheader' },

      { text: 'INFORMACIÓN DEL EVENTO:', style: 'clausula' },
      { text: `Cliente: ${data.CLIENTE_FINAL || data.NOMBRE_CLIENTE || '[NOMBRE CLIENTE]'}`, style: 'normal' },
      { text: `Evento: ${data.EVENTO_FINAL || data.NOMBRE_EVENTO || '[NOMBRE DEL EVENTO]'}`, style: 'normal' },
      { text: `Fecha del evento: ${data.FECHA_EVENTO_FINAL || data.FECHA_EVENTO || '[FECHA EVENTO]'}`, style: 'normal' },

      { text: 'FECHAS DE ENTREGA:', style: 'clausula' },
      { text: `Fecha de entrega cliente: ${data.FECHA_ENTREGA_CLIENTE || '[FECHA CLIENTE]'}`, style: 'normal' },
      { text: `Fecha de entrega Pixel: ${data.FECHA_ENTREGA_PIXEL || '[FECHA PIXEL]'}`, style: 'normal' },

      { text: 'RESPONSABLES:', style: 'clausula' },
      { text: `Representante cliente: ${data.REPRESENTANTE_CLIENTE_FINAL || '[REPRESENTANTE CLIENTE]'}`, style: 'normal' },
      { text: `Representante Pixel: ${data.REPRESENTANTE_PIXEL_FINAL || '[REPRESENTANTE PIXEL]'}`, style: 'normal' },

      { text: 'ENTREGABLES FINALES:', style: 'clausula' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'CONCEPTO', style: 'clausula' },
              { text: 'CANTIDAD', style: 'clausula' },
              { text: 'ESTADO', style: 'clausula' }
            ],
            [
              'Renders finales digitales',
              data.CANTIDAD_RENDERS_FINALES || '[CANTIDAD]',
              data.ESTADO_RENDERS || 'ENTREGADO'
            ],
            [
              'Archivos fuente del proyecto',
              data.CANTIDAD_ARCHIVOS_FUENTE || '1 set',
              data.ESTADO_ARCHIVOS || 'ENTREGADO'
            ],
            [
              'Video recorrido 360°',
              data.CANTIDAD_VIDEOS || '[SÍ/NO]',
              data.ESTADO_VIDEO || '[ESTADO]'
            ],
            [
              'Fotografías del montaje',
              data.CANTIDAD_FOTOS_MONTAJE || '[CANTIDAD]',
              data.ESTADO_FOTOS || '[ESTADO]'
            ],
            [
              'Documentación técnica',
              data.CANTIDAD_DOCUMENTOS || '1 set',
              data.ESTADO_DOCUMENTOS || 'ENTREGADO'
            ]
          ]
        },
        style: 'normal'
      },

      { text: 'CONFORMIDAD Y ACEPTACIÓN:', style: 'clausula' },
      { text: `Evento ejecutado conforme: ${data.EVENTO_CONFORME || '[SÍ/NO]'}`, style: 'normal' },
      { text: `Observaciones del cliente: ${data.OBSERVACIONES_CLIENTE || '[OBSERVACIONES]'}`, style: 'normal' },
      { text: `Calificación del servicio: ${data.CALIFICACION_SERVICIO || '[1-10]'}`, style: 'normal' },

      { text: 'DESMONTAJE:', style: 'clausula' },
      { text: `Fecha de desmontaje: ${data.FECHA_DESMONTAJE || '[FECHA]'}`, style: 'normal' },
      { text: `Elementos retirados: ${data.ELEMENTOS_RETIRADOS || '[LISTADO]'}`, style: 'normal' },
      { text: `Estado del salón al retiro: ${data.ESTADO_SALON_RETIRO || '[CONDICIÓN]'}`, style: 'normal' },

      { text: 'GARANTÍAS POST-EVENTO:', style: 'clausula' },
      {
        ul: [
          'Soporte técnico por 30 días para archivos digitales',
          'Garantía de satisfacción en la ejecución del montaje',
          'Disponibilidad para eventos futuros con descuentos especiales',
          'Mantenimiento de archivos del proyecto por 2 años'
        ],
        style: 'normal'
      },

      { text: 'FIRMAS DE CONFORMIDAD:', style: 'clausula' },
      
      {
        columns: [
          {
            width: '50%',
            text: [
              '\n\n_________________________\n',
              { text: data.REPRESENTANTE_CLIENTE_FINAL || data.NOMBRE_CLIENTE || '[REPRESENTANTE CLIENTE]', bold: true },
              '\nCLIENTE\nCONFORME'
            ],
            style: 'firma'
          },
          {
            width: '50%',
            text: [
              '\n\n_________________________\n',
              { text: data.REPRESENTANTE_PIXEL_FINAL || 'DIRECTOR GENERAL', bold: true },
              '\n3D PIXEL PERFECTION\nCONFORME'
            ],
            style: 'firma'
          }
        ]
      },

      { 
        text: `\nFecha de cierre: ${data.FECHA_ENTREGA_PIXEL || new Date().toLocaleDateString('es-ES')}`,
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