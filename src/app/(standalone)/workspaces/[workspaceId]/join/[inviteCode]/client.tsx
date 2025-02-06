"use client"

import { PageError } from "@/components/page-error"
import { PageLoader } from "@/components/page-loader"
import { useWorkspaceId } from "@/features/hooks/use-workspace-id"
import { useGetSingleWorkspaceInfo } from "@/features/workspaces/api/use-get-a-workspace-info"
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form"

export const WorkspaceIdJoinClient = () => {
    const workspaceId = useWorkspaceId()
    const { data: initialValues, isLoading } = useGetSingleWorkspaceInfo({ workspaceId })

    if (isLoading) {
        return <PageLoader />
    }
    if (!initialValues) {
        return <PageError message="Project not found" />
    }

    return (
        <div className="w-full lg:max-w-xl">
            <JoinWorkspaceForm initialValues={initialValues} />
        </div>
    )
}