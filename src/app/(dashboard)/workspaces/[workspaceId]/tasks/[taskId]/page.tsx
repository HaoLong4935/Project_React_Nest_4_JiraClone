import { getCurrent } from "@/features/auth/queries"
import { redirect } from "next/navigation"
import { TaskIdClinet } from "./client"

const TaskIdPage = async () => {
    const user = await getCurrent()
    if (!user) redirect("/sign-in")

    return (
        <TaskIdClinet />
    )
}

export default TaskIdPage