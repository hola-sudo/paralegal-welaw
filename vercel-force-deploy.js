/**
 * Script para forzar deployment limpio en Vercel
 */

// Crear un archivo único que fuerce rebuild
const timestamp = new Date().toISOString();
const buildInfo = {
  timestamp,
  version: "2.0.0-pdfmake-forced",
  changes: [
    "Eliminado Puppeteer completamente",
    "Implementado pdfmake nativo", 
    "Templates corregidos con 135 campos exactos",
    "Performance optimizada"
  ],
  forceRebuild: true
};

console.log('🚀 FORCING VERCEL DEPLOYMENT');
console.log('============================');
console.log(JSON.stringify(buildInfo, null, 2));

// Escribir archivo de build info
require('fs').writeFileSync('BUILD_INFO.json', JSON.stringify(buildInfo, null, 2));

console.log('\n✅ BUILD_INFO.json creado');
console.log('📋 Esto debería forzar a Vercel a detectar cambios');
console.log('🎯 Commit este archivo para forzar deployment');