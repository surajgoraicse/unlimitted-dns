import { db } from "@/db/db";
import handleError from "@/lib/api-error";


interface IUserRepository {
	checkUserExistFromId(id : string) : Promise<boolean>
}


export async function checkUserExist(id: string) {
	const user = await db.query.user.findFirst({
		where: (user, { eq }) => eq(user.id, id),
	});
	return !!user;
}
export async function findFirstUser(id: string) {
	try {
        const user = await db.query.user.findFirst({
        		where: (user, { eq }) => eq(user.id, id),
        	});
        	return user
        		? { success: true, data: user }
        		: { success: false, data: null };
    } catch (error) {
        handleError(error)
    }
}
