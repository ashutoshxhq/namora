import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <ChatBubbleLeftRightIcon className="w-20 stroke-gray-300" />
      <p className="mt-1 text-sm text-gray-400">
        Get started by sending your first message.
      </p>
    </div>
  );
};

