import { Fragment, useState, useMemo } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { classNames } from "@/utils";
import { NamoraPanel } from "@/design-system/molecules";
import { getAllFirstChars } from "@/utils/string";
import { TTeamMember } from "@/current-team/types";

const schema = yup.object().shape({
  first_name: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
  last_name: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
  email: yup.string().email().required("Required"),
  username: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

export const TeamMembers = (props: any) => {
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>({});

  const teamMembers = props?.data ?? [];

  const [showAlert, setShowAlert] = useState(false);
  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        username: "",
      },
      resolver: yupResolver(schema),
    }),
    []
  );
  const hookFormProps = useForm(useFormObj);

  const onFormSubmit: SubmitHandler<any> = (submittedFormData) => {
    handleClickOnSendMessage(submittedFormData);
  };
  const handleClickOnSendMessage = (submittedFormData: any) => {
    // let data = JSON.stringify({
    //   Data: {
    //     message_from: "USER",
    //     message_to: "AI",
    //     message: submittedFormData.message,
    //   },
    // });
    // const encoder = new TextEncoder();
    // const binaryData = encoder.encode(data);
    // web_socket.send(binaryData.buffer)
    setShowAlert(true);
  };

  const handleClickOnEdit = (id: string) => {
    setOpen(true);
    const selectedMember = teamMembers?.find(
      (person: TTeamMember) => person.id === id
    );
    setSelectedMember(selectedMember);
  };

  const panelProps = {
    open,
    data: selectedMember,
    setOpen,
  };

  const totalMembers = teamMembers.length;
  return (
    <div className="overflow-auto h-[calc(100vh - theme(space.20))] overflow-hidden bg-white shadow rounded-md my-3 mb-11 ">
      <div className="p-3 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          {`Members (${totalMembers}) `}
        </h3>
        <div className="mt-3 sm:ml-4 sm:mt-0">
          {/* <button
            type="button"
            className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Invite Members
          </button> */}
        </div>
      </div>
      <ul role="list" className="divide-y divide-gray-100">
        {teamMembers.map((person: TTeamMember) => {
          const name = `${person.firstname} ${person.lastname ?? ""}`;
          return (
            <li
              key={person.id}
              className="z-0 flex items-center justify-between px-4 py-5 sm:px-6 gap-x-6"
            >
              <div className="flex gap-x-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-500 rounded-full">
                  <span className="text-sm font-medium leading-none text-white">
                    {getAllFirstChars(name)}
                  </span>
                </span>
                <div className="flex-auto min-w-0">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    <a href="#" className="hover:underline">
                      {name}
                    </a>
                  </p>
                  <p className="flex mt-1 text-xs leading-5 text-gray-500">
                    <a
                      href={`mailto:${person.email}`}
                      className="truncate hover:underline"
                    >
                      {person.email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-x-6">
                <div className="hidden sm:flex sm:flex-col sm:items-end"></div>
                <Menu as="div" className="relative flex-none">
                  <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                    <span className="sr-only">Open options</span>
                    <EllipsisVerticalIcon
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute z-10 w-32 py-2 mt-2 origin-top-right bg-white rounded-md shadow-lg right-10 ring-1 ring-gray-900/5 focus:outline-none -top-9">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="#"
                            onClick={() => handleClickOnEdit(person.id)}
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            Edit
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="#"
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            Delete
                          </Link>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </li>
          );
        })}
      </ul>
      <NamoraPanel {...panelProps} />
    </div>
  );
};
