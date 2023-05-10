import React from "react";
import { getTimeInShortSecondFormat } from "@/utils/date";

export default function BubbleInfo({
  sender,
  userName,
}: {
  sender: boolean;
  userName: string;
}) {
  const now = new Date();
  const isMessageOwnerUser = sender;
  const messageOwnerNameText = sender ? `${userName}` : "Namora AI";

  if (isMessageOwnerUser) {
    return (
      <div className="absolute right-0 flex items-center justify-end w-full gap-1 -bottom-4">
        <p className="text-[10px] font-semibold text-gray-700">
          {messageOwnerNameText}
        </p>
        <p className="text-[10px] text-gray-400">
          {getTimeInShortSecondFormat(now)}
        </p>
      </div>
    );
  }

  return (
    <div className="absolute right-0 flex items-center justify-start w-full gap-1 -bottom-4">
      <p className="text-[10px] font-semibold text-gray-700">
        {messageOwnerNameText}
      </p>
      <p className="text-[10px] text-gray-400">
        {getTimeInShortSecondFormat(now)}
      </p>
    </div>
  );
}
