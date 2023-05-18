import Link from "next/link";
import React from "react";

import { classNames } from "@/utils";

export const TabLink = ({ href, isSelected, title }: any) => {
  return (
    <Link
      href={href}
      shallow
      className={classNames(
        isSelected
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
        "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
      )}
    >
      {title}
    </Link>
  );
};
