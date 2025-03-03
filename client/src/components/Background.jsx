import React, { useState } from 'react';
import { cardPlaceHolder } from '../helper/PlaceHolder';

export default function Background({ myImages, setAddElement, isLoaded }) {

    const [hoveredItem, setHoveredItem] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [dragData, setDragData] = useState();
    const handleDragStart = (type, base64) => {
        setDragData({
            "type": type,
            "base64": base64,
        });
    };

    const handleMouseEnter = (event, item) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setHoveredItem(item);
        setTooltipPosition({
            x: rect.right + 10,
            y: rect.top,
        });
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
        <div className='w-full'>
            <p className='sticky top-0 border-[1px] border-solid py-[7px] px-1 w-full shadow-sm bg-[#333] text-white' style={{ clipPath: "polygon(0 1%, 100% 0%, 91% 100%, 0% 100%)" }}>Select Your Background Images</p>
            <div className="w-full p-1 bg-[rgba(0,0,0,0.05)] text-gray-700 grid grid-cols-3 gap-1">
                {myImages.map((img, i) => {
                    const dragImageRef = React.createRef();
                    return (
                        <div
                            className='p-2 bg-[rgba(255,255,255,0.6)] cursor-pointer mt-1'
                            key={i}
                            onClick={() => setAddElement('image', `data:image/png;base64,${img.file_base64}`)}
                            onMouseEnter={(e) => handleMouseEnter(e, img)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <img
                                ref={dragImageRef}
                                src={`data:image/png;base64,${img.file_base64}`}
                                alt={img.name}
                                className='w-[100px] h-[100px] rounded-md border-[2px] border-solid border-[rgba(0,0,0,0.1)]'
                                loading='lazy'
                                draggable
                                onDragStart={(e) => {
                                    setHoveredItem(false);
                                    handleDragStart('image', `data:image/png;base64,${img.file_base64}`);
                                    if (dragImageRef.current) {
                                        e.dataTransfer.setDragImage(dragImageRef.current, 65, 65);
                                    }
                                }}
                                onDragEnd={handleDragEnd}
                            />
                        </div>
                    );
                })}
                {hoveredItem && (
                    <div
                        className="fixed bg-gradient-to-b from-purple-900 via-[rgba(255,255,255, 0.8)] to-indigo-900 shadow-lg rounded-md p-3 z-50 min-w-[100px] overflow-hidden flex justify-center flex-col items-start"
                        style={{
                            top: tooltipPosition.y + 30,
                            left: tooltipPosition.x - 10,
                        }}
                    >
                        <img
                            src={`data:image/png;base64,${hoveredItem.file_base64}`}
                            alt={hoveredItem.name}
                            className="w-[100px] h-[100px] rounded-md mb-2"
                            loading='lazy'
                        />
                        <div className="text-white">
                            <p style={{ lineHeight: '23px', fontSize: '13px' }}>Name - {hoveredItem.name}</p>
                        </div>
                    </div>
                )}
            </div>
            {!isLoaded && (
                <div className="bg-white w-full p-2 shadow rounded cursor-pointer">
                    {cardPlaceHolder(true)}
                </div>
            )}
        </div>
    );
}
