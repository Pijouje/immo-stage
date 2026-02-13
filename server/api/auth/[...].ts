/// <reference path="../../../next-auth.d.ts" />

import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '../../utils/prisma'
import { compare } from 'bcrypt'

export default NuxtAuthHandler({
    // La clé secrète pour signer les tokens JWT
    secret: process.env.AUTH_SECRET || 'ma-cle-secrete-super-longue-et-aleatoire-minimum-32-caracteres',

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

            async authorize(credentials: any) {
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

                if (!user) {
                    throw new Error('Cette email n\'existe pas')
                }

                // 3. Vérifier le mot de passe
                const isPwdValid = await compare(credentials.password, user.password)

                if (!isPwdValid) {
                    throw new Error('Mot de passe incorrect')
                }

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