import React from 'react';
import ContentLoader from 'react-content-loader';
import Logo from "../Login/Images/logo.png";

export const PlaceHolder = ({ isLoading = true }) => {
    return (
        <div className="w-full h-screen flex flex-col bg-gray-100">
            {isLoading ? (
                <ContentLoader
                    speed={2}
                    width="100%"
                    height={60}
                    backgroundColor="#cdcdcd"
                    foregroundColor="#ecebeb"
                    style={{ width: '100%', height: '60px' }}
                >
                    <rect x="0" y="0" rx="0" ry="0" width="100%" height="60" />
                </ContentLoader>
            ) : (
                <header className="w-full h-[60px] bg-gradient-to-r from-blue-500 to-purple-500 flex justify-between items-center px-4">
                    <div className="text-white font-bold">Pure Pixel Portrait Studios</div>
                    <div className="flex space-x-4">
                        <button className="bg-white text-purple-700 px-4 py-2 rounded">Order & Print</button>
                        <button className="bg-white text-purple-700 px-4 py-2 rounded">Share</button>
                    </div>
                </header>
            )}

            <div className="w-full h-[calc(100%-70px)] flex">
                <div className="w-[5%] mt-[15px] h-full bg-gray-100 p-3 flex flex-col items-center justify-between">
                    {['Design', 'Elements', 'Draw', 'Upload', 'Text', 'Projects', 'Images', 'Background'].map((text, idx) => (
                        <React.Fragment key={idx}>
                            {isLoading && (
                                <>
                                    <ContentLoader
                                        speed={2}
                                        width={40}
                                        height={40}
                                        backgroundColor="#cdcdcd"
                                        foregroundColor="#ecebeb"
                                        style={{ marginBottom: '5px', borderRadius: '8px' }}
                                    >
                                        <rect x="0" y="0" width="40" height="40" rx="8" ry="8" />
                                    </ContentLoader>
                                    <p className='text-[10px] w-full text-center -ml-[8px] text-[rgba(0,0,0,0.5)]'>{text}</p>
                                </>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="w-[95%] h-full bg-gray-100 p-4">
                    <div className='w-full flex justify-center'>
                        <img src={Logo} alt="purePixel-Logo" className='aspect-square w-[120px] h-[100px]' loading='lazy' />
                    </div>

                    {isLoading ? (
                        <>
                            <ContentLoader
                                speed={2}
                                width="80%"
                                height={380}
                                backgroundColor="#cdcdcd"
                                foregroundColor="#ecebeb"
                                style={{ width: '80%', marginLeft: '10%', marginBottom: '20px', borderRadius: '6px' }}
                            >
                                <rect x="0" y="0" width="100%" height="100%" rx="6" ry="6" />
                            </ContentLoader>
                            <ContentLoader
                                speed={2}
                                width="80%"
                                height={60}
                                backgroundColor="#cdcdcd"
                                foregroundColor="#ecebeb"
                                style={{ width: '80%', marginLeft: '10%', marginBottom: '10px' }}
                            >
                                <rect x="0" y="0" width="100%" height="100%" />
                            </ContentLoader>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export const cardPlaceHolder = ({ isLoading = true }) => {
    return (
        <div className="w-full flex flex-col">
            <div className="w-full flex justify-center items-center">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <ContentLoader
                                key={idx}
                                speed={2}
                                width={130}
                                height={130}
                                backgroundColor="#cdcdcd"
                                foregroundColor="#ecebeb"
                                style={{ borderRadius: '8px' }}
                            >
                                <rect x="0" y="0" width="150" height="150" />
                            </ContentLoader>
                        ))}
                    </div>
                ) : (
                    <div className="w-full flex justify-center">
                        <img src={Logo} alt="purePixel-Logo" className="aspect-square w-[120px] h-[100px]" loading='lazy' />
                    </div>
                )}
            </div>
        </div>
    );
};

