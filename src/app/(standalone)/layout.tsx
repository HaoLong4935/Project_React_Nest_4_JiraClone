import UserButton from "@/components/user-button"
import Image from "next/image"
import Link from "next/link"

interface StandAloneLayout {
    children: React.ReactNode
}

const StandAloneLayout = ({ children }: StandAloneLayout) => {
    return (
        <main className="bg-neutral-100 min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center h-[73px]">
                    <Link href="/">
                        <Image src="/logo.svg" width={152} height={56} alt="Logo web" />
                    </Link>
                    <UserButton />
                </nav>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
                {children}
            </div>
        </main>
    )
}

export default StandAloneLayout