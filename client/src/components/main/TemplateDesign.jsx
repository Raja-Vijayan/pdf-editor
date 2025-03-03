import React, { useEffect, useState } from 'react';
import { cardPlaceHolder } from '../../helper/PlaceHolder';
import _ from "lodash";

export default function TemplateDesign({ showPdfUrl }) {

    const [isOpen, setIsOpen] = useState('yearbook');
    const [yearBook, setYearBook] = useState([]);
    const [businessCard, setBusinessCard] = useState([]);
    const [frames, setFrames] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/accounts/list-pdfs/`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (data?.upload_file_details?.length) {
                    if (data?.upload_file_details[0]['yearbook']?.length) setYearBook(data?.upload_file_details[0]['yearbook']);
                    if (data?.upload_file_details[1]['business_cards']?.length) setBusinessCard(data?.upload_file_details[1]['business_cards']);
                    if (data?.upload_file_details[2]['frames']?.length) setFrames(data?.upload_file_details[2]['frames']);
                }
                setIsLoaded(true);
            } catch (error) {
                console.log('Failed to load PDFs. Please try again.');
            }
        };

        fetchPdfs();
    }, []);

    const toggleAccordion = (section) => {
        setIsOpen((prevSection) => (prevSection === section ? '' : section));
    };

    const handleMouseEnter = (event, item) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setHoveredItem(item);
        setTooltipPosition({
            x: rect.right + 10,
            y: rect.top,
        });
    };

    return (
        <React.Fragment>
            <div className="w-full h-full space-y-4 overflow-y-auto">
                <div className="w-full border rounded-lg shadow-lg overflow-hidden">
                    <button
                        className="w-full text-left py-[10px] px-3 font-semibold text-gray-800 flex justify-between items-center hover:bg-blue-100 transition-all duration-200 ease-in-out sticky top-0 bg-white z-10"
                        onClick={() => toggleAccordion('yearbook')}
                    >
                        <span className="text-md text-[rgba(0,0,0,0.7)]">Yearbook</span>
                    </button>
                    {isOpen === 'yearbook' && (
                        <div className="w-full p-1 bg-[rgba(0,0,0,0.05)] text-gray-700 grid grid-cols-3 gap-1">
                            {yearBook.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-2 bg-[rgba(255,255,255,0.6)] cursor-pointer mt-1"
                                    onMouseEnter={(e) => handleMouseEnter(e, item)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    onClick={() => {
                                        localStorage.removeItem('editId');
                                        showPdfUrl({
                                            id: item.id,
                                            title_name: item.name,
                                            pdfType: item.category,
                                            pages: decodeURIComponent(item.pages),
                                        });
                                    }}
                                >
                                    <img
                                        src={item.upload_image_path}
                                        alt={item.name}
                                        className="w-[100px] h-[100px] rounded-md border-[2px] border-solid border-[rgba(0,0,0,0.1)]"
                                        loading="lazy"
                                        draggable='false'
                                    />
                                </div>
                            ))}

                            {hoveredItem && (
                                <div
                                    className="fixed bg-gradient-to-b from-purple-900 via-[rgba(255,255,255, 0.8)] to-indigo-900 shadow-lg rounded-md p-3 z-50 min-w-[100px] overflow-hidden flex justify-center flex-col items-start"
                                    style={{
                                        top: tooltipPosition.y + 30,
                                        left: tooltipPosition.x - 10,
                                    }}
                                >
                                    <img
                                        src={hoveredItem.upload_image_path}
                                        alt={hoveredItem.name}
                                        className="w-[100px] h-[100px] rounded-md mb-2"
                                        loading='lazy'
                                        draggable='false'
                                    />
                                    <div className="text-white">
                                        <p style={{ lineHeight: '23px', fontSize: '13px' }}>Name - {hoveredItem.name} <br />
                                            Category - {hoveredItem.category}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {!isLoaded && (
                        <div className="bg-white w-full p-2 shadow rounded cursor-pointer">
                            {cardPlaceHolder(true)}
                        </div>
                    )}
                </div>

                {frames?.length ? <div className="w-full border rounded-lg shadow-lg overflow-hidden">
                    <button
                        className="w-full text-left py-[10px] px-3 font-semibold text-gray-800 flex justify-between items-center hover:bg-blue-100 transition-all duration-200 ease-in-out sticky top-0 bg-white z-10"
                        onClick={() => toggleAccordion('frames')}
                    >
                        <span className="text-md text-[rgba(0,0,0,0.7)]">Frames</span>
                    </button>
                    {isOpen === 'frames' && (
                        <div className="w-full p-1 bg-[rgba(0,0,0,0.05)] text-gray-700 grid grid-cols-3 gap-1">
                            {frames.map((item, i) => {
                                return (
                                    <div className="p-2 bg-[rgba(255,255,255,0.6)] cursor-pointer mt-1">
                                        <img
                                            key={i}
                                            className="w-[100px] h-[100px] rounded-md border-[2px] border-solid border-[rgba(0,0,0,0.1)]"
                                            src={item.upload_image_path}
                                            onClick={() => showPdfUrl({ id: item.id, title_name: item.name, pdfType: item.category, pages: decodeURIComponent(item.pages) })}
                                            alt={item.name}
                                            loading='lazy'
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div> : <></>}
            </div>
        </React.Fragment>

    );
}
