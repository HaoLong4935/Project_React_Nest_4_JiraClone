import "server-only"

import { Client, Account, Databases, Users } from "node-appwrite"
import { AUTH_COOKIE } from '@/features/auth/constant';
import { cookies } from 'next/headers';

export async function createSessionClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

    const session = await cookies().get(AUTH_COOKIE)

    if (!session || !session.value) {
        throw new Error("Unauthorized")
    }

    client.setSession(session.value)
    return {
        //Method getter và setter để khi tạo một const client = await createSessionClient
        //Thì sẽ có thể truy cập đến các method là account và databases

        //const clientInstance = await createSessionClient()
        // const account = clientInstance.account
        // const databases = clientInstance.databases
        get account() {
            return new Account(client)
        },
        get databases() {
            return new Databases(client)
        }
    }
}

export async function createAdminClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setKey(process.env.NEXT_APPWRITE_KEY!)
    return {
        get account() {
            return new Account(client)
        },
        get users() {
            return new Users(client)
        }
    }
}