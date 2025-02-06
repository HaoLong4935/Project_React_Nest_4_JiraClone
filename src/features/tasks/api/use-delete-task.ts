import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from "hono"
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"], 200>
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>

export const useDeleteTask = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.tasks[":taskId"]["$delete"]({ param })

            if (!response.ok) {
                throw new Error("API request failed to delete Task");
            }
            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success("Task deleted")
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            queryClient.invalidateQueries({ queryKey: ["task", data.$id] })
        },
        onError: () => {
            toast.error("Delete Task failed")
        }
    });
    return mutation;
}