import ChatBubble from "./ChatBubble";

const ChatWindow = ({ messages }: { messages: { [key: string]: any }[] }) => {
  return (
    <div className="flex flex-col p-4 pb-40 overflow-y-scroll h-[calc(100vh-theme(space.48))]">
      {messages.map(({ message, sender }, index: number) => (
        <ChatBubble key={index} message={message} sender={sender} />
      ))}
    </div>
  );
};

export default ChatWindow;
