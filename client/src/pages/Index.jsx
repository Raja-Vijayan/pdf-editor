import React from "react";

export default function Index() {

    return (
        <div className='bg-[#18191b] min-h-screen w-full'>
            <div className='bg-[#252627] shadow-md' style={{ backgroundColor: 'rgb(141, 160, 178)' }}>
                <div className='w-[93%] m-auto py-3'>
                    <div className="flex justify-center items-center">
                        <div className="w-[80px] h-[48px]"><img
                            className="w-full h-full"
                            src="https://resources.allyearbooks.co.uk/media/markup/logos/wide-single-color.svg"
                            alt="Yearbook Logo" loading="lazy" />
                        </div>
                        <div className="flex gap-4">
                            <button className='py-2 w-[80px] text-center bg-blue-500 text-white transition-all hover:bg-blue-600 rounded-[5px] font-medium'>
                                Signin
                            </button>
                        </div>
                        <div>
                            <button className='py-2 w-[80px] text-center bg-purple-500  text-white transition-all hover:bg-purple-600 rounded-[5px] font-medium'>Sign up</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-full h-full justify-center items-center p-4'>
                <div className='py-[168px] flex justify-center items-center flex-col gap-6'>
                    <h2 className='text-5xl text-[#c7c5c5] font-bold'>What will you design today?</h2>
                    <span className='text-[#aca9a9] text-2xl font-medium'>Canva makes it easy to create and share professional designs.</span>
                    <button className='py-2 w-[200px] text-center bg-purple-500  text-white transition-all hover:bg-purple-600 rounded-[5px] font-medium'>Signup for free</button>
                </div>
            </div>
        </div>
    )
}
