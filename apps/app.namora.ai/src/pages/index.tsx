// import type { ReactElement } from "react";
// import Layout from '../components/layout'
// import NestedLayout from '../components/nested-layout'
// import type { NextPageWithLayout } from './_app'
// import Main from "./main";
// const Page: NextPageWithLayout = () => {
//   return <p>hello world</p>
// }

import Chats from "./chats";

// Page.getLayout = function getLayout(page: ReactElement) {
//   return (
//     <Layout>
//       <NestedLayout>{page}</NestedLayout>
//     </Layout>
//   )
// }

// export default Page

export default function Home() {
  return <Chats />;
}