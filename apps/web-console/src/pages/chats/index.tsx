import { withPageSessionAuthRequired } from "@/auth0/utils";
import { Window } from "@/components/chats";

function Chats(props: any) {
  return <Window {...props} />;
}
export default Chats;

// Chats.getLayout = function getLayout(page: NextPage) {
//   return (
//     <div className="bg-red-300">
//       <>{page}</>
//     </div>
//   );
// };

export const getServerSideProps = withPageSessionAuthRequired;
