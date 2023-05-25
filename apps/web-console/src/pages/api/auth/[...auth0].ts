import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export default handleAuth({
  async login(req, res) {
    await handleLogin(req, res, {
      authorizationParams: {
        audience: "https://api.namora.ai",
        scope: "openid profile email offline_access",
      },
      returnTo: "/",
    });
  },
});
