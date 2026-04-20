/**
 * API Client hardened for Production
 * Includes: Timeout, Retries, Content-Type validation, and typed errors.
 */

export class APIError extends Error {
    constructor(message, type, status) {
        super(message);
        this.name = "APIError";
        this.type = type; // NETWORK, SERVER, INVALID_JSON, TIMEOUT
        this.status = status;
    }
}

export async function safeFetch(url, options = {}) {
    const { timeout = 5000, retries = 1, ...fetchOptions } = options;

    const executeFetch = async (attempt) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
            });

            clearTimeout(id);

            // Validar errores de servidor (502, 504, 500)
            if (!response.ok) {
                if (response.status >= 500 && attempt < retries) {
                    console.warn(`⚠️ [API] Reintentando (${attempt + 1}/${retries}) para ${url}...`);
                    return executeFetch(attempt + 1);
                }
                throw new APIError(`HTTP ${response.status}`, "SERVER", response.status);
            }

            // Validar Content-Type antes de parsear JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("❌ [API] Respuesta no JSON detectada:", text.substring(0, 100));
                throw new APIError("Invalid response format (not JSON)", "INVALID_JSON", response.status);
            }

            return await response.json();

        } catch (err) {
            clearTimeout(id);
            if (err.name === "AbortError") {
                if (attempt < retries) {
                    return executeFetch(attempt + 1);
                }
                throw new APIError("Request timeout", "TIMEOUT", 408);
            }
            if (err instanceof APIError) throw err;
            
            if (attempt < retries) {
                return executeFetch(attempt + 1);
            }
            throw new APIError(err.message, "NETWORK");
        }
    };

    return executeFetch(0);
}
