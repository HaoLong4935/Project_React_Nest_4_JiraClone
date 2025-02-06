import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from "hono"
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$delete"], 200>
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$delete"]>

export const useDeleteMember = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.members[":memberId"]["$delete"]({ param })

            if (!response.ok) {
                throw new Error("API delete member request failed");
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Member deleted")
            queryClient.invalidateQueries({ queryKey: ["members"] })
        },
        onError: () => {
            toast.error("Delete Member failed")
        }
    });
    return mutation;
}