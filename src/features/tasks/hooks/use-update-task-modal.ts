import { useQueryState, parseAsString } from "nuqs"

export const useEditTaskModal = () => {
    const [taskId, setTaskId] = useQueryState(
        "edit-task", parseAsString,
    )
    const open = (id: string) => setTaskId(id)
    const close = () => setTaskId(null)

    return {
        taskId,
        open,
        close,
        //Truyền luôn state setIsOpen vào để cho linh hoạt hơn
        //Sẽ có những trường hợp mà ta gọi setIsOpen để thay đổi state chứ không cần gọi qua close , open
        setTaskId
    }
}
