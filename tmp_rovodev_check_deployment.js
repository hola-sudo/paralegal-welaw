/**
 * Script para verificar si el deployment está usando el código actualizado
 */

async function checkDeployment() {
  console.log('🔍 VERIFICANDO ESTADO DEL DEPLOYMENT');
  console.log('===================================');

  try {
    // Test 1: Health check
    console.log('\n1. 🏥 Health Check...');
    const healthResponse = await fetch('https://paralegal-welaw-h1ol7fcgk-we-law.vercel.app/api/health');
    const health = await healthResponse.json();
    
    if (health.integrations.pdf_generator) {
      console.log('   ✅ Usando PDF generator nativo (pdfmake)');
      console.log(`   🛠️  Engine: ${health.integrations.pdf_generator.engine}`);
    } else if (health.integrations.google_drive_api) {
      console.log('   ❌ Todavía usando Google Drive + Puppeteer (código antiguo)');
      console.log(`   📧 Service account: ${health.integrations.google_drive_api.service_account_email}`);
      return false;
    }

    // Test 2: Proceso simple
    console.log('\n2. 🧪 Test de proceso...');
    const processResponse = await fetch('https://paralegal-welaw-h1ol7fcgk-we-law.vercel.app/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcripcion: "Test básico para contrato de María González, boda 15 junio 2025"
      })
    });

    const result = await processResponse.json();
    
    if (result.error && result.error.includes('chromium')) {
      console.log('   ❌ Error de Chromium - usando código antiguo');
      console.log(`   💥 Error: ${result.error}`);
      return false;
    } else if (result.success || result.needsFollowUp) {
      console.log('   ✅ Proceso funcionando sin errores de Chromium');
      if (result.success) {
        console.log(`   📄 Documento generado: ${result.tipo_documento}`);
      } else {
        console.log(`   ⚠️  Necesita follow-up: ${result.tipo_documento}`);
      }
      return true;
    }

  } catch (error) {
    console.log(`   💥 Error de conexión: ${error.message}`);
    return false;
  }
}

// Función para esperar deployment
async function waitForDeployment(maxWaitMinutes = 5) {
  console.log(`\n⏳ Esperando deployment (máximo ${maxWaitMinutes} minutos)...`);
  
  const startTime = Date.now();
  const maxWaitTime = maxWaitMinutes * 60 * 1000;
  
  while (Date.now() - startTime < maxWaitTime) {
    const isUpdated = await checkDeployment();
    
    if (isUpdated) {
      console.log('\n🎉 ¡DEPLOYMENT ACTUALIZADO!');
      return true;
    }
    
    console.log('   ⏳ Esperando 30 segundos...');
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  
  console.log(`\n⏰ Timeout: Deployment no se actualizó en ${maxWaitMinutes} minutos`);
  return false;
}

// Ejecutar
if (typeof window === 'undefined') {
  const fetch = require('node-fetch');
  
  waitForDeployment().then(success => {
    if (success) {
      console.log('\n🚀 LISTO PARA PRUEBAS REALES');
    } else {
      console.log('\n🔧 NECESITA INTERVENCIÓN MANUAL');
    }
  });
}