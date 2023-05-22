import {
  isTomorrow,
  isToday,
  addDays,
  differenceInDays,
  subDays,
} from "date-fns";

export const sortByCreatedAt = (a: any, b: any) =>
  a?.created_at &&
  b?.created_at &&
  new Date(a.created_at).getTime() > new Date(b.created_at).getTime()
    ? 1
    : -1;

export const getDates = () => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const endOfToday = new Date(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).setHours(
      23,
      59,
      59,
      999
    )
  );

  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay() + 1
  );
  const endOfWeek = new Date(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      startOfWeek.getDate() + 6
    ).setHours(23, 59, 59, 999)
  );

  const endOfLastDayOfTheWeekFromToday = new Date(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6).setHours(
      23,
      59,
      59,
      999
    )
  );

  return {
    startOfToday,
    endOfToday,

    startOfWeek,
    endOfWeek,

    endOfLastDayOfTheWeekFromToday,
  };
};

export function getDateInString(date: Date) {
  return new Date(new Intl.DateTimeFormat("en-US").format(date));
}

export function getDateInShortFormat(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function getDateWithoutYearFormat(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

export function checkIsToday(date: Date) {
  return isToday(date);
}

export function checkIsTomorrow(date: Date) {
  return isTomorrow(date);
}

export function getDateAfterXDays(date: Date, deltaValue: number) {
  return addDays(new Date(date), deltaValue);
}

export function getDateBeforeXDays(date: Date, deltaValue: number) {
  return subDays(new Date(date), deltaValue);
}

export function getDiffInDays(date1: Date, date2: Date) {
  return differenceInDays(new Date(date1), new Date(date2));
}

export function getAbsoluteStartDate(date: Date) {
  return new Date(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).setHours(
      0,
      0,
      0,
      0
    )
  );
}

export function getAbsoluteEndDate(date: Date) {
  return new Date(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).setHours(
      23,
      59,
      59,
      999
    )
  );
}

export function getTimeInShortSecondFormat(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
    // second: 'numeric',
  }).format(new Date(date));
}

export function getTimeInShortMinuteFormat(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    // hour: 'numeric',
    // minute: 'numeric',
    // hourCycle: 'h23',
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
