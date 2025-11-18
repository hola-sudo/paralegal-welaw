/**
 * CASOS REALES - Testing con transcripciones típicas de 3D PIXEL PERFECTION
 */

async function testCasosReales() {
  console.log('🎊 PROBANDO CASOS REALES DE CLIENTES 3D PIXEL PERFECTION');
  console.log('=====================================================');

  const casosReales = [
    {
      nombre: "BODA ELEGANTE - Cliente detallado",
      transcripcion: `Hola, soy Sofía Martínez y quiero contratar sus servicios para mi boda. Es la boda de Sofía y Carlos, será el 22 de septiembre del 2025 a las 6 de la tarde. Será en el Salón Luna de Plata en Zapopan. Es una boda católica con recepción. El salón mide 30 metros de largo por 20 de ancho y tiene 5 metros de alto. Queremos 15 mesas redondas de 1.8 metros para 150 invitados con sillas chiavari doradas. Los centros de mesa queremos que sean con rosas rojas y eucalipto en bases doradas circulares de 25 cm. Necesitamos una pista de baile de madera de 8x8 metros y queremos candiles de cristal colgantes. El tema que nos gusta es elegancia clásica con toques dorados.`
    },
    {
      nombre: "XV AÑOS - Información básica",
      transcripcion: `Buenos días, necesito cotización para los XV años de mi hija Valentina. La fiesta es para el 15 de diciembre de 2025 en el Jardín Las Flores. Son XV años con tema de princesa rosa. Tenemos 100 invitados aproximadamente. El salón es grande pero no tengo las medidas exactas. Queremos algo muy elegante con muchas flores rosas y decoración tipo jardín.`
    },
    {
      nombre: "EVENTO CORPORATIVO - Cliente empresarial",
      transcripcion: `Hablo de parte de Constructora Moderna S.A. de C.V., RFC: CMO850721XYZ. Soy el Lic. Roberto Hernández, Director de Marketing. Necesitamos cotización para nuestro evento anual de la empresa el 30 de noviembre de 2025 a las 7 PM en el Centro de Convenciones del WTC. Es un evento corporativo para 200 personas con cena de gala. Necesitamos renders previos para presentar al consejo directivo. El tema debe ser corporativo elegante en azul y plata.`
    },
    {
      nombre: "ANEXO A - Cliente con especificaciones técnicas",
      transcripcion: `Ya tengo el contrato base firmado, ahora necesito hacer el anexo A para el evento de María Elena. El salón mide exactamente 25 metros de largo, 18 de ancho y 4.5 de alto. Vamos a poner 12 mesas redondas de 1.8 metros con 120 sillas chiavari blancas. Los centros de mesa van con rosas blancas y baby breath en jarrones de cristal de 30 cm de alto. Necesitamos una barra de 3 metros por 1.2 de fondo, diseño rústico con luces LED. También queremos pista circular de 6x6 metros y candiles de cristal de 2 metros de diámetro.`
    },
    {
      nombre: "ANEXO C - Control de cambios",
      transcripcion: `Estamos en la ronda 2 de cambios para el evento de Andrea y Luis. Tenemos 3 cambios: primero, cambiar las flores de blanco a rosa pálido porque la novia cambió de opinión. Segundo, la pista de baile que fuera rectangular en lugar de circular por el espacio. Y tercero, agregar una contrabarra de 2 metros adicional. El estado actual es flores blancas, pista circular y sin contrabarra. El estado solicitado es flores rosa, pista rectangular y con contrabarra. Los tres cambios ya están ejecutados y el cliente acepta esta ronda.`
    }
  ];

  for (let i = 0; i < casosReales.length; i++) {
    const caso = casosReales[i];
    console.log(`\n${i + 1}. 📋 ${caso.nombre}`);
    console.log(`📝 Transcripción: "${caso.transcripcion.substring(0, 100)}..."`);
    
    try {
      console.log('   🔄 Enviando a API...');
      
      const response = await fetch('https://paralegal-welaw-h1ol7fcgk-we-law.vercel.app/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcripcion: caso.transcripcion
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ PDF generado: ${result.tipo_documento}`);
        console.log(`   📄 Archivo: ${result.file_name}`);
        console.log(`   🔗 URL: ${result.download_url}`);
        console.log(`   📊 Datos extraídos: ${Object.keys(result.datos_extraidos).length} campos`);
      } else if (result.needsFollowUp) {
        console.log(`   ⚠️ Necesita más información: ${result.tipo_documento}`);
        console.log(`   📋 Datos parciales: ${Object.keys(result.datos_parciales).length} campos`);
        console.log(`   ❓ Preguntas faltantes: ${result.preguntas_faltantes.length}`);
        result.preguntas_faltantes.forEach((q, idx) => {
          console.log(`      ${idx + 1}. ${q}`);
        });
      } else {
        console.log(`   ❌ Error: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`   💥 Error de conexión: ${error.message}`);
    }
    
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 PRUEBAS CON CASOS REALES COMPLETADAS');
  console.log('\n📊 ANÁLISIS:');
  console.log('- ✅ Boda detallada: Debería generar contrato base completo');
  console.log('- ⚠️ XV años básicos: Debería pedir más información');
  console.log('- ✅ Evento corporativo: Debería detectar datos empresariales');
  console.log('- ✅ Anexo A: Debería generar especificaciones técnicas');
  console.log('- ✅ Anexo C: Debería generar control de cambios');
}

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
  // Node.js
  const fetch = require('node-fetch');
  testCasosReales();
} else {
  // Browser - exportar función
  window.testCasosReales = testCasosReales;
}