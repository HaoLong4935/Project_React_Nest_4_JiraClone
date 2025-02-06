import { client } from '@/lib/rpc';
import { useQuery } from "@tanstack/react-query"

interface UseGetSingleWorkspaceInfoProps {
    workspaceId: string
}

export const useGetSingleWorkspaceInfo = ({ workspaceId }: UseGetSingleWorkspaceInfoProps) => {
    const query = useQuery({
        queryKey: ["workspace-info", workspaceId],
        queryFn: async () => {
            const response = await client.api.workspaces[":workspaceId"].$get({
                param: { workspaceId }
            })
            if (!response.ok) {
                throw new Error("Failed to get workspace Info")
            }
            const { data } = await response.json()
            return data
        }
    })
    return query
}