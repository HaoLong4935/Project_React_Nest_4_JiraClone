import { createSessionClient } from '@/lib/appwrite';

export const getCurrent = async () => {
    try {
        const { account } = await createSessionClient()
        return await account.get()
    } catch (error) {
        console.log("Error when get Current Auth", error);
        return null
    }
}