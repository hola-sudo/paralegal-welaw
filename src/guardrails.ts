/**
 * Guardrails: medidas de seguridad para proteger información sensible
 * 
 * Los guardrails verifican que el contenido no contenga:
 * 1. Información Personal Identificable (PII) que no debería procesarse
 * 2. Contenido inapropiado o que viole políticas de moderación
 */

import OpenAI from 'openai';

// Inicializamos el cliente de OpenAI para usar sus APIs de moderación
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

/**
 * Patrones comunes de PII que debemos detectar y alertar
 * Estos son ejemplos - puedes agregar más según tus necesidades
 */
const PII_PATTERNS = {
  // Números de identificación
  curp: /\b[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}\b/i,
  rfc: /\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/i,
  nss: /\d{11}/,
  
  // Tarjetas de crédito (formato básico)
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
  
  // Cuentas bancarias (formato CLABE mexicana)
  clabe: /\b\d{18}\b/,
  
  // Emails (ya los detectamos, pero podemos validar formato)
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  
  // Teléfonos mexicanos
  phone: /\b(\+52|52)?[\s-]?(\d{2,3})[\s-]?\d{4}[\s-]?\d{4}\b/,
} as const;

/**
 * Resultado de la verificación de guardrails
 */
export interface GuardrailResult {
  passed: boolean;
  warnings: string[];
  blocked: boolean;
  reason?: string;
}

/**
 * Verifica si el texto contiene información personal identificable (PII)
 * 
 * Esta función busca patrones comunes de PII y alerta si se encuentran.
 * NO bloquea el procesamiento, solo alerta para que el usuario esté consciente.
 */
export async function checkPII(text: string): Promise<GuardrailResult> {
  const warnings: string[] = [];
  
  // Verificamos cada patrón de PII
  if (PII_PATTERNS.curp.test(text)) {
    warnings.push('Se detectó posible CURP en el texto');
  }
  
  if (PII_PATTERNS.rfc.test(text)) {
    warnings.push('Se detectó posible RFC en el texto');
  }
  
  if (PII_PATTERNS.nss.test(text)) {
    warnings.push('Se detectó posible NSS en el texto');
  }
  
  if (PII_PATTERNS.creditCard.test(text)) {
    warnings.push('Se detectó posible número de tarjeta de crédito en el texto');
  }
  
  if (PII_PATTERNS.clabe.test(text)) {
    warnings.push('Se detectó posible CLABE bancaria en el texto');
  }
  
  // Contamos emails (pueden ser legítimos en contratos)
  const emailMatches = text.match(PII_PATTERNS.email);
  if (emailMatches && emailMatches.length > 5) {
    warnings.push(`Se detectaron ${emailMatches.length} direcciones de email en el texto`);
  }
  
  // Contamos teléfonos
  const phoneMatches = text.match(PII_PATTERNS.phone);
  if (phoneMatches && phoneMatches.length > 5) {
    warnings.push(`Se detectaron ${phoneMatches.length} números de teléfono en el texto`);
  }
  
  // Si hay muchas advertencias, consideramos bloquear
  const shouldBlock = warnings.length >= 3;
  
  return {
    passed: !shouldBlock,
    warnings,
    blocked: shouldBlock,
    reason: shouldBlock ? 'Se detectaron múltiples tipos de PII. Por favor, revisa el contenido.' : undefined,
  };
}

/**
 * Verifica si el contenido es apropiado usando la API de moderación de OpenAI
 * 
 * Esta función usa la API de moderación de OpenAI para detectar:
 * - Contenido violento
 * - Contenido sexual
 * - Contenido de odio
 * - Contenido de autolesión
 * - Spam
 */
export async function checkModeration(text: string): Promise<GuardrailResult> {
  try {
    // Llamamos a la API de moderación de OpenAI
    const moderation = await openai.moderations.create({
      input: text,
    });
    
    // Verificamos si alguna categoría fue detectada
    const flagged = moderation.results[0].flagged;
    const categories = moderation.results[0].categories;
    
    if (flagged) {
      // Identificamos qué categorías fueron detectadas
      const detectedCategories: string[] = [];
      
      if (categories.hate) detectedCategories.push('odio');
      if (categories['hate/threatening']) detectedCategories.push('amenazas de odio');
      if (categories['self-harm']) detectedCategories.push('autolesión');
      if (categories.sexual) detectedCategories.push('contenido sexual');
      if (categories['sexual/minors']) detectedCategories.push('contenido sexual con menores');
      if (categories.violence) detectedCategories.push('violencia');
      if (categories['violence/graphic']) detectedCategories.push('violencia gráfica');
      if (categories.spam) detectedCategories.push('spam');
      
      return {
        passed: false,
        warnings: [`Contenido inapropiado detectado: ${detectedCategories.join(', ')}`],
        blocked: true,
        reason: `El contenido fue bloqueado por moderación. Categorías detectadas: ${detectedCategories.join(', ')}`,
      };
    }
    
    return {
      passed: true,
      warnings: [],
      blocked: false,
    };
  } catch (error) {
    // Si hay un error con la API, registramos pero no bloqueamos
    console.error('Error en verificación de moderación:', error);
    return {
      passed: true,
      warnings: ['No se pudo verificar la moderación del contenido'],
      blocked: false,
    };
  }
}

/**
 * Ejecuta todos los guardrails y retorna un resultado combinado
 */
export async function runGuardrails(text: string): Promise<{
  pii: GuardrailResult;
  moderation: GuardrailResult;
  overall: {
    passed: boolean;
    blocked: boolean;
    warnings: string[];
  };
}> {
  // Ejecutamos ambos guardrails en paralelo para ser más eficientes
  const [piiResult, moderationResult] = await Promise.all([
    checkPII(text),
    checkModeration(text),
  ]);
  
  // Combinamos los resultados
  const allWarnings = [...piiResult.warnings, ...moderationResult.warnings];
  const blocked = piiResult.blocked || moderationResult.blocked;
  const passed = piiResult.passed && moderationResult.passed && !blocked;
  
  return {
    pii: piiResult,
    moderation: moderationResult,
    overall: {
      passed,
      blocked,
      warnings: allWarnings,
    },
  };
}

