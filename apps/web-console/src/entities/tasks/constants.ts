import {
  ArchiveBoxIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  AtSymbolIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  EllipsisHorizontalCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  PauseCircleIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  UsersIcon,
  VideoCameraIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export type OptionType = {
  id: string;
  name: string;
  type: string;
};

export const QUERY_KEY_TASKS = ["tasks"];

export const statusKey = "status";
export const priorityKey = "priority";
export const typeKey = "type";

const commonIcons = {
  "": QuestionMarkCircleIcon,
};

/* Status */
export const not_started = "not_started";
export const in_progress = "in_progress";
export const waiting_on = "waiting_on";
export const paused = "paused";
export const completed = "completed";
export const archived = "archived";

export const NOT_STARTED = "Not Started";
export const IN_PROGRESS = "In Progress";
export const WAITING_ON = "Waiting on";
export const PAUSED = "Paused";
export const COMPLETED = "Completed";
export const ARCHIVED = "Archived";

export const statusNameMap: { [key: string]: string } = {
  [not_started]: NOT_STARTED,
  [in_progress]: IN_PROGRESS,
  [waiting_on]: WAITING_ON,
  [paused]: PAUSED,
  [completed]: COMPLETED,
  [archived]: ARCHIVED,
  "": "Status",
};
export const statusIconMap: { [key: string]: any } = {
  [not_started]: MinusCircleIcon,
  [in_progress]: EllipsisHorizontalCircleIcon,
  [waiting_on]: ClockIcon,
  [paused]: PauseCircleIcon,
  [completed]: CheckCircleIcon,
  [archived]: ArchiveBoxIcon,
  ...commonIcons,
};

export const statusIds: string[] = [
  not_started,
  in_progress,
  waiting_on,
  PAUSED,
  COMPLETED,
  ARCHIVED,
];
export const statusOptions: OptionType[] = [
  { id: not_started, name: NOT_STARTED, type: statusKey },
  { id: in_progress, name: IN_PROGRESS, type: statusKey },
  { id: waiting_on, name: WAITING_ON, type: statusKey },
  { id: paused, name: PAUSED, type: statusKey },
  { id: completed, name: COMPLETED, type: statusKey },
  { id: archived, name: ARCHIVED, type: statusKey },
];

/* Type */
export const email = "email";
export const call = "call";
export const social = "social";
export const meeting = "meeting";
export const document = "document";
export const send_contract = "send_contract";
export const ai = "ai";

export const EMAIL = "Email";
export const CALL = "Call";
export const SOCIAL = "Social";
export const MEETING = "Meeting";
export const DOCUMENT = "Document";
export const SEND_CONTRACT = "Send Contract";
export const AI = "AI";

export const typeNameMap: { [key: string]: string } = {
  // [email]: EMAIL,
  // [call]: CALL,
  // [social]: SOCIAL,
  // [meeting]: MEETING,
  // [document]: DOCUMENT,
  // [send_contract]: SEND_CONTRACT,
  [ai]: AI,
};
export const typeIconMap: { [key: string]: any } = {
  // [email]: EnvelopeIcon,
  // [call]: PhoneIcon,
  // [social]: UsersIcon,
  // [meeting]: VideoCameraIcon,
  // [document]: DocumentTextIcon,
  // [send_contract]: ShieldCheckIcon,
  [ai]: CubeTransparentIcon,
  ...commonIcons,
};
export const typeIds: string[] = [
  // email,
  // call,
  // social,
  // meeting,
  // document,
  // send_contract,
  ai,
];
export const typeOptions: OptionType[] = [
  // { id: email, name: EMAIL, type: typeKey },
  // { id: call, name: CALL, type: typeKey },
  // { id: social, name: SOCIAL, type: typeKey },
  // { id: meeting, name: MEETING, type: typeKey },
  // { id: document, name: DOCUMENT, type: typeKey },
  // { id: send_contract, name: SEND_CONTRACT, type: typeKey },
  { id: ai, name: AI, type: typeKey },
];

/* Priority */
export const urgent = "Urgent";
export const high = "High";
export const medium = "Medium";
export const low = "Low";

export const URGENT = "Urgent";
export const HIGH = "High";
export const MEDIUM = "Medium";
export const LOW = "Low";
export const priorityNameMap: { [key: string]: string } = {
  [urgent]: URGENT,
  [high]: HIGH,
  [medium]: MEDIUM,
  [low]: LOW,
  "": "Priority",
};
export const priorityIconMap: { [key: string]: any } = {
  [urgent]: ExclamationTriangleIcon,
  [high]: ArrowUpCircleIcon,
  [medium]: MinusCircleIcon,
  [low]: ArrowDownCircleIcon,
  ...commonIcons,
};

export const priorityIds: string[] = [URGENT, HIGH, MEDIUM, LOW];
export const priorityFilterOptions: OptionType[] = [
  { id: urgent, name: URGENT, type: priorityKey },
  { id: high, name: HIGH, type: priorityKey },
  { id: medium, name: MEDIUM, type: priorityKey },
  { id: low, name: LOW, type: priorityKey },
];

export const pluralNameMap: { [key: string]: string } = {
  priority: "priorities",
  status: "statuses",
  type: "types",
  user: "users",
  resource: "resources",
};

// export const visibilityNameMap: { [key: string]: string } = {
//   private: "Private",
//   public: "Public",
//   "": "Visibility",
// };
// export const visibilityIconMap: { [key: string]: IconType } = {
//   private: AiOutlineLock,
//   public: MdPublic,
//   "": BsQuestionCircle,
// };
// export const visibilityIds: string[] = ["private", "public"];

export const sortFieldNameMap: { [key: string]: string } = {
  createdAt: "Last created",
  updatedAt: "Last updated",
  name: "Name",
};
export const sortFieldIconMap: { [key: string]: any } = {
  createdAt: CalendarIcon,
  updatedAt: CalendarDaysIcon,
  name: AtSymbolIcon,
};
export const sortFieldIds: string[] = ["createdAt", "updatedAt", "name"];
export const sortFieldValueIds: string[] = ["asc", "desc"];
