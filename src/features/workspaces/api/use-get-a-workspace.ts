import { client } from '@/lib/rpc';
import { useQuery } from "@tanstack/react-query"

interface UseGetSingleWorkspaceProps {
    workspaceId: string
}

export const useGetSingleWorkspace = ({ workspaceId }: UseGetSingleWorkspaceProps) => {
    const query = useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: async () => {
            const response = await client.api.workspaces[":workspaceId"].$get({
                param: { workspaceId }
            })
            if (!response.ok) {
                throw new Error("Failed to get workspaces")
            }
            const { data } = await response.json()
            return data
        }
    })
    return query
}