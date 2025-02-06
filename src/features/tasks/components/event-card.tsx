import { MemberAvatar } from "@/app/(standalone)/workspaces/[workspaceId]/members/components/members-avatar";
import { useWorkspaceId } from "@/features/hooks/use-workspace-id";
import { Member } from "@/features/members/types";
import { Project } from "@/features/projects/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";
import { TaskStatus } from "../types";

interface EventCardProps {
    title: string,
    assignee: Member,
    project: Project,
    status: TaskStatus,
    id: string,
}

const statusColorMap: Record<TaskStatus, string> = {
    [TaskStatus.BACKLOG]: "border-l-pink-500",
    [TaskStatus.TODO]: "border-l-red-500",
    [TaskStatus.IN_PROGRESS]: "border-l-yellow-500",
    [TaskStatus.IN_REVIEW]: "border-l-blue-500",
    [TaskStatus.DONE]: "border-l-emerald-500"
}

export const EventCard = ({ title, assignee, id, status }: EventCardProps) => {
    const workspaceId = useWorkspaceId()
    const router = useRouter()
    const onCLick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        router.push(`/workspaces/${workspaceId}/tasks/${id}`)
    }

    return (
        <div className="px-2">
            <div onClick={onCLick} className={cn(
                "p-1.5 text-xs bg-white text-primary border rounded-md border-l-8 flex flex-col gap-y-2 cursor-pointer hover:opacity-75 transition",
                statusColorMap[status]
            )}>
                <p>{title}</p>
                <div className="flex items-center gap-x-1">
                    <MemberAvatar
                        name={assignee?.name}
                    />
                </div>
            </div>
        </div>
    )
}