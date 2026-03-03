interface AttemptInfo {
    count: number
    firstAttempt: number
    blockedUntil?: number
}

const loginAttempts = new Map<string, AttemptInfo>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000   // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000  // 15 minutes de blocage

// Nettoyage périodique pour éviter les fuites mémoire
setInterval(() => {
    const now = Date.now()
    for (const [ip, info] of loginAttempts.entries()) {
        const expired = info.blockedUntil
            ? now > info.blockedUntil
            : now - info.firstAttempt > WINDOW_MS
        if (expired) loginAttempts.delete(ip)
    }
}, 10 * 60 * 1000)

export function checkRateLimit(ip: string): { blocked: boolean; remainingMs?: number } {
    const now = Date.now()
    const info = loginAttempts.get(ip)

    if (!info) return { blocked: false }

    if (info.blockedUntil) {
        if (now < info.blockedUntil) {
            return { blocked: true, remainingMs: info.blockedUntil - now }
        }
        // Blocage expiré : réinitialiser
        loginAttempts.delete(ip)
        return { blocked: false }
    }

    // Fenêtre dépassée : réinitialiser
    if (now - info.firstAttempt > WINDOW_MS) {
        loginAttempts.delete(ip)
        return { blocked: false }
    }

    return { blocked: false }
}

export function recordFailedAttempt(ip: string): void {
    const now = Date.now()
    const info = loginAttempts.get(ip)

    if (!info || now - info.firstAttempt > WINDOW_MS) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now })
        return
    }

    const newCount = info.count + 1
    if (newCount >= MAX_ATTEMPTS) {
        loginAttempts.set(ip, { ...info, count: newCount, blockedUntil: now + BLOCK_DURATION_MS })
    } else {
        loginAttempts.set(ip, { ...info, count: newCount })
    }
}

export function resetAttempts(ip: string): void {
    loginAttempts.delete(ip)
}

// Retourne le nombre de tentatives restantes après un échec (0 = bloqué)
export function getRemainingAttempts(ip: string): number {
    const now = Date.now()
    const info = loginAttempts.get(ip)
    if (!info || now - info.firstAttempt > WINDOW_MS) return MAX_ATTEMPTS
    if (info.blockedUntil) return 0
    return Math.max(0, MAX_ATTEMPTS - info.count)
}
