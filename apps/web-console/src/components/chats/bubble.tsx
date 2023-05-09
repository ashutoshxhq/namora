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
          <p className={`break-all text-sm`}>{message}</p>
        </div>
        <BubbleInfo message={message} sender={sender} userName={userName} />
      </div>
      {/* <WaitBeforeShow waitBeforeShow={6000}> */}
      {/* <WaitBeforeHide waitBeforeHide={5000}> */}
      <div className="relative flex">
        <div
          className={` px-5 ${fromAIBubbleClass} ${
            sender && isLastMsg ? "" : "hidden"
          } `}
        >
          <Loader />
          <BubbleInfo message={message} sender={false} userName={userName} />
        </div>
      </div>
      {/* </WaitBeforeHide> */}
      {/* </WaitBeforeShow> */}
    </>
  );
};
