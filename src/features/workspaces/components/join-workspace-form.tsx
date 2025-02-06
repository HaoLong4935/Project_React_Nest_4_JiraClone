"use client"

import { DottedSeparator } from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useInviteCode } from "@/features/hooks/use-incvite-code"
import { useWorkspaceId } from "@/features/hooks/use-workspace-id"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useJoinWorkspace } from "../api/use-join-workspace"

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string
    }
}


export const JoinWorkspaceForm = ({ initialValues }: JoinWorkspaceFormProps) => {
    const router = useRouter()
    const inviteCode = useInviteCode()
    const workspaceId = useWorkspaceId()
    const { mutate, isPending } = useJoinWorkspace()

    const onSubmit = () => {
        mutate({
            param: { workspaceId },
            json: { inviteCode }
        },
            {
                onSuccess: ({ data }) => {
                    router.push(`/workspaces/${data.$id}`)
                }
            })
    }
    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">
                    Join Workspace
                </CardTitle>
                <CardDescription>
                    You&apos;ve been invited to join <strong>{initialValues.name}</strong>
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <div className="flex flex-col lg:flex-row gap-y-2 gap-x-2 items-center justify-between">
                    <Button variant="secondary" size="lg" type="button" asChild className="w-full lg:w-fit">
                        <Link href="/">
                            Cancel
                        </Link>
                    </Button>
                    <Button onClick={onSubmit} disabled={isPending} className="w-full lg:w-fit" size="lg" type="button" >
                        Join Workspaces
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}