import React, { useEffect } from 'react';
import { PopupConfigOptions, PopupLoginOptions, useAuth0 } from '@auth0/auth0-react';
import UserProfile from '../../conponents/molecules/UserProfile';
import DividerWithTitle from '../../conponents/molecules/DividerWithTitle';
import Integrations from '../../conponents/molecules/Integrations';
import SignInButton from '../../conponents/molecules/SignInButton';

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
    if (isAuthenticated) {
      updateAccessToken(getAccessTokenSilently)
    }
  }, [isAuthenticated])

  if (urlParams.get('trigger') === "login") {
    login(loginWithPopup, isAuthenticated)
  }
  return <div className="bg-slate-200 w-screen h-screen flex items-center flex-col py-40 sm:px-6 lg:px-8">
    <div className="flex">
      <img
        className="mx-auto h-10 w-auto"
        src="https://assets.namora.ai/namora-ai-dark.png"
        alt="Your Company"
      />

    </div>

    <div className="mt-10 flex-1 w-2/4">
      <div className="bg-white px-12 py-12 shadow sm:rounded-lg">
        {isAuthenticated ? <AuthenticatedOptions /> : <NotAuthenticatedOptions />}
      </div>
    </div>
  </div>;
};


const AuthenticatedOptions = () => {
  const { logout } = useAuth0();
  return (
    <>
      <UserProfile />
      <DividerWithTitle title="Integrations" />
      <Integrations />
      <DividerWithTitle title="Auth & Other Links" />
      <div className="flex gap-4 mt-4 w-full">
        <button
          onClick={() => { window.location.href = "https://app.namora.ai" }}
          className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
        >
          Namora Dashboard
        </button>
        <button
          onClick={() => {
            localStorage.clear()
            logout({
              openUrl: false
            })
          }}
          className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Logout
        </button>
      </div>
    </>
  )
}

const NotAuthenticatedOptions = () => {
  return (
    <>
    <div className="my-2 text-center">
            <h3 className="text-base font-semibold leading-8 text-gray-900">
                Welcome to Namora
            </h3>
            <div className="mt-2">
                <p className="text-sm text-gray-500">
                    Namora is a GPT-4 powered sales cockpit for AEs and SDRs to run intelligent playbooks, research, and craft personalized messaging at scale
                </p>
            </div>
        </div>
        <SignInButton/>
    </>
  )
}

export default Options;