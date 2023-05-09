import { Fragment, useState, useMemo } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { classNames } from "@/utils";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { NamoraPanel } from "@/design-system/molecules";

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

const people = [
  {
    id: "1",
    name: "Leslie Alexander",
    email: "leslie.alexander@example.com",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    id: "2",
    name: "Michael Foster",
    email: "michael.foster@example.com",
    role: "Co-Founder / CTO",
    imageUrl:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    id: "3",
    name: "Dries Vincent",
    email: "dries.vincent@example.com",
    role: "Business Relations",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: null,
  },
  {
    id: "4",
    name: "Lindsay Walton",
    email: "lindsay.walton@example.com",
    role: "Front-end Developer",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    id: "5",
    name: "Courtney Henry",
    email: "courtney.henry@example.com",
    role: "Designer",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    id: "5",
    name: "Tom Cook",
    email: "tom.cook@example.com",
    role: "Director of Product",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: null,
  },
];

export const TeamMembers = () => {
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>({});

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
    const selectedMember = people?.find((person) => person.id === id);
    setSelectedMember(selectedMember);
  };

  const panelProps = {
    open,
    data: selectedMember,
    setOpen,
  };
  return (
    <div className="overflow-auto h-[calc(100vh - theme(space.20))] overflow-hidden bg-white shadow rounded-md my-3 mb-11 ">
      <div className="p-3 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Members (0/0)
        </h3>
        <div className="mt-3 sm:ml-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Invite Members
          </button>
        </div>
      </div>
      <ul role="list" className="divide-y divide-gray-100">
        {people.map((person) => (
          <li
            key={person.email}
            className="z-0 flex items-center justify-between px-4 py-5 sm:px-6 gap-x-6"
          >
            <div className="flex gap-x-4">
              <Image
                className="flex-none w-12 h-12 rounded-full bg-gray-50"
                src={person.imageUrl}
                alt=""
                width="100"
                height="100"
              />
              <div className="flex-auto min-w-0">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  <a href={person.href} className="hover:underline">
                    {person.name}
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
              <div className="hidden sm:flex sm:flex-col sm:items-end">
                <p className="text-sm leading-6 text-gray-900">{person.role}</p>
                {person.lastSeen ? (
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Last seen{" "}
                    <time dateTime={person.lastSeenDateTime}>
                      {person.lastSeen}
                    </time>
                  </p>
                ) : (
                  <div className="mt-1 flex items-center gap-x-1.5">
                    <div className="flex-none p-1 rounded-full bg-emerald-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-xs leading-5 text-gray-500">Online</p>
                  </div>
                )}
              </div>
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
        ))}
      </ul>
      <NamoraPanel {...panelProps} />
    </div>
  );
};
