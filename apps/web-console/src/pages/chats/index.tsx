import { withPageSessionAuthRequired } from "@/auth0/utils";
import { TextInput, Window } from "@/components/chats";

function Chats(props: any) {
  const { user } = props;
  return (
    <>
      <div className="pb-3 mb-3 border-b">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Hi, {user?.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500">...</p>
      </div>
      <div className="box-border overflow-hidden bg-white divide-y divide-gray-200 rounded-lg shadow h-[calc(100vh_-_220px)] mb-2">
        <Window {...props} />
      </div>
      <TextInput {...props} />
    </>
  );
}
export default Chats;

export const getServerSideProps = withPageSessionAuthRequired;
