import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export function NamoraDialog({
  open,
  children,
  closeDialog,
}: {
  open: boolean;
  children: JSX.Element;
  closeDialog: () => void;
}) {
  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-10" />
          </Transition.Child>

          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-0 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-0 sm:translate-y-0 sm:scale-95"
            >
              <div className="fixed inset-0 flex items-start justify-center p-4 top-32">
                <Dialog.Panel className="w-full max-w-4xl p-4 overflow-visible text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                  {children}
                </Dialog.Panel>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
