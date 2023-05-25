import { getAccessToken, getSession, withPageAuthRequired } from "@/auth0";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

export const withPageSessionAuthRequired = withPageAuthRequired({
  async getServerSideProps(
    ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
  ) {
    const session = await getSession(ctx.req, ctx.res);
    const { accessToken } = await getAccessToken(ctx.req, ctx.res, {
      refresh: true,
    });

    return {
      props: {
        session: session
          ? JSON.parse(JSON.stringify({ ...session, accessToken }))
          : {},
      },
    };
  },
});
