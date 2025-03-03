import React, { useEffect, useState } from 'react';
import _ from "lodash";
import { getLatestEditedPdf } from '../ServerApi/server';

export default function PdfSidebar({ showPdfUrl }) {

    const [pdfList, setPdfList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const response = await getLatestEditedPdf();
                const data = response.edited_pdfs || [];
                if (data?.length) {
                    setPdfList(data);
                }
            } catch (error) {
                setError('Failed to load PDFs. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchPdfs();
    }, []);

    const handlePdfClick = (item) => {
        localStorage.setItem('editId', item.edit_id);
        showPdfUrl({
            id: item.pdf_id,
            title_name: item.file_name,
            pdfType: item.pdf_type,
            pages: decodeURIComponent(item.embedded_pages),
            edit_id: item.edit_id
        });
    };


    return (
        <React.Fragment>
            {loading ? (
                <div className="loader">Loading PDFs...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : pdfList.length > 0 ? (
                <div className="w-full p-1 bg-[rgba(0,0,0,0.05)] text-gray-700 grid grid-cols-3 gap-1">
                    {pdfList.map((item, i) => {
                        return (
                            <div className='p-2 bg-[rgba(255,255,255,0.6)] cursor-pointer mt-1' onClick={() => handlePdfClick(item)}>
                                <img src={item.imageUrl} alt={item.file_name} className='w-[100px] h-[100px] rounded-md border-[2px] border-solid border-[rgba(0,0,0,0.1)]' loading='lazy' />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="no-pdfs-message text-center">No PDFs found.</p>
            )}
        </React.Fragment>
    );
}
