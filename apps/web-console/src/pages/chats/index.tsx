import { withPageSessionAuthRequired } from "@/auth0/utils";
import { Window } from "@/components/chats";
import Head from "next/head";

function Chats(props: any) {
  return <>
    <Head>
      <title>Namora | AI Chat</title>
    </Head>
    <Window {...props} />
  </>;
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
