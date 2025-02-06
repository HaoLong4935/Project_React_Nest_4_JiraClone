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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeftIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { updateProjectSchema } from "../schemas"
import { useConfirm } from "@/hooks/use-confirm";
import { useUpdateProject } from "../api/use-update-project";
import { Project } from "../types";
import { useDeleteProject } from "../api/use-delete-project";

interface EditProjectFormProps {
    onCancle?: () => void,
    initialValues: Project
}

export const EditProjectForm = ({ onCancle, initialValues }: EditProjectFormProps) => {
    const router = useRouter()
    const { mutate, isPending } = useUpdateProject()
    const { mutate: deleteProject, isPending: isDeletingProject } = useDeleteProject()

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete project",
        "This action cannot be undone",
        "destructive"
    )

    const inputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? ""
        }
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file)
        }
    }

    const handleDetele = async () => {
        const ok = await confirmDelete()
        if (!ok) {
            return;
        }
        deleteProject(
            {
                param: { projectId: initialValues.$id },
            },
            {
                onSuccess: () => {
                    window.location.href = `/workspaces/${initialValues.workspaceId}`
                }
            }
        )
    }

    const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        }
        mutate(
            { form: finalValues, param: { projectId: initialValues.$id } },
            // {
            //     onSuccess: () => {
            //         form.reset(finalValues)
            //     }
            // }
        );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center p-7 gap-x-4 space-y-0">
                    <Button variant="secondary" size="sm" onClick={onCancle ? onCancle : () => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`)}>
                        <ArrowLeftIcon />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
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
                                                    placeholder="Enter project name" />
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
                                                        )
                                                    }
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
                                    Save changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Deleting a project is irreverseible and will remove all associated data
                        </p>
                        <DottedSeparator classname="py-7" />
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending || isDeletingProject}
                            onClick={handleDetele}
                        >
                            Delete project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}