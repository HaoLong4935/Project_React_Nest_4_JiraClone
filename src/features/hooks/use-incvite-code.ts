import { useParams } from "next/navigation"

export const useInviteCode = () => {
    const params = useParams()
    //Cai bien workspaceId can phai giong exactly giong nhu ten folder [workspaceId]
    return params.inviteCode as string
}