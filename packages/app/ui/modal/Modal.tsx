"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, RefObject } from "react";
import { cva } from "class-variance-authority";

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  close: () => void;
  width?: "full" | "dialog";
  initialFocusRef?: RefObject<HTMLButtonElement | HTMLInputElement>;
}

export const dialogPanelStyles = cva(
  [
    "max-w-md",
    "overflow-hidden text-left align-middle  ",
    "bg-white shadow-xl rounded-2xl",
    "transition-all transform ",
  ],
  {
    variants: {
      width: {
        full: "w-full",
        dialog: " w-[420px]",
      },
    },
    defaultVariants: {
      width: "full",
    },
  }
);

export function Modal({
  isOpen,
  close,
  width,
  children,
  initialFocusRef,
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10 shadow-xl"
        onClose={close}
        initialFocus={initialFocusRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={dialogPanelStyles({ width })}>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
