import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react'
import { getUsers } from '../../api/users';
import { useQuery } from '@tanstack/react-query';
import NylasIntegration from './NylasIntegration';
import CRMIntegration from './CRMIntegration';

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
  )
}

export default UserProfile