/**
 * Test completo del negocio REAL - 3D PIXEL PERFECTION (Decoración de eventos)
 */

const { generatePDF } = require('./dist/src/pdf-generator');

async function testRealEventBusiness() {
  console.log('🎊 PROBANDO NEGOCIO REAL - DECORACIÓN DE EVENTOS');
  console.log('=================================================');
  
  // Datos reales de una boda típica
  const bodaData = {
    // Contrato base - datos del evento
    NOMBRE_CLIENTE: "María González Pérez",
    RFC_cliente: "GOPM850315ABC",
    NOMBRE_EVENTO: "Boda de María y Juan",
    FECHA_EVENTO: "15/06/2025",
    "HH:MM": "19:00",
    UBICACION: "Salón Jardines del Valle, Guadalajara",
    EVENTO: "Boda civil y religiosa",
    "DD/MM/AAAA": "01/03/2025",
    
    // Anexo A - especificaciones de montaje
    MEDIDA_LARGO_SALON: "25",
    MEDIDA_ANCHO_SALON: "18",
    MEDIDA_ALTO_SALON: "4.5",
    DESCRIPCION_CENTRO_MESA: "Arreglo floral con rosas blancas y eucalipto",
    BASE_CENTRO_MESA: "Base dorada circular",
    MEDIDAS_BASE_CENTRO_MESA: "30cm diámetro x 15cm alto",
    FLORES_CENTRO_MESA: "Rosas blancas, baby's breath",
    FOLLAJE_CENTRO_MESA: "Eucalipto, hiedra",
    DETALLES_VELAS_CENTRO_MESA: "4 velas flotantes por centro",
    NUMERO_PIEZAS_CENTRO_MESA: "12",
    FORMATO_MESA: "Redonda",
    MEDIDAS_MESA: "1.8 metros diámetro",
    CANTIDAD_SILLAS: "120",
    TIPO_SILLA: "Chiavari dorada",
    RECUBRIMIENTO_MESA: "Mantel blanco con camino dorado",
    HAY_PISTA: "Sí",
    DISENO_PISTA: "Pista de madera parquet",
    FORMATO_PISTA: "Circular",
    MEDIDAS_PISTA: "6x6 metros",
    HAY_CANDILES: "Sí",
    DISENO_CANDILES: "Candil cristal tipo araña",
    MEDIDAS_CANDILES: "2 metros diámetro",
    
    // Anexo B - renders y temas
    CLIENTE: "María González",
    PIXEL_REPRESENTANTE: "Ana Martínez - 3D Designer",
    FECHA_CLIENTE: "01/03/2025",
    FECHA_PIXEL: "05/03/2025",
    TEMA_1: "Elegancia clásica dorada",
    TEMA_2: "Romance vintage blanco",
    CONFIRMADO_1: "SÍ",
    CONFIRMADO_2: "NO",
    EN_RENDERS_1: "COMPLETADO",
    EN_RENDERS_2: "PENDIENTE"
  };

  const tests = [
    { type: 'contrato_base', name: 'CONTRATO BASE' },
    { type: 'anexo_a', name: 'ANEXO A - MONTAJE' },
    { type: 'anexo_b', name: 'ANEXO B - RENDERS' },
    { type: 'anexo_c', name: 'ANEXO C - CAMBIOS' },
    { type: 'anexo_d', name: 'ANEXO D - ENTREGA' }
  ];

  for (const test of tests) {
    console.log(`\n📋 Generando ${test.name}...`);
    
    try {
      const result = await generatePDF({
        templateType: test.type,
        extractedData: bodaData,
        documentName: `boda_maria_juan_${test.type}`,
        includeMetadata: true
      });

      if (result.success) {
        console.log(`✅ ${test.name} - OK`);
        console.log(`   📦 Tamaño: ${result.pdfBuffer?.length} bytes`);
      } else {
        console.log(`❌ ${test.name} - ERROR: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 ${test.name} - CRÍTICO: ${error.message}`);
    }
  }

  console.log('\n🎉 PRUEBAS COMPLETADAS');
}

testRealEventBusiness();