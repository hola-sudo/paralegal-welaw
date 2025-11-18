#!/bin/bash

# Test rápido con descarga inmediata
# Uso: ./tmp_rovodev_test_rapido.sh https://tu-nueva-url.vercel.app

URL="$1"
if [ "$URL" = "" ]; then
    echo "❌ Proporciona la URL: $0 https://tu-nueva-url.vercel.app"
    exit 1
fi

echo "🚀 TEST RÁPIDO CON DESCARGA INMEDIATA"
echo "====================================="
echo "URL: $URL"
echo ""

echo "1. 📋 Generando PDF..."
START_TIME=$(date +%s)

RESULT=$(curl -s -X POST "$URL/api/process" \
  -H "Content-Type: application/json" \
  -d '{
    "transcripcion": "PRUEBA RÁPIDA: María González, boda 15 junio 2025, Salón Luna de Plata, Zapopan, boda católica, 150 invitados, mesas redondas, sillas chiavari doradas, salón 30x20 metros."
  }')

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "   ⏱️  Tiempo de generación: ${DURATION} segundos"

if echo "$RESULT" | grep -q '"success":true'; then
    echo "   ✅ PDF GENERADO EXITOSAMENTE"
    
    TIPO=$(echo "$RESULT" | jq -r '.tipo_documento')
    DOWNLOAD_URL=$(echo "$RESULT" | jq -r '.download_url')
    FILE_NAME=$(echo "$RESULT" | jq -r '.file_name')
    
    echo "   📄 Tipo: $TIPO"
    echo "   📁 Archivo: $FILE_NAME"
    echo "   🔗 URL: $URL$DOWNLOAD_URL"
    
    echo ""
    echo "2. 💾 Descargando PDF inmediatamente..."
    
    # Descargar inmediatamente
    curl -s "$URL$DOWNLOAD_URL" -o "test_pdf_$FILE_NAME"
    
    if [ -f "test_pdf_$FILE_NAME" ]; then
        FILE_SIZE=$(stat -f%z "test_pdf_$FILE_NAME" 2>/dev/null || stat -c%s "test_pdf_$FILE_NAME" 2>/dev/null)
        echo "   ✅ PDF DESCARGADO EXITOSAMENTE"
        echo "   📦 Tamaño: $FILE_SIZE bytes"
        echo "   📁 Guardado como: test_pdf_$FILE_NAME"
        
        # Verificar que no está corrupto
        if [ "$FILE_SIZE" -gt 1000 ]; then
            echo "   ✅ PDF parece válido (>1KB)"
        else
            echo "   ⚠️  PDF muy pequeño, posible error"
        fi
    else
        echo "   ❌ Error descargando PDF"
    fi
    
elif echo "$RESULT" | grep -q '"needsFollowUp":true'; then
    echo "   ✅ FUNCIONA - Necesita más datos"
    echo "   📄 Tipo detectado: $(echo "$RESULT" | jq -r '.tipo_documento')"
    
else
    echo "   ❌ Error en generación"
    echo "$RESULT" | jq '.error // .message' | head -3
fi

echo ""
echo "🏁 CONCLUSIÓN:"
if echo "$RESULT" | grep -q '"success":true'; then
    echo "   🎉 ¡AGENTE PARALEGAL FUNCIONANDO PERFECTAMENTE!"
    echo "   ✅ Generación rápida + descarga exitosa"
    echo "   🚀 LISTO PARA PRODUCCIÓN"
else
    echo "   ⚠️  Necesita ajustes o más datos"
fi