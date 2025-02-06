import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProjectAvatarProps {
    image?: string;
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export const ProjectAvatar = ({ image, name, className, fallbackClassName }: ProjectAvatarProps) => {
    if (image) {
        return (
            //Dung cn de css mac dinh , con neu nguoi dung muon custom them thi 
            //Se lay gia tri truyen vao la bien className va gan vao
            <div className={cn("size-6 relative rounded-md overflow-hidden", className)}>
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
        )
    }

    return (
        <Avatar className={cn("size-6 rounded-md", className)}>
            <AvatarFallback className={cn("text-white bg-blue-600 font-semibold text-sm uppercase rounded-md", fallbackClassName)}>
                {name[0]}
            </AvatarFallback>
        </Avatar >
    )
}   