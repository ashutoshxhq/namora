import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

import { classNames } from "@/utils";
import { NamoraPanel } from "@/design-system/molecules";
import { getAllFirstChars } from "@/utils/string";
import { TTeamMember } from "@/current-team/types";
import { FormUpdateUser } from "@/components/settings/form-update-user";
import { useGetTeamUsers } from "@/current-team/hooks";

export const TeamMembers = (props: any) => {
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>({});

  const { data = [] } = useGetTeamUsers(props);
  const teamUsers = data;

  const handleClickOnEdit = (id: string) => {
    setOpen(true);
    const selectedMember = teamUsers?.find(
      (person: TTeamMember) => person.id === id
    );
    setSelectedMember(selectedMember);
  };

  const panelProps = {
    open,
    setOpen,
  };

  const totalMembers = teamUsers.length;
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
        {teamUsers.map((person: TTeamMember) => {
          const name = `${person.firstname} ${person.lastname ?? ""}`;
          return (
            <li
              key={person.id}
              className="flex items-center justify-between py-5 just sm:px-6 gap-x-6"
            >
              <div className="flex flex-grow gap-x-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-500 rounded-full">
                  <span className="text-sm font-medium leading-none text-white">
                    {getAllFirstChars(name)}
                  </span>
                </span>
                <div className="flex-auto min-w-0">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    <p
                      className="cursor-pointer"
                      onClick={() => handleClickOnEdit(person.id)}
                    >
                      {name}
                    </p>
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500 ">
                    {person.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end ">
                <p className="text-sm leading-6 text-gray-900">
                  {person.company_position}
                </p>
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
                    <Menu.Items className="absolute z-10 w-32 p-1 mt-2 origin-top-right bg-white rounded-md shadow-lg right-10 ring-1 ring-gray-900/5 focus:outline-none -top-5">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleClickOnEdit(person.id)}
                            className={classNames(
                              "w-full text-left",
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            Edit
                          </button>
                        )}
                      </Menu.Item>
                      {/* <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleClickOnEdit(person.id)}
                            className={classNames(
                              "w-full text-left",
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            Delete
                          </button>
                        )}
                      </Menu.Item> */}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </li>
          );
        })}
      </ul>
      <NamoraPanel {...panelProps}>
        <FormUpdateUser
          selectedMember={selectedMember}
          {...props}
          {...panelProps}
        />
      </NamoraPanel>
    </div>
  );
};
