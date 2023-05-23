import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react'
import { getUsers } from '../../../api/users';
import { useQuery } from '@tanstack/react-query';

const UserProfile = () => {
  const { user, logout } = useAuth0();
  const { data: userDetails } = useQuery({
    queryKey: ['users', user?.namora_team_id, user?.namora_user_id],
    queryFn: async () => {
      return getUsers(user?.namora_team_id, user?.namora_user_id)
    },
  })

  console.log(user, userDetails?.data)

  return (
    <>
      <div className='flex justify-between'>
        <div className='flex gap-4 flex-1 items-center'>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500">
            <span className="text-xl font-medium leading-none text-white">{user?.name?.charAt(0).toUpperCase()}</span>
          </span>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-gray-900">{userDetails?.data?.firstname + " " + userDetails?.data?.lastname} ({userDetails?.data?.company_position})</p>
            <p className="mt-1 truncate text-xs text-gray-500">{userDetails?.data?.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <a
            href={"https://app.namora.ai/settings/account"}
            target='_blank'
            className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
          >
            Edit Profile
          </a>
        </div>
        <div>

        </div>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm font-medium leading-6">
          <span className="bg-white px-6 text-gray-900">Integrations</span>
        </div>
      </div>
      <div className='my-4'>
        <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-1 xl:gap-x-2">
          <li className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
              <img
                src={"/email.png"}
                alt={"Email"}
                className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
              />
              <div className="text-sm font-medium leading-6 text-gray-900">Email (Gmail, Outlook, IMAP etc)</div>

            </div>
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500 flex items-center"><div
                  className={'rounded-md py-1 px-2 text-sm font-medium ring-1 ring-inset text-gray-600 bg-gray-50 ring-gray-500/10'}
                >
                 Not Connected
                </div></dt>
                <dd className="flex items-start gap-x-2">
                  <button
                    onClick={() => {}}
                    className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                  >
                   Connect
                  </button>
                </dd>
              </div>
            </dl>
          </li>

          <li className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
              <img
                src={"/crm.png"}
                alt={"CRM"}
                className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
              />
              <div className="text-sm font-medium leading-6 text-gray-900">CRM (Salesforce, Hubspot, Pipedrive, Zoho etc)</div>

            </div>
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500 flex items-center"><div
                  className={'rounded-md py-1 px-2 text-sm font-medium ring-1 ring-inset text-gray-600 bg-gray-50 ring-gray-500/10'}
                >
                 Not Connected
                </div></dt>
                <dd className="flex items-start gap-x-2">
                  <button
                    onClick={() => {}}
                    className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                  >
                   Connect
                  </button>
                </dd>
              </div>
            </dl>
          </li>
        </ul>
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm font-medium leading-6">
          <span className="bg-white px-6 text-gray-900">Auth & Other Links</span>
        </div>
      </div>
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

      {/* <div className='flex flex-col justify-center items-center gap-4'>

        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-500">
          <span className="text-xl font-medium leading-none text-white">{user?.name?.charAt(0).toUpperCase()}</span>
        </span>
        <div className="my-2 text-center">
          <h3 className="text-lg font-semibold leading-8 text-gray-900">
            {userDetails?.data?.firstname + " " + userDetails?.data?.lastname}
          </h3>
          <div>
            <p className="text-sm text-gray-500">
              {userDetails?.data?.company_position},  {userDetails?.data?.email}
            </p>
          </div>
          <div className='mt-4'>
            <p className="text-sm text-gray-500">
              {userDetails?.data?.position_description}
            </p>
          </div>
        </div>
        
      </div> */}
    </>

  )
}

export default UserProfile