/// <reference path="../../../next-auth.d.ts" />

import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '../../utils/prisma'
import { compare } from 'bcrypt'
import { checkRateLimit, recordFailedAttempt, resetAttempts, getRemainingAttempts } from '../../utils/rateLimiter'

// SECURITE : AUTH_SECRET doit être défini (pas de fallback en dur)
const authSecret = process.env.AUTH_SECRET
if (!authSecret) {
    throw new Error('AUTH_SECRET manquant. Générez-en un avec: openssl rand -base64 32')
}

export default NuxtAuthHandler({
    secret: authSecret,

    pages: {
        signIn: '/connexion',
    },

    // Configuration de la session
    session: {
        strategy: 'jwt', // Utilisation de JWT pour la session
        maxAge: 30 * 24 * 60 * 60, // 30 jours
    },

    // Configuration des cookies
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        }
    },

    providers: [
        ((CredentialsProvider as any).default || CredentialsProvider)({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },

            async authorize(credentials: any, req: any) {
                // Extraire l'IP pour le rate limiting (support proxy)
                const ip = (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim()
                    || req?.socket?.remoteAddress
                    || 'unknown'

                // SECURITE : vérifier le rate limit avant tout traitement
                const rateCheck = checkRateLimit(ip)
                if (rateCheck.blocked) {
                    const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000)
                    throw new Error(`RATE_LIMITED:${minutes}`)
                }

                // 1. Vérifier que les credentials sont fournis
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email et mot de passe requis')
                }

                // 2. Chercher l'utilisateur dans la base
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                // SECURITE : retourner null (code "CredentialsSignin") pour empêcher l'énumération d'utilisateurs
                if (!user) {
                    recordFailedAttempt(ip)
                    const remaining = getRemainingAttempts(ip)
                    if (remaining > 0 && remaining <= 3) throw new Error(`WARN_ATTEMPTS:${remaining}`)
                    return null
                }

                // 3. Vérifier le mot de passe
                const isPwdValid = await compare(credentials.password, user.password)

                if (!isPwdValid) {
                    recordFailedAttempt(ip)
                    const remaining = getRemainingAttempts(ip)
                    if (remaining > 0 && remaining <= 3) throw new Error(`WARN_ATTEMPTS:${remaining}`)
                    return null
                }

                // Connexion réussie : réinitialiser le compteur de tentatives
                resetAttempts(ip)

                // 4. Retourner l'utilisateur (sera stocké dans le token JWT)
                return {
                    id: user.id.toString(),
                    name: `${user.prenom || ''} ${user.nom}`.trim(),
                    email: user.email,
                    role: user.role
                } as any
            }
        })
    ],

    // Callbacks pour personnaliser le token JWT et la session
    callbacks: {
        async jwt({ token, user, account }) {
            // Lors de la première connexion, ajouter les infos user au token
            if (user) {
                token.id = user.id as string
                token.role = (user as any).role
            }
            return token
        },
        
        async session({ session, token }) {
            // Ajouter les infos du token à la session accessible côté client
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        }
    }
})