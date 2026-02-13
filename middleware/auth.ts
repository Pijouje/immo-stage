export default defineNuxtRouteMiddleware((to, from) => {
  const { status, signIn } = useAuth()

  // Si l'utilisateur n'est pas authentifié
  if (status.value === 'unauthenticated') {
    return navigateTo('/connexion')
  }
})