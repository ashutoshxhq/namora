import BubbleInfo from "@/components/chats/bubble-info";
import { Loader } from "@/components/chats/loader";

export const Bubble = ({
  message,
  sender,
  userName,
  isLastMsg,
}: {
  message: string;
  sender: boolean;
  userName: string;
  isLastMsg: boolean;
}) => {
  const bubbleClass =
    "rounded-3xl flex flex-wrap justify-start items-center p-3 text-black  animate-fade";
  const fromUserBubbleClass = `${bubbleClass} rounded-br-sm bg-gray-200 text-black ml-auto`;
  const fromAIBubbleClass = `${bubbleClass} rounded-bl-sm bg-gray-700 text-white mr-auto`;

  return (
    <>
      <div className="relative z-0 flex mb-6">
        <div
          className={`max-w-[80%] px-5 ${
            sender ? fromUserBubbleClass : fromAIBubbleClass
          }`}
        >
          <div
            className={`break-all text-sm`}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>
        <BubbleInfo sender={sender} userName={userName} />
      </div>
      <div className={`relative flex ${sender && isLastMsg ? "" : "hidden"} `}>
        <div className={` px-5 ${fromAIBubbleClass} `}>
          <Loader />
          <BubbleInfo sender={false} userName={userName} />
        </div>
      </div>
    </>
  );
};
