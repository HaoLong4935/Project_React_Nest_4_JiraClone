"use client"
import { MemberAvatar } from "@/app/(standalone)/workspaces/[workspaceId]/members/components/members-avatar"
import { DottedSeparator } from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useWorkspaceId } from "@/features/hooks/use-workspace-id"
import { useDeleteMember } from "@/features/members/api/use-delete-member"
import { useGetWMembers } from "@/features/members/api/use-get-members"
import { useUpdateMember } from "@/features/members/api/use-update-member"
import { MemberRole } from "@/features/members/types"
import { useConfirm } from "@/hooks/use-confirm"
import { ArrowLeft, MoreVerticalIcon } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react"

export const MemberList = () => {
    const workspaceId = useWorkspaceId()
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove this member",
        "This member will be remove from the workspace",
        "destructive"
    )
    const { data } = useGetWMembers({ workspaceId })
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember(workspaceId)
    const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember()

    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        updateMember({
            param: { memberId },
            json: { role },
        })
    }

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirm()
        if (!ok) return;
        deleteMember(
            {
                param: { memberId }
            },
            {
                onSuccess: () => {
                    window.location.reload()
                }
            })
    }


    return (
        <Card className="w-full h-full border-none shadow-none">
            <ConfirmDialog />
            <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                <Button asChild variant="secondary" size="sm">
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeft className="size-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <CardTitle className="text-xl font-bold">
                    Members list
                </CardTitle>
            </CardHeader>

            <div className="px-7">
                <DottedSeparator />
            </div>

            <CardContent className="p-7">
                {data?.documents.map((member, index) => {
                    return (
                        <Fragment key={member.$id}>
                            <div className="flex items-center gap-2">
                                <MemberAvatar
                                    className="size-10"
                                    fallbackClassName="text-lg"
                                    name={member.name} />
                                <div className="flex flex-col">
                                    {/* <div className="flex flex-row gap-x-3"> */}
                                    {/* {member.role === MemberRole.ADMIN ? <Badge className="bg-green-400">Admin</Badge> : <Badge className="bg-blue-300">Guest</Badge>} */}
                                    <p className="text-sm font-medium">{member.name}</p>
                                    {/* </div> */}
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="ml-auto" variant="secondary" size="icon">
                                            <MoreVerticalIcon className="size-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="bottom" align="end">
                                        <DropdownMenuItem
                                            className="font-medium "
                                            onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
                                            disabled={isUpdatingMember}>
                                            Set as Administrator
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="font-medium "
                                            onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)}
                                            disabled={isUpdatingMember}>
                                            Set as Member
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="font-medium text-amber-700"
                                            onClick={() => handleDeleteMember(member.$id)}
                                            disabled={isDeletingMember}>
                                            Remove member {member.name}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {index < data.documents.length - 1 && (
                                <Separator className="my-2.5 bg-neutral-100" />
                            )}
                        </Fragment>
                    )
                }
                )
                }
            </CardContent>
        </Card>
    )
} 