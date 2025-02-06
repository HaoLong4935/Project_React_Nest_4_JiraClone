import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from "hono"
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$patch"], 200>
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$patch"]>

export const useUpdateMember = (workspaceId: string) => {
    const queryClient = useQueryClient()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.members[":memberId"]["$patch"]({ param, json })
            if (!response.ok) {
                throw new Error("API Update member request failed");
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Member Updated")
            queryClient.invalidateQueries({ queryKey: ["members", workspaceId] })
        },
        onError: () => {
            toast.error("Update Member failed")
        }
    });
    return mutation;
}