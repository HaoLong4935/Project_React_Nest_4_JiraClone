import { updateWorkspaceSchema } from './../schemas';
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACE_ID } from './../../../config';
import { sessionMiddleware } from './../../../lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from "hono"
import { createWorkspaceSchema } from '../schemas';
import { ID, Query } from 'node-appwrite';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';
import { z } from 'zod';
import { Workspace } from '../types';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { TaskStatus } from '@/features/tasks/types';

const app = new Hono()
    .get("/:workspaceId", sessionMiddleware, async (c) => {
        const user = c.get("user")
        const databases = c.get("databases")
        const { workspaceId } = c.req.param()

        const member = await getMember(
            {
                databases,
                workspaceId,
                userId: user.$id
            }
        )

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
        }

        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACE_ID,
            workspaceId
        )

        return c.json({ data: workspace })
    })
    .get("/:workspaceId/info", sessionMiddleware, async (c) => {
        const databases = c.get("databases")
        const { workspaceId } = c.req.param()

        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACE_ID,
            workspaceId
        )

        return c.json({
            data: {
                $id: workspace.$id,
                name: workspace.name,
                imageUrl: workspace.imageUrl,
            }
        })
    })
    .get("/", sessionMiddleware, async (c) => {
        const user = c.get("user")
        const databases = c.get("databases")

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)]
        )

        if (members.total === 0) {
            return c.json({ documents: [], total: 0 }, 404)
        }

        const workspaceIds = members.documents.map((member) => member.workspaceId)

        const workspaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACE_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds)
            ]
        )
        return c.json({ data: workspaces })
    })
    .post("/",
        sessionMiddleware,
        zValidator("form", createWorkspaceSchema),
        async (c) => {
            const databases = c.get("databases")
            const storage = c.get("storage")
            const user = c.get("user")

            const { name, image } = c.req.valid("form")

            let uploadedImageUrl: string | undefined

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image
                )

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id
                )

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
            }

            const workspace = await databases.createDocument(
                DATABASE_ID,
                WORKSPACE_ID,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadedImageUrl,
                    inviteCode: generateInviteCode(6)
                }
            )

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN
                }
            )

            return c.json({ data: workspace })
        })
    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form", updateWorkspaceSchema),
        async (c) => {
            const databases = c.get("databases")
            const storage = c.get("storage")
            const user = c.get("user")

            const { workspaceId } = c.req.param()
            const { name, image } = c.req.valid("form")

            const member = await getMember({ databases, workspaceId, userId: user.$id })

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            let uploadedImageUrl: string | undefined

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image
                )

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id
                )

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
            } else {
                uploadedImageUrl = image
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACE_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadedImageUrl
                }
            )

            return c.json({ data: workspace })
        }
    )
    .delete(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")
            const { workspaceId } = c.req.param()

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            })
            // Chi co admin moi co quyen delete
            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            await databases.deleteDocument(
                DATABASE_ID,
                WORKSPACE_ID, // Cho ni la Id cua workspaces so nhieu 
                workspaceId
            )

            return c.json({ data: { $id: workspaceId } })
        }
    )
    .post(
        "/:workspaceId/reset-invite-code",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")
            const { workspaceId } = c.req.param()

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            })
            // Chi co admin moi co quyen reset
            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACE_ID, // Cho ni la Id cua workspaces so nhieu 
                workspaceId,
                {
                    inviteCode: generateInviteCode(6)
                }
            )

            return c.json({ data: workspace })
        }
    )
    .post("/:workspaceId/join",
        sessionMiddleware,
        zValidator("json", z.object({ inviteCode: z.string() })),
        async (c) => {
            const { workspaceId } = c.req.param()
            const { inviteCode } = c.req.valid("json")

            const databases = c.get("databases")
            const user = c.get("user")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })
            if (member) {
                return c.json({ error: "Already a member" }, 400)
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACE_ID,
                workspaceId
            )

            if (workspace.inviteCode != inviteCode) {
                return c.json({ error: "Invalid invite code " }, 400)
            }

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.MEMBER
                }
            )

            return c.json({ data: workspace })
        }
    )
    .get("/:workspaceId/analytics",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")
            const { workspaceId } = c.req.param()

            const member = await getMember(
                {
                    databases,
                    workspaceId,
                    userId: user.$id
                }
            )

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const now = new Date()
            const thisMonthStart = startOfMonth(now)
            const thisMonthEnd = endOfMonth(now)
            const lastMonthStart = startOfMonth(subMonths(now, 1))
            const lastMonthEnd = endOfMonth(subMonths(now, 1))

            // THIS MONTH AND LAST MONTH TASKS
            const thisMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )

            const thisMonthTaskCount = thisMonthTasks.total
            const lastMongthTaskCount = lastMonthTasks.total
            const taskDifferent = thisMonthTaskCount - lastMongthTaskCount
            // THIS MONTH AND LAST MONTH TASKS


            // COUNT ASSIGNED TASK
            const thisMonthAssignedTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthAssignedTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )

            const thisMonthAssignedTaskCount = thisMonthAssignedTask.total
            const lastMonthAssignedTaskCount = lastMonthAssignedTask.total
            const assignedTaskDifferent = thisMonthAssignedTaskCount - lastMonthAssignedTaskCount
            // COUNT ASSIGNED TASK


            // COUNT INCOMPLETE TASK
            const thisMonthInCompleteTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthInCompleteTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )

            const thisMonthIncompleteTaskCount = thisMonthInCompleteTask.total
            const lastMonthInCompleteTaskCount = lastMonthInCompleteTask.total
            const InCompletTaskDifferent = thisMonthIncompleteTaskCount - lastMonthInCompleteTaskCount
            // COUNT INCOMPLETE TASK


            // COUNT COMPLETED TASK
            const thisMonthCompletedTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthCompletedTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )

            const thisMonthCompletedTaskCount = thisMonthCompletedTask.total
            const lastMonthCompletedTaskCount = lastMonthCompletedTask.total
            const completedTaskDifferent = thisMonthCompletedTaskCount - lastMonthCompletedTaskCount
            // COUNT COMPLETED TASK


            // COUNT OVERDUE TASK
            const thisMonthOverdueTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("status", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthOverdueTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("status", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ]
            )

            const thisMonthOverdueTaskCount = thisMonthOverdueTask.total
            const lastMonthOverdueTaskCount = lastMonthOverdueTask.total
            const overdueTaskDifferent = thisMonthOverdueTaskCount - lastMonthOverdueTaskCount
            // COUNT OVERDUE TASK

            return c.json({
                data: {
                    thisMonthTaskCount,
                    lastMongthTaskCount,
                    taskDifferent,
                    thisMonthAssignedTaskCount,
                    lastMonthAssignedTaskCount,
                    assignedTaskDifferent,
                    thisMonthIncompleteTaskCount,
                    lastMonthInCompleteTaskCount,
                    InCompletTaskDifferent,
                    thisMonthCompletedTaskCount,
                    lastMonthCompletedTaskCount,
                    completedTaskDifferent,
                    thisMonthOverdueTaskCount,
                    lastMonthOverdueTaskCount,
                    overdueTaskDifferent
                }
            })
        })
export default app 