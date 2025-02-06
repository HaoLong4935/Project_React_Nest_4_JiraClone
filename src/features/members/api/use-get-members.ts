import { client } from '@/lib/rpc';
import { useQuery } from "@tanstack/react-query"

interface UseGetMembersProps {
    workspaceId: string
}

export const useGetWMembers = ({ workspaceId }: UseGetMembersProps) => {
    const query = useQuery({
        //Cần phải thêm tham số workspaceId để tự động invalidate và refetch khi workspaceId thay đổi 
        queryKey: ["members", workspaceId],
        queryFn: async () => {
            const response = await client.api.members.$get({ query: { workspaceId } })
            if (!response.ok) {
                throw new Error("Failed to fetch members")
            }
            const { data } = await response.json()
            return data
        }
    })
    return query
}