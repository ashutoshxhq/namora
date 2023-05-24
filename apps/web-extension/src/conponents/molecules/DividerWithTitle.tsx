import React from 'react'

const DividerWithTitle = ({ title }: { title: string }) => {
    return (
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-gray-900">{title}</span>
            </div>
        </div>
    )
}

export default DividerWithTitle