import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if(!session?.user?.id) {
        return { ok: false }
    }

    await prisma.user.update({
        where: { id : Number(session.user.id) },
        data: {derniereActivite: new Date()}
    })

    return { ok : true }
})