import { useParams } from "next/navigation"

export const useWorkspaceId = () => {
    const params = useParams()
    //Cai bien workspaceId can phai giong exactly giong nhu ten folder [workspaceId]
    return params.workspaceId as string
}