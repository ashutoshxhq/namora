import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
    login: handleLogin({
      authorizationParams: {
        audience: 'https://api.namora.ai',
        scope: 'openid profile email'
      }
    })
  });