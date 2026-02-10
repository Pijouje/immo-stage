import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '../../utils/prisma'
import { compare } from 'bcrypt'



export default NuxtAuthHandler({
    secret: process.env.AUTH_SECRET,

    pages: {
        signIn: '/connexion', 
    },

    providers: [
        ((CredentialsProvider as any).default || CredentialsProvider)({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },

            async authorize(credentials: any) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if(!user) {
                    throw new Error('Cette email n\'existe pas')
                }

                const ispwdValid = await compare(credentials.password, user.password)

                if(!ispwdValid) {
                    throw new Error('Mot de passe incorrect')
                }

                return {
                    id: user.id.toString,
                    name: user.nom + ' ' + user.prenom,
                    email: user.email,
                    role: user.role  
                } as any
            }
        })
    ]
})