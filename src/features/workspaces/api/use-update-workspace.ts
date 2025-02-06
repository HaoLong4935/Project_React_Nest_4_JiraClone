import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from "hono"
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200> //Can phai them so 200 
//Vi neu thieu so 200 , khi chay api co the trả về là undefined || có data || hoặc là bị lỗi 
//Nếu thiếu 200 typescript sẽ báo lỗi khi ta desctructure biến data ở function onSuccess (Vì typescript biết có thể 
//Dữ liệu trả về sẽ không chắc là có data thành công hay là error hay là undefined 
//Nên định nghĩa thêm con số 200 là chắc chắn với typescript rằng api sẽ trả về có data 

type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$patch"]>

export const useUpdateWorkspace = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ form, param }) => {
            const response = await client.api.workspaces[":workspaceId"]["$patch"]({ form, param })

            if (!response.ok) {
                throw new Error("API Update request failed");
            }
            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success("Workspace Updated Success")
            queryClient.invalidateQueries({ queryKey: ["workspaces"] })
            queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] })
        },
        onError: () => {
            toast.error("Workspace Updated failed")
        }
    });
    return mutation;
}