import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import ChatInput from "chats/ui/ChatInput";
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

function Chats( {user}:{user:any}) {
  console.log(user)
  return (
    <>
      <div className="pb-3 mb-3 border-b">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Hi, {user?.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500">...</p>
      </div>
      <div className="overflow-hidden bg-white divide-y divide-gray-200 rounded-lg shadow">
        <div className="">
          <ChatWindow messages={messages} />
        </div>
        <div className="p-2">
          <ChatInput />
        </div>
      </div>
    </>
  );
}
export default Chats;

export const getServerSideProps = withPageAuthRequired();