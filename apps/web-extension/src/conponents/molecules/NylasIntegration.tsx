import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { getNylasIntegrationStatus } from '../../api/integrations';

const NylasIntegration = () => {
    const { user } = useAuth0();
    const { data: nylasIntegration } = useQuery({
        queryKey: ['integrations', 'nylas', user?.namora_team_id],
        queryFn: async () => {
            return getNylasIntegrationStatus(user?.namora_team_id)
        }
    })

    console.log(nylasIntegration)
    return (
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
                {nylasIntegration?.data?.connection_status ? <div className="flex justify-between gap-x-4 py-3">
                    <dt className="text-gray-500 flex items-center"><div
                        className={'rounded-md py-1 px-2 text-sm font-medium ring-1 ring-inset text-gray-600 bg-gray-50 ring-gray-500/10'}
                    >
                        Connected
                    </div></dt>
                    <dd className="flex items-start gap-x-2">
                        <button
                            onClick={() => { window.open(`https://app.namora.ai/settings/integrations?action=email-disconnect`, '_blank') }}
                            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                            Disconnect your  Account
                        </button>
                    </dd>
                </div> : <div className="flex justify-between gap-x-4 py-3">
                    <dt className="text-gray-500 flex items-center"><div
                        className={'rounded-md py-1 px-2 text-sm font-medium ring-1 ring-inset text-gray-600 bg-gray-50 ring-gray-500/10'}
                    >
                        Not Connected
                    </div></dt>
                    <dd className="flex items-start gap-x-2">
                        <button
                            onClick={() => { window.open(`https://engine.svc.api.namora.ai/integrations/nylas/oauth/authorize?user_id=${user?.namora_user_id}&team_id=${user?.namora_team_id}`, '_blank') }}
                            className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                        >
                            Connect your Email
                        </button>
                    </dd>
                </div>}

            </dl>
        </li>
    )
}

export default NylasIntegration