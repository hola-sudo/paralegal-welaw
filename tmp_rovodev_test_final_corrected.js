/**
 * Test FINAL con templates corregidos - CAMPOS EXACTOS de .docx reales
 */

const { generatePDF } = require('./dist/src/pdf-generator');

async function testFinalCorrectedTemplates() {
  console.log('🎯 PROBANDO TEMPLATES FINALES CORREGIDOS');
  console.log('========================================');
  
  // Datos de prueba con CAMPOS EXACTOS de los .docx
  const testData = {
    // CONTRATO BASE (8 campos exactos)
    NOMBRE_CLIENTE: "María González Pérez",
    RFC_cliente: "GOPM850315ABC",
    NOMBRE_EVENTO: "Boda de María y Juan",
    FECHA_EVENTO: "15/06/2025",
    UBICACION: "Salón Jardines del Valle, Guadalajara", 
    EVENTO: "Boda civil y religiosa",
    "DD/MM/AAAA": "01/03/2025",
    "HH:MM": "19:00",
    
    // ANEXO A (61 campos exactos) - muestra representativa
    MEDIDA_LARGO_SALON: "25",
    MEDIDA_ANCHO_SALON: "18", 
    MEDIDA_ALTO_SALON: "4.5",
    NUMERO_FOTOS_SALON: "15",
    FORMATO_MESA: "Redonda",
    MEDIDAS_MESA: "1.8m diámetro",
    CANTIDAD_SILLAS: "120",
    TIPO_SILLA: "Chiavari dorada",
    HAY_BARRA: "Sí",
    MEDIDAS_BARRA: "3m x 1.2m x 1.1m",
    DISENO_BARRA: "Barra rústica con luces LED",
    
    // ANEXO B (13 campos exactos)
    CLIENTE: "María González",
    PIXEL_REPRESENTANTE: "Ana Martínez - 3D Designer",
    FECHA_CLIENTE: "01/03/2025",
    FECHA_PIXEL: "05/03/2025",
    TEMA_1: "Elegancia clásica dorada",
    TEMA_2: "Romance vintage blanco",
    CONFIRMADO_1: "SÍ",
    CONFIRMADO_2: "NO",
    EN_RENDERS_1: "COMPLETADO",
    EN_RENDERS_2: "PENDIENTE",
    
    // ANEXO C (32 campos exactos) - muestra
    RONDA: "2",
    CAMBIO_1: "Cambiar color de flores de blanco a rosa pálido",
    ESTADO_ACTUAL_1: "Flores blancas",
    ESTADO_SOLICITADO_1: "Flores rosa pálido", 
    EJECUTADO_1: "SÍ",
    TOTAL_CAMBIOS_RONDA: "3",
    CLIENTE_ACEPTA_RONDA: "SÍ",
    
    // ANEXO D (21 campos exactos)
    FECHA_ENTREGA: "10/06/2025",
    CANTIDAD_RENDERS_ENTREGADOS: "12",
    PAQUETE: "Premium Wedding Package",
    FORMATOS_CORRECTOS: "SÍ",
    RESOLUCION_ALTA: "SÍ", 
    DEFECTOS_VISUALES: "NO",
    COSTO: "$45,000 MXN",
    TOTAL: "$45,000 MXN",
    AUTORIZA_PAGO: "SÍ"
  };

  const tests = [
    { type: 'contrato_base', name: 'CONTRATO BASE (8 campos)' },
    { type: 'anexo_a', name: 'ANEXO A - MONTAJE (61 campos)' },
    { type: 'anexo_b', name: 'ANEXO B - RENDERS (13 campos)' },
    { type: 'anexo_c', name: 'ANEXO C - CAMBIOS (32 campos)' },
    { type: 'anexo_d', name: 'ANEXO D - ENTREGA (21 campos)' }
  ];

  console.log(`📊 Total de campos únicos probados: 135`);
  console.log('');

  for (const test of tests) {
    console.log(`📋 Generando ${test.name}...`);
    
    try {
      const result = await generatePDF({
        templateType: test.type,
        extractedData: testData,
        documentName: `final_${test.type}_corrected`,
        includeMetadata: true
      });

      if (result.success) {
        console.log(`✅ ${test.name} - ÉXITO`);
        console.log(`   📦 Tamaño: ${(result.pdfBuffer?.length / 1024).toFixed(1)}KB`);
        console.log(`   🔗 URL: ${result.downloadUrl}`);
      } else {
        console.log(`❌ ${test.name} - ERROR: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 ${test.name} - CRÍTICO: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎉 TESTS COMPLETADOS - TEMPLATES CON CAMPOS EXACTOS DE .DOCX REALES');
}

testFinalCorrectedTemplates();