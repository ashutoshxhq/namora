import React from 'react'
import CRMIntegration from './CRMIntegration'
import NylasIntegration from './NylasIntegration'

const Integrations = () => {
    return (
        <div className='my-4'>
            <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-1 xl:gap-x-2">
                <CRMIntegration />
                <NylasIntegration />
            </ul>
        </div>
    )
}

export default Integrations