"use client";
import { useRef } from "react"
import { DottedSeparator } from "@/components/dotted-separator"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCreateProject } from "../api/use-create-project";
import { createProjectSchema } from "../schemas"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/hooks/use-workspace-id";

interface CreateProjecteFormProps {
    onCancle?: () => void
}

export const CreateProjectForm = ({ onCancle }: CreateProjecteFormProps) => {
    const workspaceId = useWorkspaceId()
    const router = useRouter()
    const { mutate, isPending } = useCreateProject()
    const inputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof createProjectSchema>>({
        resolver: zodResolver(createProjectSchema.omit({ workspaceId: true })),
        defaultValues: {
            name: ""
        }
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file)
        }
    }

    const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
        const finalValues = {
            ...values,
            workspaceId,
            image: values.image instanceof File ? values.image : "",
        }
        mutate(
            { form: finalValues },
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onSuccess: ({ data }: any) => {
                    form.reset()
                    router.push(`/workspaces/${workspaceId}/projects/${data.$id}`)
                }
            });
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create new project
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Project name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter workspace name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <div className="flex flex-col gap-y-2">
                                        <div className="flex items-center gap-x-5">
                                            {field.value ?
                                                (
                                                    <div className="size-[72px] relative rounded-md overflow-hidden">
                                                        {/* Can phai co relative neu khong thi fill se khong hoat dong dung */}
                                                        <Image
                                                            className="object-cover"
                                                            fill
                                                            src={field.value instanceof File ? URL.createObjectURL(field.value) : field.value} alt="Image Avatar" />
                                                    </div>
                                                )
                                                :
                                                (
                                                    <Avatar className="size-[72px]">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-[36px] text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )
                                            }
                                            <div className="flex flex-col">
                                                <p className="text-sm">Project Icon</p>
                                                <p className="text-sm text-muted-foreground">JPG, PNG SVG or JPEG - max 1MB</p>
                                                <input
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    className="hidden" accept=".jpg, .png, .jpeg, .svg"
                                                    ref={inputRef} disabled={isPending}
                                                />
                                                {field.value ?
                                                    (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="destructive"
                                                            size="xs"
                                                            className="w-fit mt-2"
                                                            onClick={() => {
                                                                field.onChange(null)
                                                                if (inputRef.current) {
                                                                    inputRef.current.value = ""
                                                                }
                                                            }}
                                                        >Remove image</Button>
                                                    )
                                                    :
                                                    (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="teritary"
                                                            size="xs"
                                                            className="w-fit mt-2"
                                                            onClick={() => inputRef.current?.click()}
                                                        >Upload image</Button>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                        <DottedSeparator classname="py-7" />
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="lg"
                                variant="secondary"
                                onClick={onCancle}
                                disabled={isPending}
                                // Neu nhu onCancle khong ton tai trong tag nay thi se giau nut cancle di
                                className={cn(!onCancle && "invisible")}

                            >
                                Cancle
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isPending}
                            >
                                Create Project
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}