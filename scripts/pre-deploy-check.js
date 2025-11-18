#!/usr/bin/env node

/**
 * Script de verificación pre-deployment para Vercel
 * Verifica que todos los archivos necesarios estén presentes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando archivos para deployment en Vercel...\n');

const requiredFiles = [
  'vercel.json',
  'package.json',
  'api/process.ts',
  'api/health.ts',
  'public/demo.html',
  'src/agent-real.ts',
  'src/schemas-real.ts',
  'src/classification-real.ts',
  'src/guardrails.ts',
  'src/pdf-generator.ts'
];

let allFilesPresent = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allFilesPresent = false;
  }
});

console.log('\n📋 Verificando package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredDeps = ['@openai/agents', 'openai', 'zod'];
const requiredDevDeps = ['@vercel/node', 'typescript'];

console.log('\nDependencias:');
requiredDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MISSING!`);
    allFilesPresent = false;
  }
});

console.log('\nDev Dependencies:');
requiredDevDeps.forEach(dep => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MISSING!`);
    allFilesPresent = false;
  }
});

console.log('\n🔧 Verificando vercel.json...');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

if (vercelConfig.functions && vercelConfig.functions['api/process.ts']) {
  console.log('✅ Function api/process.ts configurada');
} else {
  console.log('❌ Function api/process.ts no configurada');
  allFilesPresent = false;
}

if (vercelConfig.functions && vercelConfig.functions['api/health.ts']) {
  console.log('✅ Function api/health.ts configurada');
} else {
  console.log('❌ Function api/health.ts no configurada');
  allFilesPresent = false;
}

if (vercelConfig.headers) {
  console.log('✅ CORS headers configurados');
} else {
  console.log('❌ CORS headers no configurados');
  allFilesPresent = false;
}

console.log('\n📝 Variables de entorno requeridas:');
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'MCP_ENDPOINT', 
  'MCP_API_KEY',
  'DRIVE_FOLDER_ID'
];

console.log('⚠️  Recuerda configurar estas variables en Vercel:');
requiredEnvVars.forEach(envVar => {
  console.log(`   - ${envVar}`);
});

console.log('\n🔍 Validaciones adicionales:');
console.log('- OPENAI_API_KEY debe empezar con "sk-proj-" o "sk-"');
console.log('- MCP_ENDPOINT debe ser: https://mcp.zapier.com/api/mcp/mcp'); 
console.log('- MCP_API_KEY debe tener formato: "client_id:secret"');
console.log('- DRIVE_FOLDER_ID debe ser un ID válido de Google Drive');

console.log('\n📋 Comandos útiles post-deployment:');
console.log('# Health check:');
console.log('curl https://tu-dominio.vercel.app/api/health');
console.log('');
console.log('# Test básico:');
console.log('curl -X POST https://tu-dominio.vercel.app/api/process \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"transcripcion":"CONTRATO DE PRUEBA"}\'');
console.log('');
console.log('# Ver logs:');
console.log('vercel logs tu-proyecto --follow');

console.log('\n📊 RESULTADO FINAL:');
if (allFilesPresent) {
  console.log('🎉 ¡Todo listo para deployment en Vercel!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Configurar variables de entorno en Vercel');
  console.log('2. Ejecutar: npx vercel --prod');
  console.log('3. Probar: GET /api/health');
  console.log('4. Probar: POST /api/process');
  process.exit(0);
} else {
  console.log('❌ Hay archivos faltantes o configuraciones incorrectas');
  console.log('Por favor revisa los elementos marcados con ❌');
  process.exit(1);
}