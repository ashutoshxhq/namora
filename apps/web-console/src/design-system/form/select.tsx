import React, { useRef, useState } from "react";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormWatch,
} from "react-hook-form";
import { Listbox, Transition } from "@headlessui/react";
import { usePopper } from "react-popper";
import { Portal } from "react-portal";

import { CheckIcon } from "@heroicons/react/24/outline";
import { OptionType } from "@/entities/tasks/constants";
import { currentUserEntityKey } from "@/current-user/constants";
import { getAllFirstChars } from "@/utils/string";

const defaultAvatar = (
  <span className="inline-block w-5 h-5 overflow-hidden bg-gray-100 rounded-full">
    <svg
      className="w-full h-full text-gray-300"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  </span>
);
// export const unassignedObj = {
//   id: "unassigned",
//   name: "Unassigned",
//   type: "Unassigned",
// };

export const FormInputSelect = ({
  id = "",
  name = "",
  contextId = "",
  options,
  iconMap,
  control,
  formState,
  watch,
}: {
  id: string;
  name: string;
  label?: string;
  contextId: string;
  placeholder: string;
  options: any;
  iconMap: { [key: string]: any };
  control: Control;
  formState: { errors: any };
  getValues: UseFormGetValues<any>;
  watch: UseFormWatch<any>;
}) => {
  const popperElRef = useRef(null);
  const [targetElement, setTargetElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 1],
        },
      },
    ],
  });

  const _selectedOption = watch(name);

  const errName = formState?.errors?.[name];
  const errType = errName?.type;
  const errMessage = errName?.message;
  const isError = !!(errType && errMessage);

  const getIcon = (option: OptionType) => {
    let _selectedOptionId = option?.id ?? "";
    if ((option && option.type) === currentUserEntityKey) {
      _selectedOptionId = option?.type;
    }
    const Component: any = iconMap?.[_selectedOptionId];
    return <Component className="w-5" />;
  };

  return (
    <>
      <div id={id} className="relative z-20 flex items-center justify-center">
        <div className="w-full max-w-xs mx-auto">
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Listbox
                as="div"
                className="space-y-1"
                {...field}
                onChange={(e: any) => {
                  field.onChange(e);
                }}
                by="id"
              >
                {({ open }) => (
                  <div className="relative" ref={setTargetElement}>
                    <span className="inline-block w-full rounded-xl">
                      <Listbox.Button className="relative w-auto px-3 py-2 text-left transition duration-150 ease-in-out bg-white border border-gray-300 cursor-default rounded-2xl sm:text-sm sm:leading-5 focus:outline-1">
                        <span className="flex items-start justify-center gap-2">
                          {getIcon(_selectedOption)}
                          {_selectedOption?.name}
                        </span>
                      </Listbox.Button>
                    </span>
                    <Portal>
                      <div
                        ref={popperElRef}
                        style={styles.popper}
                        {...attributes.popper}
                        className="z-10"
                      >
                        <Transition
                          show={open}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                          beforeEnter={() =>
                            setPopperElement(popperElRef.current)
                          }
                          afterLeave={() => setPopperElement(null)}
                        >
                          <Listbox.Options className="absolute z-20 flex flex-col p-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg min-w-max max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {options.map((option: OptionType) => (
                              <Listbox.Option key={option.id} value={option}>
                                {({ selected, active }) => {
                                  return (
                                    <div
                                      className={`${
                                        active ? "bg-gray-100" : ""
                                      } 
                                cursor-default select-none relative p-2 rounded-md  transition-colors duration-100 ease`}
                                    >
                                      <div className="flex gap-2">
                                        <div className="flex">
                                          {getIcon(option)}
                                        </div>
                                        <div className="flex justify-between flex-1 ">
                                          <div
                                            className={`${
                                              selected
                                                ? "font-semibold"
                                                : "font-normal"
                                            }`}
                                          >
                                            {option.name}
                                          </div>
                                          <div className="pl-10">
                                            {selected && (
                                              <CheckIcon className="w-5" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }}
                              </Listbox.Option>
                            ))}
                            {/* <Listbox.Option value={unassignedObj}>
                        {({ selected, active }) => {
                          return (
                            <div
                              className={`${active ? "bg-gray-100" : ""} ${
                                selected ? "bg-gray-200" : ""
                              } 
                                cursor-default select-none relative p-2 flex flex-row  rounded-md  transition-colors duration-100 ease`}
                            >
                              <div className="flex flex-1 gap-2">
                                <span>{getIcon(unassignedObj)}</span>
                                <span
                                  className={`${
                                    selected ? "font-semibold" : "font-normal"
                                  }  `}
                                >
                                  {unassignedObj.name}
                                </span>
                              </div>
                              <span>
                                {selected && <CheckIcon className="w-5" />}
                              </span>
                            </div>
                          );
                        }}
                      </Listbox.Option> */}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Portal>
                  </div>
                )}
              </Listbox>
            )}
          />
        </div>
      </div>
    </>
  );
};

export const FormInputSelectWithSubmit = ({
  id = "",
  name = "",
  contextId = "",
  options,
  iconMap,
  control,
  formState,
  getValues,
  watch,
  onFormSubmit,
  handleSubmit,
}: {
  id: string;
  name: string;
  label?: string;
  contextId: string;
  placeholder: string;
  options: any;
  iconMap: { [key: string]: any };
  control: Control;
  formState: { errors: any };
  getValues: UseFormGetValues<any>;
  watch: UseFormWatch<any>;
  onFormSubmit: any;
  handleSubmit: any;
}) => {
  const popperElRef = useRef(null);
  const [targetElement, setTargetElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState<any>(null);
  const { styles, attributes, forceUpdate } = usePopper(
    targetElement,
    popperElement,
    {
      placement: "bottom",
      strategy: "fixed",
      modifiers: [
        {
          name: "flip",
          enabled: true,
          options: {
            rootBoundary: "viewport",
            altBoundary: false,
            allowedAutoPlacements: ["top"],
            fallbackPlacements: [
              "top-start",
              "top-end",
              "bottom",
              "bottom-start",
              "bottom-end",
            ],
          },
        },
        {
          name: "offset",
          options: {
            offset: [-75, 1],
          },
        },
        {
          name: "preventOverflow",
          options: {
            rootBoundary: "viewport",
            mainAxis: false,
            altAxis: true,
          },
        },
      ],
    }
  );

  const _selectedOption = getValues(name);
  const errName = formState?.errors?.[name];
  const errType = errName?.type;
  const errMessage = errName?.message;
  const isError = !!(errType && errMessage);

  const getIcon = (option: OptionType) => {
    let _selectedOptionId = option?.id ?? "";
    if ((option && option.type) === currentUserEntityKey) {
      _selectedOptionId = option?.type;
    }
    const Component: any = iconMap?.[_selectedOptionId] ?? defaultAvatar;
    return <Component className="w-5" />;
  };

  let shortName = _selectedOption?.name;
  if (_selectedOption?.type === currentUserEntityKey) {
    shortName = getAllFirstChars(_selectedOption?.name);
  }

  let interactiveComponent = (
    <Listbox.Button className="relative w-auto text-left transition duration-150 ease-in-out bg-white border border-gray-300 cursor-default rounded-2xl sm:text-sm sm:leading-5 focus:outline-1">
      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-500 rounded-full">
        <span className="text-sm font-medium leading-none text-white">
          {shortName}
        </span>
      </span>
    </Listbox.Button>
  );

  if (_selectedOption?.type !== currentUserEntityKey) {
    interactiveComponent = (
      <Listbox.Button className="relative w-auto px-3 py-2 pr-5 text-left transition duration-150 ease-in-out bg-white border border-gray-300 cursor-default rounded-2xl sm:text-sm sm:leading-5 focus:outline-1">
        <span className="flex items-start justify-center gap-2 text-sm">
          {getIcon(_selectedOption)}
          {shortName}
        </span>
      </Listbox.Button>
    );
  }

  return (
    <>
      <div id={id} className="flex items-center justify-center ">
        <div className="w-full max-w-xs mx-auto ">
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Listbox
                as="div"
                className="space-y-1"
                {...field}
                onChange={(currentOption: any) => {
                  if (currentOption.id !== _selectedOption.id) {
                    field.onChange(currentOption);
                    if (handleSubmit && onFormSubmit)
                      handleSubmit(onFormSubmit)();
                  }
                }}
                by="id"
              >
                {({ open }) => (
                  <div className="relative" ref={setTargetElement}>
                    <span className="inline-block w-full rounded-xl">
                      {interactiveComponent}
                    </span>
                    <Portal>
                      <div
                        ref={setPopperElement}
                        style={styles.popper}
                        {...attributes.popper}
                      >
                        <Transition
                          show={open}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                          beforeEnter={() => {
                            forceUpdate?.();
                            setPopperElement(popperElRef.current);
                          }}
                          afterLeave={() => setPopperElement(null)}
                        >
                          <Listbox.Options className="absolute p-1 mt-1 overflow-auto text-base bg-white rounded-md  max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm w-[160px] z-20 shadow-lg">
                            {options.map((option: OptionType) => (
                              <Listbox.Option key={option.id} value={option}>
                                {({ selected, active }) => {
                                  return (
                                    <div
                                      className={`${
                                        active ? "bg-gray-100" : ""
                                      } 
                                cursor-default select-none relative p-2 flex flex-row  rounded-md  transition-colors duration-100 ease`}
                                    >
                                      <div className="flex flex-1 gap-2">
                                        <span>{getIcon(option)}</span>
                                        <span
                                          className={`${
                                            selected
                                              ? "font-semibold"
                                              : "font-normal"
                                          }  `}
                                        >
                                          {option.name}
                                        </span>
                                      </div>
                                      <span>
                                        {selected && (
                                          <CheckIcon className="w-5" />
                                        )}
                                      </span>
                                    </div>
                                  );
                                }}
                              </Listbox.Option>
                            ))}
                            {/* <Listbox.Option value={unassignedObj}>
                        {({ selected, active }) => {
                          return (
                            <div
                              className={`${active ? "bg-gray-100" : ""} ${
                                selected ? "bg-gray-200" : ""
                              } 
                                cursor-default select-none relative p-2 flex flex-row  rounded-md  transition-colors duration-100 ease`}
                            >
                              <div className="flex items-center justify-start flex-1 gap-2">
                                {defaultAvatar}
                                <span
                                  className={`${
                                    selected ? "font-semibold" : "font-normal"
                                  }  `}
                                >
                                  {unassignedObj?.name}
                                </span>
                              </div>
                              <span>
                                {selected && <CheckIcon className="w-5" />}
                              </span>
                            </div>
                          );
                        }}
                      </Listbox.Option> */}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Portal>
                  </div>
                )}
              </Listbox>
            )}
          />
        </div>
      </div>
    </>
  );
};

// export const FormInputMultiSelectWithSubmit = ({
//   id = "",
//   name = "",
//   label = "",
//   contextId = "",
//   placeholder = "Enter a text",
//   options,
//   control,
//   formState,
//   getValues,
//   handleSubmit,
//   onFormSubmit,
// }: {
//   id: string;
//   name: string;
//   label?: string;
//   contextId: string;
//   placeholder: string;
//   options: any;
//   control: Control;
//   formState: { errors: any };
//   getValues: any;
//   handleSubmit: any;
//   onFormSubmit: any;
// }) => {
//   const _selectedOption = getValues(name);

//   const errName = formState?.errors?.[name];
//   const errType = errName?.type;
//   const errMessage = errName?.message;
//   const isError = !!(errType && errMessage);

//   return (
//     <>
//       <div className="flex items-center justify-center p-12">
//         <div className="w-full max-w-xs mx-auto">
//           <Controller
//             control={control}
//             name={name}
//             render={({ field }) => (
//               <Listbox
//                 as="div"
//                 className="space-y-1"
//                 {...field}
//                 onChange={(e: any) => {
//                   field.onChange(e);
//                   if (handleSubmit && onFormSubmit)
//                     handleSubmit(onFormSubmit)();
//                 }}
//                 multiple
//               >
//                 {({ open }) => {
//                   return (
//                     <>
//                       <Listbox.Label className="block text-sm font-medium leading-5 text-gray-700">
//                         {label}
//                       </Listbox.Label>
//                       <div className="relative">
//                         <span className="inline-block w-full rounded-md shadow-sm">
//                           <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md cursor-default sm:text-sm sm:leading-5">
//                             <span className="block truncate">
//                               {_selectedOption
//                                 .map((person: any) => person.name)
//                                 .join(", ")}
//                             </span>
//                             <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                               <svg
//                                 className="w-5 h-5 text-gray-400"
//                                 viewBox="0 0 20 20"
//                                 fill="none"
//                                 stroke="currentColor"
//                               >
//                                 <path
//                                   d="M7 7l3-3 3 3m0 6l-3 3-3-3"
//                                   strokeWidth="1.5"
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                 />
//                               </svg>
//                             </span>
//                           </Listbox.Button>
//                         </span>

//                         <Transition
//                           show={open}
//                           enter="transition duration-100 ease-out"
//                           enterFrom="transform scale-95 opacity-0"
//                           enterTo="transform scale-100 opacity-100"
//                           leave="transition duration-75 ease-out"
//                           leaveFrom="transform scale-100 opacity-100"
//                           leaveTo="transform scale-95 opacity-0"
//                           className="absolute w-full mt-1 bg-white rounded-md shadow-lg"
//                         >
//                           <Listbox.Options
//                             static
//                             className="py-1 overflow-auto text-base leading-6 rounded-md shadow-xs max-h-60 sm:text-sm sm:leading-5"
//                           >
//                             {options.map((person: any) => (
//                               <Listbox.Option
//                                 key={person.id}
//                                 value={person}
//                                 disabled={person.unavailable}
//                               >
//                                 {({ selected, active }) => (
//                                   <div
//                                     className={`${
//                                       active
//                                         ? "text-white bg-blue-600"
//                                         : "text-gray-900"
//                                     } cursor-default select-none relative py-2 pl-8 pr-4`}
//                                   >
//                                     <span
//                                       className={`${
//                                         selected
//                                           ? "font-semibold"
//                                           : "font-normal"
//                                       } block truncate`}
//                                     >
//                                       {person.name}
//                                     </span>
//                                     {selected && (
//                                       <span
//                                         className={`${
//                                           active
//                                             ? "text-white"
//                                             : "text-blue-600"
//                                         } absolute inset-y-0 left-0 flex items-center pl-1.5`}
//                                       >
//                                         <svg
//                                           className="w-5 h-5"
//                                           xmlns="http://www.w3.org/2000/svg"
//                                           viewBox="0 0 20 20"
//                                           fill="currentColor"
//                                         >
//                                           <path
//                                             fillRule="evenodd"
//                                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                                             clipRule="evenodd"
//                                           />
//                                         </svg>
//                                       </span>
//                                     )}
//                                   </div>
//                                 )}
//                               </Listbox.Option>
//                             ))}
//                           </Listbox.Options>
//                         </Transition>
//                       </div>
//                     </>
//                   );
//                 }}
//               </Listbox>
//             )}
//           />
//         </div>
//       </div>
//     </>
//   );
// };

// export const FormInputSelectWithAutoCompleteSubmit = ({
//   id = "",
//   name = "",
//   contextId = "",
//   placeholder = "Enter a text",
//   options,
//   control,
//   formState,
//   getValues,
//   handleSubmit,
//   onFormSubmit,
// }: {
//   id: string;
//   name: string;
//   contextId: string;
//   placeholder: string;
//   options: any;
//   control: Control;
//   formState: { errors: any };
//   getValues: any;
//   handleSubmit: any;
//   onFormSubmit: any;
// }) => {
//   const _selectedOption = getValues(name);

//   const errName = formState?.errors?.[name];
//   const errType = errName?.type;
//   const errMessage = errName?.message;
//   const isError = !!(errType && errMessage);
//   const [selectedPerson, setSelectedPerson] = useState(options[0]);
//   const [query, setQuery] = useState("");

//   const filteredPeople =
//     query === ""
//       ? options
//       : options.filter((person: any) => {
//           return person.name.toLowerCase().includes(query.toLowerCase());
//         });
//   return (
//     <>
//       <div id={id} className="flex items-center justify-center w-full">
//         <Controller
//           control={control}
//           name={name}
//           render={({ field }) => (
//             <Combobox
//               by="id"
//               value={_selectedOption}
//               onChange={(e: any) => {
//                 field.onChange(e);
//                 if (handleSubmit && onFormSubmit) handleSubmit(onFormSubmit)();
//               }}
//             >
//               <div className="relative mt-1">
//                 <div className="relative w-full overflow-hidden text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
//                   <Combobox.Input
//                     placeholder={placeholder}
//                     className="w-full py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 border-none outline-none focus:ring-0 rounded-xl"
//                     displayValue={(person: any) => person.name}
//                     onChange={(event) => setQuery(event.target.value)}
//                   />
//                   <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
//                     <ChevronUpDownIcon
//                       className="w-5 h-5 text-gray-400"
//                       aria-hidden="true"
//                     />
//                   </Combobox.Button>
//                 </div>
//                 <Transition
//                   as={Fragment}
//                   leave="transition ease-in duration-100"
//                   leaveFrom="opacity-100"
//                   leaveTo="opacity-0"
//                   afterLeave={() => setQuery("")}
//                 >
//                   <Combobox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
//                     {filteredPeople.length === 0 && query !== "" ? (
//                       <div className="relative px-4 py-2 text-gray-700 cursor-default select-none">
//                         Nothing found.
//                       </div>
//                     ) : (
//                       filteredPeople.map((person: any) => (
//                         <Combobox.Option
//                           key={person.id}
//                           className={({ active }) =>
//                             `relative cursor-default select-none py-2 pl-10 pr-4 ${
//                               active
//                                 ? "bg-teal-600 text-white"
//                                 : "text-gray-900"
//                             }`
//                           }
//                           value={person}
//                         >
//                           {({ selected, active }) => (
//                             <>
//                               <span
//                                 className={`block truncate ${
//                                   selected ? "font-medium" : "font-normal"
//                                 }`}
//                               >
//                                 {person.name}
//                               </span>
//                               {selected ? (
//                                 <span
//                                   className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
//                                     active ? "text-white" : "text-teal-600"
//                                   }`}
//                                 >
//                                   <CheckIcon
//                                     className="w-5 h-5"
//                                     aria-hidden="true"
//                                   />
//                                 </span>
//                               ) : null}
//                             </>
//                           )}
//                         </Combobox.Option>
//                       ))
//                     )}
//                   </Combobox.Options>
//                 </Transition>
//               </div>
//             </Combobox>
//           )}
//         />
//       </div>
//     </>
//   );
// };

// export const FormInputSelectWithAutoComplete = ({
//   id = "",
//   name = "",
//   contextId = "",
//   placeholder = "Enter a text",
//   options,
//   iconMap,
//   control,
//   formState,
//   getValues,
// }: {
//   id: string;
//   name: string;
//   contextId: string;
//   placeholder: string;
//   options: any;
//   iconMap: { [key: string]: any };
//   control: Control;
//   formState: { errors: any };
//   getValues: any;
// }) => {
//   const _selectedOption = getValues(name);
//   const getIcon = ({ id }: { id: string }) => {
//     const Component: any = iconMap[id];
//     return <Component className="w-5" />;
//   };

//   const errName = formState?.errors?.[name];
//   const errType = errName?.type;
//   const errMessage = errName?.message;
//   const isError = !!(errType && errMessage);
//   const [query, setQuery] = useState("");

//   const filteredPeople =
//     query === ""
//       ? options
//       : options.filter((person: any) => {
//           return person.name.toLowerCase().includes(query.toLowerCase());
//         });
//   return (
//     <>
//       <div id={id} className="flex items-center justify-center w-full">
//         <Controller
//           control={control}
//           name={name}
//           render={({ field }) => (
//             <Combobox by="id" {...field}>
//               <div className="relative mt-1">
//                 <div className="relative w-full overflow-hidden text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
//                   <Combobox.Input
//                     placeholder={placeholder}
//                     className="w-full py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 border-none outline-none focus:ring-0 rounded-xl"
//                     displayValue={(person: any) => person.name}
//                     onChange={(event) => setQuery(event.target.value)}
//                   />
//                   <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
//                     <ChevronUpDownIcon
//                       className="w-5 h-5 text-gray-400"
//                       aria-hidden="true"
//                     />
//                   </Combobox.Button>
//                 </div>
//                 <Transition
//                   as={Fragment}
//                   leave="transition ease-in duration-100"
//                   leaveFrom="opacity-100"
//                   leaveTo="opacity-0"
//                   afterLeave={() => setQuery("")}
//                 >
//                   <Combobox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
//                     {filteredPeople.length === 0 && query !== "" ? (
//                       <div className="relative px-4 py-2 text-gray-700 cursor-default select-none">
//                         Nothing found.
//                       </div>
//                     ) : (
//                       filteredPeople.map((person: any) => (
//                         <Combobox.Option
//                           key={person.id}
//                           className={({ active }) =>
//                             `relative cursor-default select-none py-2 pl-10 pr-4 ${
//                               active
//                                 ? "bg-teal-600 text-white"
//                                 : "text-gray-900"
//                             }`
//                           }
//                           value={person}
//                         >
//                           {({ selected, active }) => (
//                             <>
//                               <span
//                                 className={`block truncate ${
//                                   selected ? "font-medium" : "font-normal"
//                                 }`}
//                               >
//                                 {person.name}
//                               </span>
//                               {selected ? (
//                                 <span
//                                   className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
//                                     active ? "text-white" : "text-teal-600"
//                                   }`}
//                                 >
//                                   <CheckIcon
//                                     className="w-5 h-5"
//                                     aria-hidden="true"
//                                   />
//                                 </span>
//                               ) : null}
//                             </>
//                           )}
//                         </Combobox.Option>
//                       ))
//                     )}
//                   </Combobox.Options>
//                 </Transition>
//               </div>
//             </Combobox>
//           )}
//         />
//       </div>
//     </>
//   );
// };

// export const FormInputComboMultiSelectWithSubmit = ({
//   id = "",
//   name = "",
//   label = "",
//   contextId = "",
//   placeholder = "Enter a text",
//   options,
//   control,
//   formState,
//   getValues,
//   handleSubmit,
//   onFormSubmit,
// }: {
//   id: string;
//   name: string;
//   label?: string;
//   contextId: string;
//   placeholder: string;
//   options: any;
//   control: Control;
//   formState: { errors: any };
//   getValues: any;
//   handleSubmit: any;
//   onFormSubmit: any;
// }) => {
//   const _selectedOption = getValues(name);

//   const errName = formState?.errors?.[name];
//   const errType = errName?.type;
//   const errMessage = errName?.message;
//   const isError = !!(errType && errMessage);
//   const [query, setQuery] = useState("");

//   const filteredPeople =
//     query === ""
//       ? options
//       : options.filter((person: any) => {
//           return person.name.toLowerCase().includes(query.toLowerCase());
//         });
//   return (
//     <>
//       <div className="flex items-center justify-center p-12">
//         <div className="w-full max-w-xs mx-auto">
//           <Controller
//             control={control}
//             name={name}
//             render={({ field }) => (
//               <Combobox
//                 value={_selectedOption}
//                 by="id"
//                 onChange={(e: any) => {
//                   field.onChange(e);
//                   if (handleSubmit && onFormSubmit)
//                     handleSubmit(onFormSubmit)();
//                 }}
//                 multiple
//               >
//                 {({ open }) => (
//                   <div className="relative mt-1">
//                     <div className="relative w-full overflow-hidden text-left bg-white rounded-lg shadow-md cursor-default sm:text-sm">
//                       {/* {_selectedOption.length > 0 && (
//                         <ul>
//                           {_selectedOption.map((person: any) => (
//                             <li key={person.id}>{person.name}</li>
//                           ))}
//                         </ul>
//                       )} */}
//                       <Combobox.Input
//                         className="w-full py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 border-1 "
//                         displayValue={(person: any) => person.name}
//                         onChange={(event) => setQuery(event.target.value)}
//                       />
//                       <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
//                         <ChevronUpDownIcon
//                           className="w-5 h-5 text-gray-400"
//                           aria-hidden="true"
//                         />
//                       </Combobox.Button>
//                     </div>
//                     <Transition
//                       show={open}
//                       as={Fragment}
//                       enter="transition duration-100 ease-out"
//                       enterFrom="transform scale-95 opacity-0"
//                       enterTo="transform scale-100 opacity-100"
//                       leave="transition duration-75 ease-out"
//                       leaveFrom="transform scale-100 opacity-100"
//                       leaveTo="transform scale-95 opacity-0"
//                       afterLeave={() => setQuery("")}
//                     >
//                       <Combobox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 sm:text-sm">
//                         {filteredPeople.length === 0 && query !== "" ? (
//                           <div className="relative px-4 py-2 text-gray-700 cursor-default select-none">
//                             Nothing found.
//                           </div>
//                         ) : (
//                           filteredPeople.map((person: any) => (
//                             <Combobox.Option
//                               key={person.id}
//                               className={({ active }) =>
//                                 `relative cursor-default select-none py-2 pl-10 pr-4 ${
//                                   active
//                                     ? "bg-teal-600 text-white"
//                                     : "text-gray-900"
//                                 }`
//                               }
//                               value={person}
//                             >
//                               {({ selected, active }) => (
//                                 <>
//                                   <span
//                                     className={`block truncate ${
//                                       selected ? "font-medium" : "font-normal"
//                                     }`}
//                                   >
//                                     {person.name}
//                                   </span>
//                                   {selected ? (
//                                     <span
//                                       className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
//                                         active ? "text-white" : "text-teal-600"
//                                       }`}
//                                     >
//                                       <CheckIcon
//                                         className="w-5 h-5"
//                                         aria-hidden="true"
//                                       />
//                                     </span>
//                                   ) : null}
//                                 </>
//                               )}
//                             </Combobox.Option>
//                           ))
//                         )}
//                       </Combobox.Options>
//                     </Transition>
//                   </div>
//                 )}
//               </Combobox>
//             )}
//           />
//         </div>
//       </div>
//     </>
//   );
// };
