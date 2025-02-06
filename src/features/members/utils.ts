import { DATABASE_ID, MEMBERS_ID } from './../../config';
import { Databases, Query } from "node-appwrite";

interface GetMemberProps {
    databases: Databases;
    workspaceId: string;
    userId: string
}
//Tao function getmember nay de su dung global , co the su dung de kiem tra 
//Sau khi tao mot member moi ,thi kiem tra rang ket qua tra ve chi co duy nhat 1 user
//Voi 1 workspace id , va 1 userid , neu co 2 ket qua thi co van de
export const getMember = async ({ databases, workspaceId, userId }: GetMemberProps) => {
    const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [
            Query.equal("workspaceId", workspaceId),
            Query.equal("userId", userId)
        ]
    )
    return members.documents[0]

}