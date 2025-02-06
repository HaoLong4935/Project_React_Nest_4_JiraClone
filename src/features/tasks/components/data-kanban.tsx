import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"
import { useCallback, useEffect, useState } from "react"
import { Task, TaskStatus } from "../types"
import { KanBanCard } from "./KanBanCard"
import { KanbanColumnHeader } from "./KanbanColumnHeader"

interface DataKanBanProps {
    data: Task[],
    onChange: (task: { $id: string, status: TaskStatus, position: number }[]) => void
}

// Dinh nghia cac columns cua table
const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE
]

type TasksState = {
    [key in TaskStatus]: Task[]
}

export const DataKanban = ({ data, onChange }: DataKanBanProps) => {
    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        }

        // Push the right task to the right type
        data.forEach((task) => {
            initialTasks[task.status].push(task)
        })

        // Sort
        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        })

        return initialTasks
    })

    useEffect(() => {
        const newTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        }

        // Push the right task to the right type
        data.forEach((task) => {
            newTasks[task.status].push(task)
        })

        // Sort
        Object.keys(newTasks).forEach((status) => {
            newTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        })

        setTasks(newTasks)
        console.log("Task data la: ", newTasks);

    }, [data])

    const onDragEnd = useCallback((result: DropResult) => {
        // Nếu kéo ra vùng nào không hợp lệ thì không làm gì hết
        if (!result.destination) return

        // Trích xuất thông tin từ biến result do thư viện cung cấp 
        // Source là cột nguồn , destination là cột đến 
        const { source, destination } = result;
        // Ép kiểu các id của nơi bắt đầu và nơi được kéo đến là kiểu enum của TaskStatus
        const sourceStatus = source.droppableId as TaskStatus
        const destStatus = destination.droppableId as TaskStatus

        // Tạo một mảng để chứa danh sách task sau khi được điều chỉnh vị trị mới 
        let updatesPayload: { $id: string, status: TaskStatus, position: number }[] = [];

        setTasks((prevTasks) => {
            const newTasks = { ...prevTasks }

            // Safely remove the task from the source column
            const sourceColumn = [...newTasks[sourceStatus]]
            // splice trả về một mảng chứa phần tử đã bị cắt, vì vậy bạn dùng cú pháp [movedTask] để lấy phần tử đầu tiên trong mảng đó.
            const [movedTask] = sourceColumn.splice(source.index, 1)
            // If theres no moved task (shouldn't happen, but just in case), return the previous state
            if (!movedTask) {
                console.log("No task founde at the source index");
                return prevTasks
            }
            // Create a new task object with potentially updated status
            // Nếu phát hiện cột status bắt nguồn khác với status của cột đích được thả 
            // Thì tiến hành ghi đề lại thông tin status mới cho phần tử đó 
            const updatedMovedTask = sourceStatus !== destStatus ? { ...movedTask, status: destStatus } : movedTask

            // Update the source column 
            newTasks[sourceStatus] = sourceColumn

            // Add the tsask to the destination column
            const destColumn = [...newTasks[destStatus]]
            destColumn.splice(destination.index, 0, updatedMovedTask)
            newTasks[destStatus] = destColumn

            // Prepare the minimal update payloads
            updatesPayload = []

            // Always update the moved task
            updatesPayload.push({
                $id: updatedMovedTask.$id,
                status: destStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            })

            // Update positions for affected tasks in the destination column 
            newTasks[destStatus].forEach((task, index) => {
                if (task && task.$id !== updatedMovedTask.$id) {
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                    if (task.position !== newPosition) {
                        updatesPayload.push({
                            $id: task.$id,
                            status: destStatus,
                            position: newPosition
                        })
                    }
                }
            })
            // If the task moved between columns, update positions in the source column 
            // Logic drag rất phức tạp: Mỗi lần kéo một task vào một column khác,
            // Task ở cột được kéo qua task khác nhưng không làm thay đổi vị trí ở cột đó thì không nói 
            // Chứ nếu kéo task nhưng cũng làm thay đổi các task ở cột đó , và khi kéo qua cột mới , các task 
            // Ở đó cũng bị thay đổi thì ta cần phải update lại cho cả 2 cột 
            if (sourceStatus !== destStatus) {
                newTasks[sourceStatus].forEach((task, index) => {
                    if (task) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                        if (task.position !== newPosition) {
                            updatesPayload.push({
                                $id: task.$id,
                                status: sourceStatus,
                                position: newPosition,
                            })
                        }
                    }
                })
            }
            // Lưu ý là ta đang dùng setTask , sau khi thực thi tất cả các logic trên 
            // Ta cần phải return danh sách những task đã được update lại 
            // Để setTask có thể ghi lại dữ liệu mới cho state
            return newTasks
        })

        onChange(updatesPayload)
    }, [onChange])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader
                                board={board}
                                taskCount={tasks[board].length}
                            />
                            <Droppable droppableId={board}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[200px] py-1.5">
                                        {tasks[board].map((task, index) => (
                                            <Draggable
                                                key={task.$id}
                                                draggableId={task.$id}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <KanBanCard task={task} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    )
}