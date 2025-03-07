import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from "hono"
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.workspaces["$post"], 200>
type RequestType = InferRequestType<typeof client.api.workspaces["$post"]>

export const useCreateWorkspace = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ form }) => {
            const response = await client.api.workspaces["$post"]({ form })

            if (!response.ok) {
                throw new Error("API request failed");
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Workspace created")
            router.refresh()
            queryClient.invalidateQueries({ queryKey: ["workspaces"] })
        },
        onError: () => {
            toast.error("Create workspace failed")
        }
    });
    return mutation;
}