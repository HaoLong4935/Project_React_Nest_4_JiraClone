import { Member, MemberRole } from '@/features/members/types';
import { MEMBERS_ID, DATABASE_ID } from '@/config';
import { getMember } from './../utils';
import { Query } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite';
import { sessionMiddleware } from './../../../lib/session-middleware';
import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases")
            const user = c.get("user")
            const { workspaceId } = c.req.valid("query")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            })

            if (!member) { return c.json({ error: "Unauthorized" }, 401) }

            const members = await databases.listDocuments<Member>(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", workspaceId)]
            )
            // Tại vì trong database chỉ lưu id của member đó và id của workspace
            // Nên khi cần thông tin như tên thì sẽ không có, vì vậy cần phải lấy thông tin 
            // Và sử dụng users của AdminClient để có thể truy cập vào 
            const populateMembers = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId)
                    //Overide thêm các thuộc tính 
                    return {
                        ...member,
                        name: user.name || user.email,
                        email: user.email,
                    }
                })
            )
            //Khi trả về cục data thì cần phải dùng spread method
            // Bởi vì members có kiểu dữ liệu là document 
            // Còn populateMembers chỉ là mảng 
            return c.json({
                data: {
                    ...members,
                    documents: populateMembers
                }
            })
        }
    )
    .delete("/:memberId",
        sessionMiddleware,
        async (c) => {
            const { memberId } = c.req.param()
            const user = c.get("user")
            const databases = c.get("databases")
            //Get single member document
            const memberToDelete = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId
            )
            //Get all members in workspace
            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", memberToDelete.workspaceId)]
            )
            //Get the mebers
            const member = await getMember({
                databases,
                workspaceId: memberToDelete.workspaceId,
                userId: user.$id
            })
            //Kiểm tra bản thân có tồn tại trong workspace đó không 
            if (!member) {
                return c.json({ error: "Unauthorize" }, 401)
            }

            if (allMembersInWorkspace.total == 1) {
                return c.json({ error: "You cannot delete the only member in this workspace" }, 400)
            }

            //Kiểm tra xem id của member có trùng với id của mình không , phải khác chớ không là xóa lun bản thân 
            //Kiểm tra xem bản thân có phải là admin không , chỉ có admin mới được xóa member
            if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorize" }, 401)
            }

            await databases.deleteDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId
            )

            return c.json({ data: { $id: memberToDelete.$id } })
        }
    )
    .patch(
        "/:memberId",
        zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
        sessionMiddleware,
        async (c) => {
            const { memberId } = c.req.param()
            const { role } = c.req.valid("json")
            const user = c.get("user")
            const databases = c.get("databases")
            //Get single member document
            const memberToUpdate = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId
            )
            //Get all members in the same workspace
            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", memberToUpdate.workspaceId)]
            )
            //Get the mebers 
            //Kiểm tra bản thân có tồn tại trong workspace đó không 
            const member = await getMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id
            })
            //Kiểm tra bản thân có tồn tại trong workspace đó không 
            if (!member) {
                return c.json({ error: "Unauthorize" }, 401)
            }

            if (allMembersInWorkspace.total == 1) {
                return c.json({ error: "You cannot downgrade the only member in this workspace" }, 400)
            }

            //Kiểm tra xem id của member có trùng với id của mình không , phải khác chớ không là xóa lun bản thân 
            //Kiểm tra xem bản thân có phải là admin không , chỉ có admin mới được xóa member
            if (member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorize" }, 401)
            }

            await databases.updateDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
                {
                    role,
                }
            )

            return c.json({ data: { $id: memberToUpdate.$id } })
        }
    )


export default app