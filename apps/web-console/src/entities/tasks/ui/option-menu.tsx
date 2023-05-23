import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import React, { Fragment, useRef, useState } from "react";
import { usePopper } from "react-popper";
import { Portal } from "react-portal";

export const OptionMenu = ({ children }: any) => {
  const popperElRef = useRef(null);
  const [targetElement, setTargetElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [40, -45],
        },
      },
    ],
  });

  return (
    <div className="flex items-center gap-x-6">
      <Menu as="div" className="relative flex-none">
        {({ open }) => (
          <>
            <div className="relative" ref={setTargetElement}>
              <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                <EllipsisVerticalIcon className="w-5 h-5" aria-hidden="true" />
              </Menu.Button>
            </div>
            <Portal>
              <div
                ref={popperElRef}
                style={styles.popper}
                {...attributes.popper}
                className="z-10"
              >
                <Transition
                  as={Fragment}
                  show={open}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                  beforeEnter={() => setPopperElement(popperElRef.current)}
                  afterLeave={() => setPopperElement(null)}
                >
                  <Menu.Items className="absolute z-10 w-32 p-1 mt-2 origin-top-right bg-white rounded-md shadow-lg right-10 ring-1 ring-gray-900/5 focus:outline-none -top-5">
                    {children}
                  </Menu.Items>
                </Transition>
              </div>
            </Portal>
          </>
        )}
      </Menu>
    </div>
  );
};
