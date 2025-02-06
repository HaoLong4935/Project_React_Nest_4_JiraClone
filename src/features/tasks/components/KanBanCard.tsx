import { MemberAvatar } from "@/app/(standalone)/workspaces/[workspaceId]/members/components/members-avatar";
import { DottedSeparator } from "@/components/dotted-separator";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MoreHorizontal } from "lucide-react";
import { Task } from "../types";
import { TaskActions } from "./task-actions";
import { TaskDate } from "./task-date";

interface KanBanCardProps {
    task: Task
}

export const KanBanCard = ({ task }: KanBanCardProps) => {
    return (
        <div className="bg-white p-2.5 mb-1.5 rounded shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-x-2">
                <p>{task.name}</p>
                <TaskActions id={task.$id} projectId={task.projectId}>
                    <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition" />
                </TaskActions>
            </div>
            <DottedSeparator />
            <div className="flex items-center gap-x-1.5">
                <MemberAvatar
                    //task.assignee.name mặc dù không có trong type nhưng ở trong 
                    //Backend server khi get single member ta có populate và kèm theo data của 
                    //Assignee và project nên có thể truy cập tới mà không bị typescript báo lỗi 
                    name={task.assignee.name}
                    fallbackClassName="text-[10px]"
                />
                <div className="size-1 rounded-full bg-neutral-300" />
                <TaskDate value={task.dueDate} className="text-xs" />
            </div>
            <div className="flex items-center gap-x-1.5">
                <ProjectAvatar
                    name={task.project.name}
                    image={task.project.imageUrl}
                    fallbackClassName="text-[10px]"
                />
                <span className="text-xs font-medium">{task.project.name}</span>
            </div>
        </div>
    )
}