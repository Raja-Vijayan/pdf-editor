import React, { useState } from 'react';
import Frame from "../assets/img/frame.webp";
import Element from "../assets/img/editor.webp";

export default function Elements({ myImages, setAddElement }) {
    const [isOpen, setIsOpen] = useState('frames');
    const [dragData, setDragData] = useState();
    const handleDragStart = (type, base64) => {
        setDragData({
            "type": type,
            "base64": base64,
        });
    };

    const toggleAccordion = (section) => {
        setIsOpen((prevSection) => (prevSection === section ? '' : section));
    };

    const handleDragEnd = (e) => {
        const { clientX, clientY } = e;

        const pages = document.querySelectorAll('.pdfPage');
        let droppedOnPage = null;

        pages.forEach((page) => {
            const rect = page.getBoundingClientRect();

            if (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            ) {
                droppedOnPage = page;
            }
        });

        if (droppedOnPage) {
            const pageRect = droppedOnPage.getBoundingClientRect();
            const relativeX = clientX - pageRect.left;
            const relativeY = clientY - pageRect.top;

            setAddElement(dragData.type, dragData.base64, relativeX, relativeY, droppedOnPage);
        }

        setDragData(null);
    };

    return (
        <div className="w-full h-full space-y-4 overflow-y-auto">
            <div className="w-full border rounded-lg shadow-lg overflow-hidden">
                <button
                    className="w-full text-left py-[10px] px-3 font-semibold text-gray-800 flex justify-between items-center hover:bg-blue-100 transition-all duration-200 ease-in-out sticky top-0 bg-white z-10"
                    onClick={() => toggleAccordion('frames')}
                >
                    <span className="text-md text-[rgba(0,0,0,0.7)]">Frames</span>
                    <span className="text-[rgba(0,0,0,0.7)]">
                        <img src={Frame} alt="frame-icon" className='w-[30px]' loading='lazy' />
                    </span>
                </button>
                {isOpen === 'frames' && (
                    <div className="p-1 bg-blue-50 text-gray-700 transition-all duration-300 ease-in-out grid grid-cols-3 gap-1">
                        <div className="relative bg-white p-2 shadow rounded cursor-pointer">
                            <div
                                className="w-[100px] h-[100px]"
                                draggable
                                onDragStart={() => handleDragStart('frame', 'box-default')}
                                onDragEnd={handleDragEnd}
                            >
                                <svg
                                    width="100"
                                    height="100"
                                    viewBox="0 0 145 130"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-[100px] h-[100px]"
                                >
                                    <rect
                                        x="5"
                                        y="5"
                                        width="123"
                                        height="120"
                                        fill="none"
                                        stroke="rgba(0, 0, 0, 0.4)"
                                        strokeWidth="1"
                                        strokeDasharray="4"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="relative bg-white p-2 shadow rounded cursor-pointer">
                            <div
                                className="w-[100px] h-[100px]"
                                draggable
                                onDragStart={() => handleDragStart('frame', 'box-corner')}
                                onDragEnd={handleDragEnd}
                            >
                                <svg
                                    width="100"
                                    height="100"
                                    viewBox="0 0 100 100"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-[100px] h-[100px] mt-1"
                                >
                                    <rect
                                        x="5"
                                        y="5"
                                        width="83"
                                        height="84"
                                        rx="15"
                                        fill="none"
                                        stroke="rgba(0, 0, 0, 0.4)"
                                        strokeWidth="1"
                                        strokeDasharray="4"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="relative bg-white p-2 shadow rounded cursor-pointer">
                            <div
                                className="w-[100px] h-[100px]"
                                style={{ clipPath: 'circle(50% at 50% 50%)' }}
                                draggable
                                onDragStart={() => handleDragStart('frame', 'circle(50% at 50% 50%)')}
                                onDragEnd={handleDragEnd}
                            >
                                <svg width="100px" height="100px" className="w-full h-full -ml-1">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="45%"
                                        fill="none"
                                        stroke="rgba(0, 0, 0, 0.4)"
                                        strokeWidth="1"
                                        strokeDasharray="4"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Elements Accordion */}
            <div className="w-full border rounded-lg shadow-lg overflow-hidden">
                <button
                    className="w-full text-left py-[13px] px-3 font-semibold text-gray-800 flex justify-between items-center hover:bg-green-100 transition-all duration-200 ease-in-out sticky top-0 bg-white z-10"
                    onClick={() => toggleAccordion('elements')}
                >
                    <span className="text-md text-[rgba(0,0,0,0.7)]">Elements</span>
                    <span className="text-[rgba(0,0,0,0.7)]">
                        <img src={Element} alt="elements" className='w-[30px] h-[20px]' loading='lazy' />
                    </span>
                </button>
                {isOpen === 'elements' && (
                    <div className="p-1 bg-[rgba(0,0,0,0.05)] text-gray-700 transition-all duration-300 ease-in-out grid grid-cols-2 gap-1">
                        {myImages.map((img, i) => {
                            const isSvg = img.file_base64.startsWith('PD94bWw');
                            return (
                                <div key={i} className="bg-white p-2 shadow rounded cursor-pointer">
                                    {isSvg ? (
                                        <div
                                            className="w-32 h-32 object-cover rounded flex justify-center items-center"
                                            dangerouslySetInnerHTML={{
                                                __html: atob(img.file_base64),
                                            }}
                                            draggable
                                            onDragStart={() => handleDragStart("svg", img.file_base64)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => setAddElement('svg', img.file_base64)}
                                        ></div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
