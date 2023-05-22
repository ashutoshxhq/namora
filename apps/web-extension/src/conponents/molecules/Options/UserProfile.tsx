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
    <div className='flex flex-col justify-center items-center gap-4'>
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
      <div className="flex gap-4 mt-4 w-full">
        <button
          onClick={() => { window.location.href = "https://app.namora.ai" }}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
    </div>
  )
}

export default UserProfile