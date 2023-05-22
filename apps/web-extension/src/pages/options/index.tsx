import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './../../output.css';
import Options from './Options';
import { Auth0Provider } from '@auth0/auth0-react';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { PersistQueryClientProvider, persistQueryClient } from '@tanstack/react-query-persist-client'

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            cacheTime: 1000 * 60 * 60 * 24, // 24 hours
        },
    },
})

const persister = createSyncStoragePersister({
    storage: window.localStorage,
})


const container = document.getElementById('app-container');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
    <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
    >
        <Auth0Provider
            domain="namora.us.auth0.com"
            clientId="JB212eHsAkMPT8UF0aDyiDzAZjtBPBo8"
            authorizationParams={{
                redirect_uri: window.location.origin + '/options.html',
                audience: 'https://api.namora.ai',
                scope: 'read:current_user update:current_user_metadata openid profile email offline_access'
            }}
            useRefreshTokens={true}
            cacheLocation='localstorage'
        >
            <Options title={'Settings'} />
        </Auth0Provider>
    </PersistQueryClientProvider>
);
