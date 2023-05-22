import React from 'react';
import UserProfile from '../../conponents/molecules/Options/UserProfile';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../../conponents/molecules/Popup/LoginButton';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/users';

const Popup = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const { data: userDetails } = useQuery({
    queryKey: ['users', user?.namora_team_id, user?.namora_user_id],
    queryFn: async () => {
      return getUsers(user?.namora_team_id, user?.namora_user_id)
    },
  })
  return (
    <div className="App">
      <header className="App-header">
        {isAuthenticated ? <div className='p-4 flex flex-col justify-center items-center gap-4'>
          <div className="my-2 text-center">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">
              Hi' {userDetails?.data?.firstname + " " + userDetails?.data?.lastname}
            </h3>
            <div className='mt-4'>
              <p className="text-sm text-gray-500">
                Manage all your setting, and access to Namora Dashboard here
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4 w-full">
            <button
              onClick={() => window.open(window.location.origin + '/options.html', "_blank")}
              className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
            >
              Settings
            </button>
            {/* <button
              onClick={() => { window.location.href = "https://app.namora.ai" }}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Namora Dashboard
            </button> */}
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
        </div> :
          <div className='p-4'>
            <h3 className="text-base font-semibold leading-8 text-gray-900">
              Not Logged In
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Please login to start using Namora AI
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-4 w-full">
              <LoginButton />
              <button
                onClick={() => window.open(window.location.origin + '/options.html', "_blank")}
                className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
              >
                Settings
              </button>
            </div>
          </div>
        }

      </header>
    </div>
  );
};

export default Popup;
