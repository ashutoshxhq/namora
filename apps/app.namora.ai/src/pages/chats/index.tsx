import { ChatInput } from "chats/ui/ChatInput";
import ChatWindow from "chats/ui/ChatWindow";

const messages = [
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  // Add more messages as needed
];

function Chats() {
  return (
    <div className="overflow-hidden bg-white divide-y divide-gray-200 rounded-lg shadow">
      <div className="p-2 px-4">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Namora.ai Chat GPT
        </h3>
      </div>
      <div className="">
        <ChatWindow messages={messages} />
      </div>
      <div className="p-2">
        <ChatInput />
      </div>
    </div>
  );
}
export default Chats;
