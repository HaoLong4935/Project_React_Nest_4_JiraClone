import { DatePicker } from "@/components/date-picker";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspaceId } from "@/features/hooks/use-workspace-id";
import { useGetWMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { FolderIcon, ListChecksIcon, UserIcon } from "lucide-react";
import { useTaskFilters } from "../hooks/use-task-filters";
import { TaskStatus } from "../types";

interface DataFilterProps {
    hideProjectFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter }: DataFilterProps) => {
    const workspaceId = useWorkspaceId()
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId })
    const { data: members, isLoading: isLoadingMembers } = useGetWMembers({ workspaceId })

    const isLoading = isLoadingMembers || isLoadingProjects;

    const projectOptions = projects?.documents.map((project) => ({
        value: project.$id,
        label: project.name,
    }))

    const memberOptions = members?.documents.map((member) => ({
        value: member.$id,
        label: member.name,
    }))

    // Định nghĩa một useState của nuqs 
    const [{
        status,
        assigneeId,
        projectId,
        dueDate
    }, setFilters] = useTaskFilters()

    const onStatusChange = (value: string) => {
        setFilters({ status: value === "all" ? null : value as TaskStatus })
    }

    const onAssigneeChange = (value: string) => {
        setFilters({ assigneeId: value === "all" ? null : value as string })
    }

    const onProjectChange = (value: string) => {
        setFilters({ projectId: value === "all" ? null : value as string })
    }

    if (isLoading) return null;



    return (
        <div className="flex flex-col lg:flex-row gap-2">
            <Select defaultValue={status ?? undefined} onValueChange={(value) => { onStatusChange(value) }}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <ListChecksIcon className="size-4 mr-2" />
                        <SelectValue placeholder="All statuses" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        All Statuses
                    </SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskStatus.BACKLOG}>
                        Backlog
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                        In Progress
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>
                        In Review
                    </SelectItem>
                    <SelectItem value={TaskStatus.TODO}>
                        To do
                    </SelectItem>
                    <SelectItem value={TaskStatus.DONE}>
                        Done
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* SELECT ASSIGNEE */}
            <Select defaultValue={assigneeId ?? undefined} onValueChange={(value) => { onAssigneeChange(value) }}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <UserIcon className="size-4 mr-2" />
                        <SelectValue placeholder="All Assignees" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        All assignees
                    </SelectItem>
                    <SelectSeparator />
                    {memberOptions?.map((member) => {
                        return (
                            <SelectItem key={member.value} value={member.value}>
                                {member.label}
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>

            {/* SELECT PROJECT */}
            {!hideProjectFilter && (
                <Select defaultValue={projectId ?? undefined} onValueChange={(value) => { onProjectChange(value) }}>
                    <SelectTrigger className="w-full lg:w-auto h-8">
                        <div className="flex items-center pr-2">
                            <FolderIcon className="size-4 mr-2" />
                            <SelectValue placeholder="All Projects" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            All Projects
                        </SelectItem>
                        <SelectSeparator />
                        {projectOptions?.map((project) => {
                            return (
                                <SelectItem key={project.value} value={project.value}>
                                    {project.label}
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            )}
            <DatePicker
                placeholder="Due date"
                className="h-8 w-full lg:w-auto"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(date) => {
                    setFilters({ dueDate: date ? date.toISOString() : null })
                }}
            />
        </div>
    )
}