import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-project-analytics";
import { AnalyticsCard } from "./analytics-card";
import { DottedSeparator } from "./dotted-separator";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export const Analytics = ({ data }: ProjectAnalyticsResponseType) => {
    return (
        <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
            <div className="w-full flex flex-row">
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Total Cards"
                        value={data.thisMonthTaskCount}
                        variant={data.taskDifferent > 0 ? "up" : "down"}
                        increaseValue={data.taskDifferent}
                    />
                    <DottedSeparator direction="vertical" />
                </div>
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Assigned Tasks"
                        value={data.thisMonthAssignedTaskCount}
                        variant={data.assignedTaskDifferent > 0 ? "up" : "down"}
                        increaseValue={data.assignedTaskDifferent}
                    />
                    <DottedSeparator direction="vertical" />
                </div>
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Completed Tasks"
                        value={data.thisMonthCompletedTaskCount}
                        variant={data.completedTaskDifferent > 0 ? "up" : "down"}
                        increaseValue={data.completedTaskDifferent}
                    />
                    <DottedSeparator direction="vertical" />
                </div>
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Overdue Tasks"
                        value={data.thisMonthOverdueTaskCount}
                        variant={data.overdueTaskDifferent > 0 ? "up" : "down"}
                        increaseValue={data.overdueTaskDifferent}
                    />
                    <DottedSeparator direction="vertical" />
                </div>
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Incomplete Tasks"
                        value={data.thisMonthIncompleteTaskCount}
                        variant={data.InCompletTaskDifferent > 0 ? "up" : "down"}
                        increaseValue={data.InCompletTaskDifferent}
                    />
                    <DottedSeparator direction="vertical" />
                </div>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}