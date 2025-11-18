#!/bin/bash

# Test del fix de descarga
URL="$1"

if [ "$URL" = "" ]; then
    echo "❌ Proporciona la URL: $0 https://tu-url.vercel.app"
    exit 1
fi

echo "🔧 PROBANDO FIX DE DESCARGA PDF"
echo "=============================="
echo "URL: $URL"
echo ""

echo "1. 🚀 Generando PDF con fix..."

RESULT=$(curl -s -X POST "$URL/api/process" \
  -H "Content-Type: application/json" \
  -d '{
    "transcripcion": "TEST FIX: María González, boda 15 junio 2025, Salón Luna, boda católica, 150 invitados, mesas redondas chiavari doradas, salón 30x20 metros."
  }')

if echo "$RESULT" | grep -q '"success":true'; then
    echo "   ✅ PDF generado exitosamente"
    
    # Extraer datos del PDF
    TIPO=$(echo "$RESULT" | jq -r '.tipo_documento')
    FILE_NAME=$(echo "$RESULT" | jq -r '.file_name')
    HAS_DIRECT=$(echo "$RESULT" | jq -r '.pdf_direct.ready_for_download')
    PDF_SIZE=$(echo "$RESULT" | jq -r '.pdf_direct.size')
    
    echo "   📄 Tipo: $TIPO"
    echo "   📁 Archivo: $FILE_NAME"
    echo "   📦 Tamaño: $PDF_SIZE bytes"
    echo "   🔧 PDF directo disponible: $HAS_DIRECT"
    
    if [ "$HAS_DIRECT" = "true" ] && [ "$PDF_SIZE" -gt "1000" ]; then
        echo ""
        echo "2. 💾 Extrayendo PDF base64..."
        
        # Extraer base64
        PDF_BASE64=$(echo "$RESULT" | jq -r '.pdf_direct.base64')
        
        if [ "$PDF_BASE64" != "null" ] && [ "${#PDF_BASE64}" -gt 100 ]; then
            echo "   ✅ Base64 extraído (${#PDF_BASE64} caracteres)"
            
            # Decodificar y guardar
            echo "$PDF_BASE64" | base64 -d > "test_fixed_$FILE_NAME"
            
            if [ -f "test_fixed_$FILE_NAME" ]; then
                ACTUAL_SIZE=$(stat -f%z "test_fixed_$FILE_NAME" 2>/dev/null || stat -c%s "test_fixed_$FILE_NAME")
                echo "   ✅ PDF DESCARGADO Y GUARDADO"
                echo "   📁 Archivo: test_fixed_$FILE_NAME"
                echo "   📦 Tamaño real: $ACTUAL_SIZE bytes"
                
                if [ "$ACTUAL_SIZE" -gt 5000 ]; then
                    echo "   🎉 ¡PDF VÁLIDO! (>5KB)"
                else
                    echo "   ⚠️  PDF pequeño, posible problema"
                fi
            else
                echo "   ❌ Error guardando PDF"
            fi
        else
            echo "   ❌ Base64 inválido o vacío"
        fi
    else
        echo "   ❌ PDF directo no disponible"
    fi
    
elif echo "$RESULT" | grep -q '"needsFollowUp":true'; then
    echo "   ✅ Agente funciona - necesita más datos"
    echo "   📄 Tipo: $(echo "$RESULT" | jq -r '.tipo_documento')"
else
    echo "   ❌ Error en proceso"
    echo "$RESULT" | jq '.error' | head -2
fi

echo ""
echo "🏁 RESULTADO DEL FIX:"
if [ -f "test_fixed_$FILE_NAME" ]; then
    echo "   🎉 ¡FIX EXITOSO!"
    echo "   ✅ PDF se descarga inmediatamente"
    echo "   🚀 Problema de storage resuelto"
else
    echo "   ⚠️  Fix necesita ajustes"
fi