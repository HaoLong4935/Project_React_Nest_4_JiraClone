import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from "hono"
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>

type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>

export const useLogin = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.login["$post"]({ json })

            if (!response.ok) {
                throw new Error("Log in failed");
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Logged in")
            router.refresh()
            queryClient.invalidateQueries({ queryKey: ["current"] })
        },
        onError: () => {
            toast.error("Failed to log in")
        }
    });
    return mutation;
}


//Truong hop khi truyen vao mutate co tham so params cua url

// type ResponseType = InferResponseType<typeof client.api.auth.login[":userId"]["$post"]>
// type RequestType = InferRequestType<typeof client.api.auth.login[":userId"]["$post"]>
// // type RequestType = InferRequestType<typeof client.api.auth.login[":userId"]["$post"]>["json"]
// //Neu co them ["json"] nghia la trong request chi lay du lieu  email: string; password: string; , se khong lay params userId
// //Gay loi nen chi can bo di ["json"] thi se lay lun ca params

// export const useLogin = () => {
//     const mutation = useMutation<ResponseType, Error, RequestType>({
//         mutationFn: async ({ json, param }) => {
//             const response = await client.api.auth.login[":userId"]["$post"]({ json, param })
//             return await response.json()
//         }
//     });
//     return mutation;
// }