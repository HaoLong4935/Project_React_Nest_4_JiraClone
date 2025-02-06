"use client"

import { PageError } from "@/components/page-error"
import { PageLoader } from "@/components/page-loader"
import { useWorkspaceId } from "@/features/hooks/use-workspace-id"
import { useGetSingleWorkspace } from "@/features/workspaces/api/use-get-a-workspace"
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-worksapce-form"

export const WorkspaceIdSettingClient = () => {
    const workspaceId = useWorkspaceId()
    const { data: initialValues, isLoading } = useGetSingleWorkspace({ workspaceId })

    if (isLoading) {
        return <PageLoader />
    }
    if (!initialValues) {
        return <PageError message="Project not found" />
    }
    return (
        <div className="w-full lg:max-w-xl">
            <EditWorkspaceForm initialValues={initialValues} />
        </div>
    )
}