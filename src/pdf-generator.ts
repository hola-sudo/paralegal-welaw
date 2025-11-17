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
 * Template para Contrato Base
 */
function createContratoBase(data: any) {
  return {
    content: [
      { text: 'CONTRATO BASE 3D PIXEL PERFECTION', style: 'header' },
      { text: 'CONTRATO DE PRESTACIÓN DE SERVICIOS DE RENDERS Y MODELADO 3D', style: 'subheader' },
      
      { text: '\nPARTES DEL CONTRATO:', style: 'clausula' },
      { 
        text: [
          'CONTRATANTE: ',
          { text: data.empresa_cliente || '[EMPRESA CLIENTE]', bold: true },
          ', representada por ',
          { text: data.representante_cliente || '[REPRESENTANTE]', bold: true },
          ' en su carácter de ',
          { text: data.cargo_representante || '[CARGO]', bold: true }
        ], 
        style: 'normal' 
      },
      { 
        text: [
          'CONTRATADO: ',
          { text: '3D PIXEL PERFECTION', bold: true },
          ', empresa especializada en renders arquitectónicos y modelado 3D profesional.'
        ], 
        style: 'normal' 
      },

      { text: 'PRIMERA: OBJETO DEL CONTRATO', style: 'clausula' },
      { 
        text: data.descripcion_proyecto || 'El presente contrato tiene por objeto la prestación de servicios de renders 3D y modelado arquitectónico profesional.',
        style: 'normal' 
      },

      { text: 'SEGUNDA: ESPECIFICACIONES TÉCNICAS', style: 'clausula' },
      { 
        text: [
          'Resolución de renders: ',
          { text: data.resolucion || '4K (3840x2160)', bold: true },
          '\nFormato de entrega: ',
          { text: data.formato_entrega || 'JPG, PNG, MP4', bold: true },
          '\nSoftware utilizado: ',
          { text: data.software || '3ds Max, V-Ray, Corona Renderer', bold: true }
        ],
        style: 'normal' 
      },

      { text: 'TERCERA: CRONOGRAMA Y ENTREGABLES', style: 'clausula' },
      { 
        text: [
          'Fecha de inicio: ',
          { text: data.fecha_inicio || '[FECHA INICIO]', bold: true },
          '\nFecha de entrega: ',
          { text: data.fecha_entrega || '[FECHA ENTREGA]', bold: true },
          '\nEntregables: ',
          { text: data.entregables || 'Renders finales, archivos fuente, documentación técnica', bold: true }
        ],
        style: 'normal' 
      },

      { text: 'CUARTA: CONDICIONES ECONÓMICAS', style: 'clausula' },
      { 
        text: [
          'Monto total: ',
          { text: data.monto_total || '[MONTO]', bold: true },
          '\nForma de pago: ',
          { text: data.forma_pago || '50% al inicio, 50% a la entrega', bold: true }
        ],
        style: 'normal' 
      },

      { text: 'QUINTA: PROPIEDAD INTELECTUAL', style: 'clausula' },
      { 
        text: 'Los renders y modelos 3D entregados son propiedad del CONTRATANTE una vez liquidado el pago total. 3D PIXEL PERFECTION conserva el derecho de uso para portafolio comercial.',
        style: 'normal' 
      },

      { text: '\n\nFIRMAS:', style: 'clausula' },
      
      {
        columns: [
          {
            width: '50%',
            text: [
              '\n\n_________________________\n',
              { text: data.representante_cliente || '[REPRESENTANTE CLIENTE]', bold: true },
              '\n',
              data.empresa_cliente || '[EMPRESA CLIENTE]'
            ],
            style: 'firma'
          },
          {
            width: '50%',
            text: [
              '\n\n_________________________\n',
              { text: 'DIRECTOR GENERAL', bold: true },
              '\n',
              '3D PIXEL PERFECTION'
            ],
            style: 'firma'
          }
        ]
      },

      { 
        text: `\nFecha: ${new Date().toLocaleDateString('es-ES')}`,
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
 * Template para Anexo A - Especificaciones Técnicas
 */
function createAnexoA(data: any) {
  return {
    content: [
      { text: 'ANEXO A - ESPECIFICACIONES TÉCNICAS', style: 'header' },
      { text: 'RENDERS Y MODELADO 3D PROFESIONAL', style: 'subheader' },

      { text: 'ESPECIFICACIONES DE RENDERS:', style: 'clausula' },
      {
        ul: [
          `Resolución: ${data.resolucion || '4K (3840x2160)'}`,
          `Calidad: ${data.calidad || 'Ultra High Definition'}`,
          `Formato de imagen: ${data.formato_imagen || 'JPG (RGB), PNG (transparencia)'}`,
          `Formato de video: ${data.formato_video || 'MP4 H.264, MOV ProRes'}`
        ],
        style: 'normal'
      },

      { text: 'SOFTWARE Y TECNOLOGÍAS:', style: 'clausula' },
      {
        ul: [
          `Modelado: ${data.software_modelado || '3ds Max, SketchUp Pro'}`,
          `Renderizado: ${data.software_render || 'V-Ray, Corona Renderer'}`,
          `Post-producción: ${data.software_post || 'Photoshop, After Effects'}`,
          `Gestión de proyecto: ${data.software_gestion || 'Monday, Slack, Google Drive'}`
        ],
        style: 'normal'
      },

      { text: 'TIPOS DE RENDERS INCLUIDOS:', style: 'clausula' },
      {
        ul: [
          'Renders exteriores diurnos y nocturnos',
          'Renders interiores con iluminación natural y artificial',
          'Recorridos virtuales (walkthrough)',
          'Animaciones de productos arquitectónicos'
        ],
        style: 'normal'
      },

      { text: 'ESTÁNDARES DE CALIDAD:', style: 'clausula' },
      { 
        text: 'Todos los renders cumplirán con estándares internacionales de visualización arquitectónica, incluyendo iluminación realista, materiales fotorrealistas y composición profesional.',
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
 * Template para Anexo B - Cronograma
 */
function createAnexoB(data: any) {
  const etapas = data.cronograma_etapas || [
    { nombre: 'Análisis de requerimientos', duracion: '3 días', entregable: 'Briefing técnico' },
    { nombre: 'Modelado 3D', duracion: '7 días', entregable: 'Modelos base' },
    { nombre: 'Texturización y materiales', duracion: '4 días', entregable: 'Modelos texturizados' },
    { nombre: 'Iluminación y renderizado', duracion: '5 días', entregable: 'Renders draft' },
    { nombre: 'Post-producción', duracion: '3 días', entregable: 'Renders finales' }
  ];

  return {
    content: [
      { text: 'ANEXO B - CRONOGRAMA Y ENTREGABLES', style: 'header' },
      { text: 'PLANIFICACIÓN DE PROYECTO', style: 'subheader' },

      { text: 'CRONOGRAMA DETALLADO:', style: 'clausula' },

      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', '*'],
          body: [
            [
              { text: 'ETAPA', style: 'clausula' },
              { text: 'DURACIÓN', style: 'clausula' },
              { text: 'ENTREGABLE', style: 'clausula' }
            ],
            ...etapas.map((etapa: any) => [
              etapa.nombre,
              etapa.duracion,
              etapa.entregable
            ])
          ]
        },
        style: 'normal'
      },

      { text: '\nHITOS IMPORTANTES:', style: 'clausula' },
      {
        ul: [
          `Inicio del proyecto: ${data.fecha_inicio || '[FECHA INICIO]'}`,
          `Entrega de modelos base: ${data.fecha_modelos || '[FECHA MODELOS]'}`,
          `Revisión intermedia: ${data.fecha_revision || '[FECHA REVISIÓN]'}`,
          `Entrega final: ${data.fecha_entrega || '[FECHA ENTREGA]'}`
        ],
        style: 'normal'
      },

      { text: 'PROCESO DE REVISIONES:', style: 'clausula' },
      { 
        text: 'Se contemplan hasta 3 rondas de revisiones sin costo adicional. Cambios mayores que requieran re-modelado serán cotizados por separado.',
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
 * Template para Anexo C - Facturación
 */
function createAnexoC(data: any) {
  return {
    content: [
      { text: 'ANEXO C - FACTURACIÓN Y PAGOS', style: 'header' },
      { text: 'CONDICIONES ECONÓMICAS', style: 'subheader' },

      { text: 'DESGLOSE DE COSTOS:', style: 'clausula' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'CONCEPTO', style: 'clausula' },
              { text: 'CANTIDAD', style: 'clausula' },
              { text: 'IMPORTE', style: 'clausula' }
            ],
            [
              'Renders exteriores',
              data.cantidad_exteriores || '8',
              data.costo_exteriores || '$15,000'
            ],
            [
              'Renders interiores',
              data.cantidad_interiores || '12',
              data.costo_interiores || '$18,000'
            ],
            [
              'Recorrido virtual',
              data.cantidad_recorridos || '1',
              data.costo_recorridos || '$8,000'
            ],
            [
              { text: 'TOTAL', bold: true },
              '',
              { text: data.monto_total || '$41,000', bold: true }
            ]
          ]
        },
        style: 'normal'
      },

      { text: '\nESQUEMA DE PAGOS:', style: 'clausula' },
      {
        ul: [
          `Anticipo (50%): ${data.anticipo || '$20,500'} - Al firmar contrato`,
          `Pago intermedio (30%): ${data.pago_intermedio || '$12,300'} - Al entregar modelos`,
          `Pago final (20%): ${data.pago_final || '$8,200'} - Al entregar renders finales`
        ],
        style: 'normal'
      },

      { text: 'DATOS PARA TRANSFERENCIA:', style: 'clausula' },
      { 
        text: [
          'Beneficiario: ',
          { text: '3D PIXEL PERFECTION S.A. de C.V.', bold: true },
          '\nBanco: ',
          { text: data.banco || 'BBVA BANCOMER', bold: true },
          '\nCuenta: ',
          { text: data.cuenta || '0123456789', bold: true },
          '\nCLABE: ',
          { text: data.clabe || '012345678901234567', bold: true }
        ],
        style: 'normal' 
      },

      { text: 'FACTURACIÓN:', style: 'clausula' },
      { 
        text: 'Se emitirá factura fiscal (CFDI) dentro de las 72 horas posteriores a recibir cada pago. Se requieren datos fiscales completos del cliente.',
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
 * Template para Anexo D - Términos
 */
function createAnexoD(data: any) {
  return {
    content: [
      { text: 'ANEXO D - TÉRMINOS Y CONDICIONES', style: 'header' },
      { text: 'CONDICIONES GENERALES DEL SERVICIO', style: 'subheader' },

      { text: 'RESPONSABILIDADES DEL CLIENTE:', style: 'clausula' },
      {
        ol: [
          'Proporcionar planos arquitectónicos actualizados en formato DWG o PDF',
          'Definir claramente los requerimientos visuales y estilísticos',
          'Proporcionar referencias visuales y mood boards cuando sea necesario',
          'Realizar pagos en tiempo y forma según cronograma establecido',
          'Responder a consultas técnicas en un plazo máximo de 48 horas'
        ],
        style: 'normal'
      },

      { text: 'RESPONSABILIDADES DEL PRESTADOR:', style: 'clausula' },
      {
        ol: [
          'Entregar renders de calidad profesional según especificaciones acordadas',
          'Cumplir con cronograma de entrega salvo causas de fuerza mayor',
          'Mantener confidencialidad total sobre información del proyecto',
          'Proporcionar soporte técnico durante el proceso de desarrollo',
          'Realizar revisiones incluidas sin costo adicional'
        ],
        style: 'normal'
      },

      { text: 'POLÍTICAS DE REVISIONES:', style: 'clausula' },
      { 
        text: 'Se incluyen hasta 3 rondas de revisiones menores sin costo adicional. Se consideran revisiones mayores aquellas que implican cambios de diseño, materiales o iluminación que requieran más de 2 horas de trabajo.',
        style: 'normal' 
      },

      { text: 'CANCELACIONES Y REEMBOLSOS:', style: 'clausula' },
      { 
        text: 'En caso de cancelación del proyecto, se reembolsará únicamente la parte proporcional no trabajada, previa entrega de avances realizados.',
        style: 'normal' 
      },

      { text: 'FUERZA MAYOR:', style: 'clausula' },
      { 
        text: 'No seremos responsables por retrasos causados por circunstancias fuera de nuestro control, incluyendo pero no limitándose a: desastres naturales, fallas tecnológicas, o cambios en requerimientos del cliente.',
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