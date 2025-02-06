import { MemberAvatar } from "@/app/(standalone)/workspaces/[workspaceId]/members/components/members-avatar";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { snakeCaseTitleCase } from "@/lib/utils";
import { PencilIcon } from "lucide-react";
import { useEditTaskModal } from "../hooks/use-update-task-modal";
import { Task } from "../types";
import { OverViewProperty } from "./overview-property";
import { TaskDate } from "./task-date";

interface TaskOverviewProps {
    task: Task,
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
    const { open } = useEditTaskModal()
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">Overview</p>
                    <Button size="sm" variant="secondary" onClick={() => open(task.$id)}>
                        <PencilIcon className="size-4 mr-2" />
                        Edit
                    </Button>
                </div>
                <DottedSeparator classname="my-3" />
                <div className="flex flex-col gap-y-4">
                    <OverViewProperty label="Assignee" >
                        <MemberAvatar
                            name={task.assignee.name}
                            className="size-6"
                        />
                        <p className="text-sm font-medium">{task.assignee.name}</p>
                    </OverViewProperty>
                    <OverViewProperty label="Due Date">
                        <TaskDate value={task.dueDate} className="text-sm font-medium" />
                    </OverViewProperty>
                    <OverViewProperty label="Status">
                        <Badge variant={task.status}>
                            {snakeCaseTitleCase(task.status)}
                        </Badge>
                    </OverViewProperty>
                </div>
            </div>
        </div>
    )
}