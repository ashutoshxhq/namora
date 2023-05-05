import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { TextInput, Window } from "@/components/chats";

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

function Chats({ user }: { user: any }) {
  console.log(user);
  return (
    <>
      <div className="pb-3 mb-3 border-b">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Hi, {user?.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500">...</p>
      </div>
      <div className="box-border overflow-hidden bg-white divide-y divide-gray-200 rounded-lg shadow h-[calc(100vh_-_220px)] mb-3">
        <Window />
      </div>
      <div>
        <TextInput />
      </div>
    </>
  );
}
export default Chats;

export const getServerSideProps = withPageAuthRequired();
