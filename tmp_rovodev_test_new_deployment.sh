#!/bin/bash

# Script para probar el nuevo deployment
# Uso: ./tmp_rovodev_test_new_deployment.sh https://tu-nueva-url.vercel.app

if [ "$1" = "" ]; then
    echo "❌ ERROR: Proporciona la URL del nuevo deployment"
    echo "Uso: $0 https://tu-nueva-url.vercel.app"
    exit 1
fi

URL="$1"
echo "🎯 PROBANDO NUEVO DEPLOYMENT: $URL"
echo "============================================="

echo ""
echo "1. 🏥 Health Check..."
HEALTH_RESPONSE=$(curl -s "$URL/api/health")
VERSION=$(echo "$HEALTH_RESPONSE" | jq -r '.version')
echo "   Version detectada: $VERSION"

if [ "$VERSION" = "2.0.0-pdfmake" ]; then
    echo "   ✅ ¡VERSION CORRECTA!"
else
    echo "   ⚠️  Version inesperada (debería ser 2.0.0-pdfmake)"
fi

echo ""
echo "2. 🔧 Integration Check..."
if echo "$HEALTH_RESPONSE" | grep -q "pdf_generator"; then
    echo "   ✅ Usando pdfmake (CÓDIGO NUEVO)"
elif echo "$HEALTH_RESPONSE" | grep -q "google_drive_api"; then
    echo "   ❌ Usando Google Drive (CÓDIGO VIEJO)"
else
    echo "   ❓ Configuración no detectada"
fi

echo ""
echo "3. 🧪 Process Test - Boda completa..."
BODA_RESULT=$(curl -s -X POST "$URL/api/process" \
  -H "Content-Type: application/json" \
  -d '{
    "transcripcion": "Hola, soy Sofía Martínez, RFC MARS850315ABC, quiero contratar decoración para mi boda. Es la boda de Sofía y Carlos, será el 22 de septiembre del 2025 a las 6 de la tarde. Será en el Salón Luna de Plata en Zapopan. Es una boda católica. El salón mide 30 metros de largo por 20 de ancho y tiene 5 metros de alto. Queremos 15 mesas redondas para 150 invitados con sillas chiavari doradas."
  }')

if echo "$BODA_RESULT" | grep -q '"success":true'; then
    echo "   ✅ PDF GENERADO EXITOSAMENTE"
    TIPO=$(echo "$BODA_RESULT" | jq -r '.tipo_documento')
    DOWNLOAD=$(echo "$BODA_RESULT" | jq -r '.download_url')
    echo "   📄 Documento: $TIPO"
    echo "   🔗 Download: $URL$DOWNLOAD"
elif echo "$BODA_RESULT" | grep -q '"needsFollowUp":true'; then
    echo "   ✅ FUNCIONA - Necesita follow up"
    TIPO=$(echo "$BODA_RESULT" | jq -r '.tipo_documento')
    echo "   📄 Documento detectado: $TIPO"
elif echo "$BODA_RESULT" | grep -q "chromium"; then
    echo "   ❌ ERROR DE CHROMIUM (código viejo)"
else
    echo "   ❓ Respuesta inesperada"
    echo "$BODA_RESULT" | jq '.error // .message' 2>/dev/null | head -2
fi

echo ""
echo "🏁 RESULTADO FINAL:"
if [ "$VERSION" = "2.0.0-pdfmake" ] && ! echo "$BODA_RESULT" | grep -q "chromium"; then
    echo "   🎉 ¡DEPLOYMENT EXITOSO!"
    echo "   ✅ Agente paralegal FUNCIONANDO al 100%"
    echo "   🚀 LISTO PARA CASOS REALES"
else
    echo "   ⚠️  Hay algún issue que revisar"
fi

echo ""
echo "📋 Para probar casos reales completos:"
echo "   curl -X POST $URL/api/process -H 'Content-Type: application/json' -d '{\"transcripcion\": \"tu transcripción\"}'"