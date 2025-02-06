import { useQueryState, parseAsBoolean } from "nuqs"

export const useCreateWorkspaceModal = () => {
    const [isOpen, setIsOpen] = useQueryState(
        "create-workspace", parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
    )
    const open = () => setIsOpen(true)
    const close = () => setIsOpen(false)

    return {
        isOpen,
        open,
        close,
        //Truyền luôn state setIsOpen vào để cho linh hoạt hơn
        //Sẽ có những trường hợp mà ta gọi setIsOpen để thay đổi state chứ không cần gọi qua close , open
        setIsOpen
    }
}
