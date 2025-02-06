import { getCurrent } from "@/features/auth/queries"
import { redirect } from "next/navigation"
import { WorkspaceIdSettingClient } from "./client"
//Chung ta da co hook de lay workspaceID la useWorkspaceId
//Nhung neu dung hook do thi phai khai bao la "use client"
//Con neu muon dung cho servercomponent thi can khai bao doi tuong rieng 
//Va truy cap vao doi tuong do 

const WorkspaceIdSettingsPage = async () => {
    const user = await getCurrent()
    if (!user) { redirect("/sign-in") }

    return <WorkspaceIdSettingClient />
}

export default WorkspaceIdSettingsPage