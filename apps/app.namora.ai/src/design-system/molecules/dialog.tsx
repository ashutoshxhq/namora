import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import tw from "tailwind-styled-components";

import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export const StyledDialog = tw(Dialog)`
  relative z-10
`;
export const StyledDialogPanel = tw(Dialog.Panel)`
  relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6
`;
export const StyledDialogTitleBox = tw(Dialog.Title)`
  text-base font-semibold leading-6 text-gray-900
`;

export const StyledDialogBoxHidden = tw.div`
  fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75
`;
export const StyledDialogBox = tw.div`
  fixed inset-0 z-10 overflow-y-auto
`;
export const StyledDialogFlexBox = tw.div`
  flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0
`;
export const StyledDialogAbsoluteBox = tw.div`
  absolute top-0 right-0 hidden pt-4 pr-4 sm:block
`;
export const StyledDialogFlexSmallBox = tw.div`
  sm:flex sm:items-start
`;
export const StyledDialogIconBox = tw.div`
  flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10
`;
export const StyledDialogText = tw.p`
  text-sm text-gray-500
`;
export const StyledDialogCloseButton = tw.button`
  text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
`;
export const StyledDialogCloseButtonBox = tw.div`
  sr-only
`;
export const StyledDialogTitleSection = tw.div`
  mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left  
`;
export const StyledDialogButtonGroup = tw.div`
  mt-5 sm:mt-4 sm:flex sm:flex-row-reverse
`;
export const StyledDialogPrimaryButton = tw.button`
  inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-md shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto
`;
export const StyledDialogSecondaryButton = tw.button`
inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto

`;
export function NamoraDialog() {
  const [open, setOpen] = useState(true);

  return (
    <Transition.Root show={open} as={Fragment}>
      <StyledDialog as="div" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <StyledDialogBoxHidden />
        </Transition.Child>

        <StyledDialogBox>
          <StyledDialogFlexBox>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <StyledDialogPanel>
                <StyledDialogAbsoluteBox>
                  <StyledDialogCloseButton
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    <StyledDialogCloseButtonBox>
                      Close
                    </StyledDialogCloseButtonBox>
                    <XMarkIcon className="flex w-6" aria-hidden="true" />
                  </StyledDialogCloseButton>
                </StyledDialogAbsoluteBox>
                <StyledDialogFlexSmallBox>
                  <StyledDialogIconBox>
                    <ExclamationTriangleIcon
                      className="w-6 h-6 text-red-600"
                      aria-hidden="true"
                    />
                  </StyledDialogIconBox>
                  <StyledDialogTitleSection>
                    <StyledDialogTitleBox as="h3">
                      Deactivate account
                    </StyledDialogTitleBox>
                    <StyledDialogText>
                      Are you sure you want to deactivate your account? All of
                      your data will be permanently removed from our servers
                      forever. This action cannot be undone.
                    </StyledDialogText>
                  </StyledDialogTitleSection>
                </StyledDialogFlexSmallBox>
                <StyledDialogButtonGroup>
                  <StyledDialogPrimaryButton
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Deactivate
                  </StyledDialogPrimaryButton>
                  <StyledDialogSecondaryButton
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </StyledDialogSecondaryButton>
                </StyledDialogButtonGroup>
              </StyledDialogPanel>
            </Transition.Child>
          </StyledDialogFlexBox>
        </StyledDialogBox>
      </StyledDialog>
    </Transition.Root>
  );
}
