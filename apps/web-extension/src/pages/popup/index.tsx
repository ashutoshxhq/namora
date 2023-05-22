import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';
import './index.css';
import '../../output.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { PersistQueryClientProvider, persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query';

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
            <Popup />
        </Auth0Provider>
    </PersistQueryClientProvider>
);
