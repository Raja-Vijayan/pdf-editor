import React, { useState, useEffect } from 'react';
import { UploadImageAPI, GetImages } from '../ServerApi/server';
import { CONNECTION_REFUSED } from '../helper/Helpers';
import SuccessPopup from '../components/SuccessPopupMessage';
import RefusedPopup from '../components/RefusedPopupMessage';
import { FaCloudUploadAlt } from "react-icons/fa";
import { AiOutlineClose } from 'react-icons/ai';
import { cardPlaceHolder } from '../helper/PlaceHolder';
import _ from 'lodash';

export default function MyImages({ setAddElement, handleAlert }) {
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopupRefused, setShowPopupRefused] = useState(false);
    const [popupRefusedMessage, setPopupRefusedMessage] = useState('');
    const [myImages, setMyImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [dragData, setDragData] = useState();

    const fetchImages = async () => {
        try {
            const getImagesApiResponse = await GetImages('upload', localStorage.getItem('userId'));
            if (getImagesApiResponse.status === 200) {
                setMyImages(getImagesApiResponse.data.design_assets);
            } else {
                setPopupMessage(getImagesApiResponse.response.data.message);
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 2000);
            }
            setIsLoaded(true);
        } catch (error) {
            setPopupRefusedMessage(CONNECTION_REFUSED);
            setShowPopupRefused(true);
            setTimeout(() => setShowPopupRefused(false), 2000);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length) {
            const updatedFiles = [];

            for (const [index, file] of files.entries()) {
                const imageMetadata = await getImageDimensions(file);

                updatedFiles.push({
                    id: index + 1,
                    name: file.name,
                    size: (file.size / (1024 * 1024)).toFixed(2),
                    preview: URL.createObjectURL(file),
                    file: file,
                    tags: [],
                    dimensions: `${imageMetadata.width}x${imageMetadata.height}`
                });
            }

            const formDataInstance = new FormData();
            updatedFiles.forEach((file) => {
                formDataInstance.append("upload_files", file.file);
                formDataInstance.append("fileName", file.name);
                formDataInstance.append("fileSize", file.size);
                formDataInstance.append("tags", JSON.stringify(file.tags));
                formDataInstance.append("dimensions", file.dimensions);
            });

            formDataInstance.append("user_id", localStorage.getItem("userId"));
            formDataInstance.append("asset_type", "upload");

            setUploadedFiles([...uploadedFiles, ...updatedFiles]);
        }
    };

    const getImageDimensions = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = (err) => {
                reject(err);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleAddTag = async (e, id) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            await setUploadedFiles((prevFiles) =>
                prevFiles.map((file) =>
                    file.id === id ? { ...file, tags: [...file.tags, e.target.value.trim()] } : file
                )
            );
            e.target.value = '';
        }
    };

    const handleRemoveTag = async (id, idx) => {
        const updatedFiles = uploadedFiles.map((file) =>
            file.id === id ? { ...file, tags: file.tags.filter((_, index) => index !== idx) } : file
        );
        await setUploadedFiles(updatedFiles);
    };

    const uploadImage = async () => {
        try {
            const formPayload = new FormData();
            uploadedFiles.forEach((file) => {
                formPayload.append("upload_files", file.file);
                formPayload.append("fileName", file.name);
                formPayload.append("fileSize", file.size);
                formPayload.append("tags", file.tags);
            });
            formPayload.append("user_id", localStorage.getItem("userId"));
            formPayload.append("asset_type", "upload");

            const uploadImageFileResponse = await UploadImageAPI(formPayload);
            if (uploadImageFileResponse.status === 200) {
                fetchImages();
                handleAlert({
                    alertStatus: true,
                    message: "All images uploaded successfully!",
                    apiStatus: "success",
                });
                setUploadedFiles([]);
                setIsModalOpen(false);
            } else {
                setPopupMessage(uploadImageFileResponse.response.data.message);
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 2000);
            }
        } catch (error) {
            setPopupRefusedMessage(CONNECTION_REFUSED);
            setShowPopupRefused(true);
            setTimeout(() => setShowPopupRefused(false), 2000);
        }
    };

    const handleClick = () => {
        document.getElementById('customFileInput').click();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleImageUpload({ target: { files } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDragStart = (type, base64) => {
        setDragData({
            "type": type,
            "base64": base64,
        });

    }
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
            <div className='w-full h-[45px] flex justify-center items-center bg-[#7731d8] rounded-md hover:bg-[#612dae] text-white mb-3'>
                <label className='text-[15px] font-[500] cursor-pointer w-full h-full flex justify-center items-center gap-2 text-white mt-2' htmlFor="fileUpload" onClick={() => setIsModalOpen(true)}>
                    <FaCloudUploadAlt className='text-[19px] font-[500]' /> upload image
                </label>
            </div>

            {isModalOpen && (
                <div className="fixed top-[6%] left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-scroll">
                    <div className="relative w-[90%] h-[85%] bg-white rounded-md shadow-lg p-4 overflow-y-scroll">
                        <div className='flex justify-between border-b-[1.5px] border-solid py-1'>
                            <span className='text-[rgba(0,0,0,0.8)] font-[700] text-[18px]'>Browse and Upload Images</span>
                            <button
                                className="text-gray-500 hover:text-gray-800"
                                onClick={() => { setIsModalOpen(false); setUploadedFiles([]); }}
                            >
                                <AiOutlineClose size={24} />
                            </button>
                        </div>
                        <div className='px-0 pt-4'>
                            <div
                                className={`w-[60%] ml-[20%] h-60 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={handleClick}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-12 h-12 text-gray-400 mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4-4m0 0l-4 4m4-4v12"
                                    />
                                </svg>
                                <p className="text-gray-500 text-sm text-center">
                                    Drag and drop images here, or click to upload
                                </p>
                                <input
                                    id="customFileInput"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="overflow-x-auto mt-4 max-h-[500px] rounded-md">
                                    <table className="min-w-full border-collapse table-fixed">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-700">
                                                <th className="border border-gray-300 px-4 py-2 text-left w-[5%]">S.No</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left w-[10%]">Preview</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left w-[20%]">File Name</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left w-[10%]">Size</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left w-[15%]">Dimension</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left w-[30%]">Tags</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left w-[10%]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="max-h-[400px] overflow-y-auto">
                                            {uploadedFiles.map((file, index) => (
                                                <tr key={file.id} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        <img
                                                            className="w-[80px] h-[80px] object-contain rounded-md bg-white p-2"
                                                            src={file.preview}
                                                            alt={file.name}
                                                            loading='lazy'
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        <input
                                                            type="text"
                                                            defaultValue={file.name}
                                                            onChange={(e) =>
                                                                setUploadedFiles((prev) =>
                                                                    prev.map((f) =>
                                                                        f.id === file.id ? { ...f, name: e.target.value } : f
                                                                    )
                                                                )
                                                            }
                                                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2">{file.size} MB</td>
                                                    <td className="border border-gray-300 px-4 py-2">{file.dimensions}</td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {file.tags.map((tag, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-center bg-gray-200 text-[rgba(0,0,0,0.6)] text-[15px] px-2 py-[3px] rounded-sm"
                                                                >
                                                                    {tag}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveTag(file.id, idx)}
                                                                        className="ml-2 text-[#4c66dd] text-[18px] mt-1"
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <input
                                                                type="text"
                                                                placeholder="Add tags..."
                                                                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                                onKeyDown={(e) => handleAddTag(e, file.id)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        <button
                                                            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-300"
                                                            onClick={() =>
                                                                setUploadedFiles((prev) =>
                                                                    prev.filter((f) => f.id !== file.id)
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            className="bg-[#4c66dd] text-white py-2 px-6 rounded-md hover:bg-indigo-500 transition duration-300"
                                            onClick={uploadImage}
                                        >
                                            Upload All
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className='w-full'>
                <div className="w-full p-1 bg-[rgba(0,0,0,0.05)] text-gray-700 grid grid-cols-3 gap-1">
                    {myImages.map((img, i) => {
                        return (
                            <div className='p-2 bg-[rgba(255,255,255,0.6)] cursor-pointer mt-1' onClick={() => setAddElement('image', `data:image/png;base64,${img.file_base64}`)}>
                                <img src={`data:image/png;base64,${img.file_base64}`} alt={img.name} className='w-[100px] h-[100px] rounded-md border-[2px] border-solid border-[rgba(0,0,0,0.1)]' loading='lazy' draggable onDragStart={() => handleDragStart('image', `data:image/png;base64,${img.file_base64}`)} onDragEnd={handleDragEnd} />
                            </div>
                        );
                    })}
                    {!isLoaded && (
                        <div className="bg-white w-full p-2 shadow rounded cursor-pointer">
                            {cardPlaceHolder(true)}
                        </div>
                    )}
                </div>
            </div>

            {showPopup && (
                <SuccessPopup popupMessage={popupMessage} />
            )}
            {showPopupRefused && (
                <RefusedPopup popupRefusedMessage={popupRefusedMessage} />
            )}
        </div>
    );
}
