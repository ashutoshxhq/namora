export const Bubble = ({
  message,
  sender,
}: {
  message: string;
  sender: boolean;
}) => {
  const bubbleClass =
    "rounded-3xl flex flex-wrap justify-start items-center p-3 text-black  animate-fade";
  const fromUserBubbleClass = `${bubbleClass} rounded-br-sm bg-gray-200 ml-auto`;
  const fromAIBubbleClass = `${bubbleClass} rounded-bl-sm bg-blue-200 mr-auto`;

  return (
    <div className="flex">
      <div
        className={`max-w-[80%] mb-2 ${
          sender ? fromUserBubbleClass : fromAIBubbleClass
        }`}
      >
        <p className={`break-all`}>{message}</p>
      </div>
    </div>
  );
};
