import { getSession, withPageAuthRequired } from "@/auth0";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

export const withPageSessionAuthRequired = withPageAuthRequired({
  async getServerSideProps(
    ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
  ) {
    const session = await getSession(ctx.req, ctx.res);

    return {
      props: {
        session: session?JSON.parse(JSON.stringify(session)):{},
      },
    };
  },
});
