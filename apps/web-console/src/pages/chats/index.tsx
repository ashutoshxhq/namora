import { withPageSessionAuthRequired } from "@/auth0/utils";
import { Window } from "@/components/chats";

function Chats(props: any) {
  const { user } = props;
  return (
    <>
      <div className="pb-3 mb-3 ">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Hi, {user?.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500">...</p>
      </div>
      <Window {...props} />
    </>
  );
}
export default Chats;

// Chats.getLayout = function getLayout(page: NextPage) {
//   console.log({ page });
//   return (
//     <div className="bg-red-300">
//       <>{page}</>
//     </div>
//   );
// };

export const getServerSideProps = withPageSessionAuthRequired;
