import prisma from "./db";

/**
 * PHASE HOTFIX 9: MASTER TRANSACTIONAL RESILIENCE
 * Executes a database transaction with a retry loop to handle transient latency/pooler failures.
 */
export async function withTransactionRetry(fn, options = { maxRetries: 3, timeout: 25000 }) {
    let lastError;
    for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
        try {
            return await prisma.$transaction(fn, { timeout: options.timeout });
        } catch (error) {
            lastError = error;
            console.error(`⚠️ DB Attempt ${attempt} failed: ${error.message}`);
            
            // Si es un error de unicidad (P2002), no reintentamos
            if (error.code === 'P2002') throw error;

            // Esperar antes de reintentar (jittered exponential backoff)
            if (attempt < options.maxRetries) {
                const delay = Math.min(attempt * 1000 + Math.random() * 500, 3000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}
