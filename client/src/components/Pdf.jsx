import React from 'react';
import PdfSidebar from './PdfSidebar';
import { FaCloudUploadAlt } from "react-icons/fa";

export default function Pdf({ setPdfUrl, showPdfUrl }) {
    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            const formData = new FormData();
            formData.append('Sample', file);

            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/accounts/upload-pdf/`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    await response.json();
                    setPdfUrl(URL.createObjectURL(file));
                } else {
                    const errorResult = await response.json();
                    alert(`Error: ${errorResult.error}`);
                }
            } catch (error) {
                alert('An error occurred while uploading the PDF.');
            }
        } else {
            alert('Please upload a PDF file.');
        }
    };

    return (
        <div className='flex justify-start items-start flex-col scrollbar-hide w-full overflow-hidden'>

            {/* Need to handle this upload feature in admin side..  */}

            {/* <div className='w-full h-[40px] flex justify-center items-center bg-[#7731d8] rounded-md hover:bg-[#612dae] text-white mb-3'>
                <label className='cursor-pointer flex justify-center items-center gap-2 text-white mt-2' htmlFor="fileUpload">
                    <FaCloudUploadAlt className='text-[18px] font-[500]' /> upload pdf
                </label>
                <input
                    type='file'
                    id='fileUpload'
                    accept="application/pdf"
                    className='hidden'
                    onChange={handleUpload}
                />
            </div> */}

            <p className='sticky top-0 border-[1px] border-solid py-[7px] px-3 w-full shadow-sm bg-[#333] text-white' style={{ clipPath: "polygon(0 1%, 100% 0%, 91% 100%, 0% 100%)" }}>Manage Your Projects</p>
            <div className='w-full'>
                <PdfSidebar showPdfUrl={showPdfUrl} />
            </div>
        </div>
    );
}
