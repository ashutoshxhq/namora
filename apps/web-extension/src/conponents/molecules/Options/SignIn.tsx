import { useAuth0 } from '@auth0/auth0-react';
import React from 'react'

const SignIn = () => {
    const { loginWithPopup } = useAuth0();
    return (
        <><div className="my-2 text-center">
            <h3 className="text-base font-semibold leading-8 text-gray-900">
                Welcome to Namora
            </h3>
            <div className="mt-2">
                <p className="text-sm text-gray-500">
                    Namora is a GPT-4 powered sales cockpit for AEs and SDRs to run intelligent playbooks, research, and craft personalized messaging at scale
                </p>
            </div>
        </div>
            <button
                onClick={() => loginWithPopup()}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                Sign in to continue
            </button></>
    )
}

export default SignIn