import { prisma } from "../../lib/prisma.js";

export async function pauseAccount(req, res){
    try {

        const {email } = req.body
        
        const user = await prisma.users.findFirst({
            where: {
                email
            }, 
        })

        await prisma.users.update({
            where:{
                id: user.id
            },
            data:{
                deleted_at: new Date(),
                paused_at: new Date(), 
            }
        })

        return res.status(201).json({ message: "ACCOUNT PAUSED" });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}