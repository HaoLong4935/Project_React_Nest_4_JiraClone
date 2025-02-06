import { Card, CardContent } from "@/components/ui/card"
import { useWorkspaceId } from "@/features/hooks/use-workspace-id"
import { useGetWMembers } from "@/features/members/api/use-get-members"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { Loader } from "lucide-react"
import { CreateTaskForm } from "./create-task-form"

interface CreateTaskFormWrapperProps {
    onCancle: () => void
}

export const CreateTaskFormWrapper = ({
    onCancle
}: CreateTaskFormWrapperProps) => {
    const workspaceId = useWorkspaceId()
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId })
    const { data: members, isLoading: isLoadingMembers } = useGetWMembers({ workspaceId })

    const projectOptions = projects?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
        imageUrl: project.imageUrl,
    }));

    const memberOptions = members?.documents.map((member) => ({
        id: member.$id,
        name: member.name
    }))

    const isLoading = isLoadingMembers || isLoadingProjects

    if (isLoading) {
        return (
            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <div>
            <CreateTaskForm
                onCancle={onCancle}
                projectOptions={projectOptions ?? []}
                memberOptions={memberOptions ?? []}
            />
        </div>
    )
}