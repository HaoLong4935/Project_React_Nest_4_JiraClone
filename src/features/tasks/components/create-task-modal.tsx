"use client"

import React from 'react';
import { useCreateTaskModal } from '../hooks/use-create-task-modal'
import { ResponsiveModal } from "../../../components/responsive-modal"
import { CreateTaskFormWrapper } from './create-task-form-wrapper';
export const CreateTaskModal = () => {
    const { isOpen, setIsOpen, close } = useCreateTaskModal()

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
            <CreateTaskFormWrapper onCancle={close} />
        </ResponsiveModal>
    )
}