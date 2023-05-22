import React, { useEffect } from 'react';
import { Auth0Provider, PopupConfigOptions, PopupLoginOptions, useAuth0 } from '@auth0/auth0-react';
import UserProfile from '../../conponents/molecules/Options/UserProfile';
import SignIn from '../../conponents/molecules/Options/SignIn';

const updateAccessToken = async (getAccessTokenSilently: any) => {
  const token = await getAccessTokenSilently();
  localStorage.setItem('accessToken', token)
}

interface Props {
  title: string;
}

const login = async (loginWithPopup: (options?: PopupLoginOptions | undefined, config?: PopupConfigOptions | undefined) => Promise<void>, isAuthenticated: boolean) => {
  if (!isAuthenticated) {
    window.history.replaceState({}, "", "options.html")
    await loginWithPopup({
      authorizationParams: {
        audience: 'https://api.namora.ai'
      }
    })
  } else {
    console.log("Already logged in")
  }
}

const Options: React.FC<Props> = ({ title }: Props) => {
  const { loginWithPopup, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    if (isAuthenticated){
      updateAccessToken(getAccessTokenSilently)
    }
  }, [isAuthenticated])

  if (urlParams.get('trigger') === "login") {
    login(loginWithPopup, isAuthenticated)
  }
  return <div className="bg-slate-200 w-screen h-screen flex flex-col py-40 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        className="mx-auto h-10 w-auto"
        src="https://assets.namora.ai/namora-ai-dark.png"
        alt="Your Company"
      />

    </div>

    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 gap-4 flex flex-col">

        {isAuthenticated ? <UserProfile /> : <SignIn />}
      </div>
    </div>
  </div>;
};

export default Options;
