import { useAuth0 } from '@auth0/auth0-react';
import React from 'react'

const SignInButton = () => {
    const { loginWithPopup } = useAuth0();
    return (
        <button
            onClick={() => loginWithPopup()}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
            Sign in to continue
        </button>
    )
}

export default SignInButton