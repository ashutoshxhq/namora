import BubbleInfo from "./bubble-info";

export const Bubble = ({
  message,
  sender,
  userName,
}: {
  message: string;
  sender: boolean;
  userName: string;
}) => {
  const bubbleClass =
    "rounded-3xl flex flex-wrap justify-start items-center p-3 text-black  animate-fade";
  const fromUserBubbleClass = `${bubbleClass} rounded-br-sm bg-gray-200 ml-auto`;
  const fromAIBubbleClass = `${bubbleClass} rounded-bl-sm bg-blue-200 mr-auto`;

  return (
    <div className="relative flex mb-6">
      <div
        className={`max-w-[80%] px-5 ${
          sender ? fromUserBubbleClass : fromAIBubbleClass
        }`}
      >
        <p className={`break-all text-sm`}>{message}</p>
      </div>
      <BubbleInfo message={message} sender={sender} userName={userName} />
    </div>
  );
};
