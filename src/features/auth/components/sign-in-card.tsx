"use client"

import { DottedSeparator } from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { Input } from "@/components/ui/input"
import { FaGithub } from "react-icons/fa"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import Link from "next/link"
import { loginSchema } from "../schema"
import { useLogin } from "../api/use-login"
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth"

export const SignInCard = () => {
    const { mutate, isPending } = useLogin()
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = (values: z.infer<typeof loginSchema>) => {
        console.log("Submit values:", values);
        mutate({ json: values })
    }

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Welcomback
                </CardTitle>
            </CardHeader>
            <div className="mb-2 px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            disabled={isPending}
                                            placeholder="Enter your email"
                                            autoComplete=""
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            disabled={isPending}
                                            placeholder="Enter your password"
                                            autoComplete=""
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending} size="lg" className="w-full">Login</Button>
                    </form>
                </Form>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button
                    onClick={() => signUpWithGoogle()}
                    variant="secondary" disabled={isPending} size="lg" className="w-full">
                    <FcGoogle className="mr-2 size-5" /> Login with google
                </Button>
                <Button
                    onClick={() => signUpWithGithub()}
                    variant="secondary" disabled={isPending} size="lg" className="w-full">
                    <FaGithub className="mr-2 size-5" /> Login with Github
                </Button>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7 flex items-center justify-center">
                <p>
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up">
                        <span className="text-blue-700">Sign Up</span>
                    </Link>
                </p>
            </CardContent>
        </Card>
    )
}