import { TaskStatus } from './../../tasks/types';
import { TASKS_ID } from './../../../config';
import { subMonths } from 'date-fns';
import { zValidator } from '@hono/zod-validator';
import { sessionMiddleware } from './../../../lib/session-middleware';
import { Hono } from "hono";
import { z } from 'zod';
import { getMember } from '@/features/members/utils';
import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from '@/config';
import { ID, Query } from 'node-appwrite';
import { createProjectSchema, updateProjectSchema } from '../schemas';
import { Project } from '../types';
import { endOfMonth, startOfMonth } from 'date-fns';

const app = new Hono()
    .get("/:projectId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user")
            const databases = c.get("databases")
            const { projectId } = c.req.param()

            if (!projectId) return c.json({ error: "Missing projectId when getting individual project" }, 404)

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
            )

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id,
            })

            if (!member) return c.json({ error: "Unauthorized" }, 401)

            return c.json({ data: project })
        })
    .get("/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get("user")
            const databases = c.get("databases")
            const { workspaceId } = c.req.valid("query")

            if (!workspaceId) return c.json({ error: "Missing workspaceId when getting projects" }, 404)

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) return c.json({ error: "Unauthorized" }, 401)

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ]
            )

            if (!projects) {
                return c.json({ error: "Project data is empty" }, 404)
            }

            return c.json({ data: projects })
        })
    .post("/",
        sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            const databases = c.get("databases")
            const storage = c.get("storage")
            const user = c.get("user")

            const { name, image, workspaceId } = c.req.valid("form")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) return c.json({ error: "Unauthorized" }, 401)

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

            const project = await databases.createDocument(
                DATABASE_ID,
                PROJECTS_ID,
                ID.unique(),
                {
                    name,
                    imageUrl: uploadedImageUrl,
                    workspaceId
                }
            )
            return c.json({ data: project })
        }
    )
    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("form", updateProjectSchema),
        async (c) => {
            const databases = c.get("databases")
            const storage = c.get("storage")
            const user = c.get("user")

            const { projectId } = c.req.param()
            const { name, image } = c.req.valid("form")

            const existingProject = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            })


            if (!member) {
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

            const projectUpdated = await databases.updateDocument(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
                {
                    name,
                    imageUrl: uploadedImageUrl
                }
            )

            return c.json({ data: projectUpdated })
        }
    )
    .delete(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")
            const { projectId } = c.req.param()

            const existingProject = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id,
            })
            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            await databases.deleteDocument(
                DATABASE_ID,
                PROJECTS_ID, // Cho ni la Id cua workspaces so nhieu 
                projectId
            )

            return c.json({ data: { $id: existingProject.$id } })
        }
    )
    .get("/:projectId/analytics",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")
            const { projectId } = c.req.param()

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember(
                {
                    databases,
                    workspaceId: project.workspaceId,
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
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthAssignedTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthInCompleteTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            )

            const lastMonthCompletedTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
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