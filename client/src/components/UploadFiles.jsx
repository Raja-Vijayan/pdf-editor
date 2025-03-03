import React, { useState, useEffect } from 'react';
import LeftNavBar from '../components/LeftNavBar';
import { useNavigate } from 'react-router-dom';
import { UploadPDFFileApi } from '../ServerApi/server';
import _ from "lodash";

export default function UploadFiles() {
    const navigate = useNavigate();
    const [pdfList, setPdfList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [storedHTML, setStoredHtml] = useState([]);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [keywords, setKeywords] = useState('');
    const [pageContent, setPageContent] = useState('');
    const [uploadStatus, setUploadStatus] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPdfs = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/accounts/list-pdfs/`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            let pages = []
            for (let upload_image_details of data.all_category_details) {
                pages.push({
                    'upload_image_path': upload_image_details.upload_image_path,
                    'name': upload_image_details.name,
                    'keywords': upload_image_details.keywords ? JSON.parse(upload_image_details.keywords.replace(/'/g, '"')) : [],
                    'category': upload_image_details.category
                });
            }
            setPdfList(pages);
        } catch (error) {
            setError('Failed to load PDFs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleModal = () => {
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const fileInput = e.target.elements.pdfImageUpload;
        const files = fileInput ? fileInput.files : [];
        const formData = new FormData();
        var keywords = ['card', 'pdf']
        formData.append('pages', encodeURIComponent(pageContent));
        formData.append('name', name);
        formData.append('keywords', keywords);
        formData.append('category', category);
        Array.from(files).forEach((file, index) => {
            formData.append(`upload_image_${index}`, file);
        });
        const uploadPDFFileApiResponse = await UploadPDFFileApi(formData);
        setStoredHtml([])
        fetchPdfs();
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchPdfs();
    }, [uploadStatus]);


    return (
        <div>
            <div className="g-sidenav-show bg-gray-200" style={{ height: '100vh' }}>
                <LeftNavBar />
                <div className="main-content position-relative max-height-vh-800 h-100 border-radius-lg ml-72">
                    <nav className="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                        <div className="container-fluid py-1 px-3">
                            <nav aria-label="breadcrumb">
                                <h6 className="font-weight-bolder mb-0 underline underline-offset-8">Upload Files</h6>
                            </nav>
                        </div>
                        <div className='cursor-pointer bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out w-[120px] text-white rounded-md text-center'>
                            <h6 className="font-weight-bolder mb-0 text-white rounded-md" onClick={() => { localStorage.removeItem('userId'); localStorage.removeItem('role'); navigate('/') }} style={{ padding: '10px' }}>Logout</h6>
                        </div>
                    </nav>
                    <div className="container-fluid py-4">
                        <div className="row" style={{ marginBottom: '25px' }} >
                            <div style={{ textAlign: 'end' }}>
                                <button class='bg-[#541f8b] hover:bg-[#6b2aa9] upload-file' onClick={toggleModal}>Upload File</button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <div className="card my-4">
                                    <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                        <div className="shadow-primary border-radius-lg pt-4 pb-3 bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3]">
                                            <h6 className="text-white text-capitalize ps-3">Upload Files</h6>
                                        </div>
                                    </div>
                                    <div className="card-body px-0 pb-2">
                                        <div className="table-responsive p-0" style={{ overflowY: 'hidden' }}>
                                            <table className="table align-items-center mb-0">
                                                <thead>
                                                    <tr>
                                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2"><span>PDF File</span></th>
                                                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ paddingRight: '160px' }}>Name</th>
                                                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ paddingRight: '160px' }}>Category</th>
                                                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ paddingRight: '160px' }}>Keywords</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {_.map(pdfList, (item, index) => {
                                                        return (
                                                            <tr>
                                                                <td>
                                                                    <img src={item.upload_image_path} alt="Thumbnail" className='w-[150px] h-[150px] object-contain' loading='lazy' />
                                                                </td>
                                                                <td style={{ paddingRight: '150px' }} className="align-middle text-center text-sm">
                                                                    <span className="text-secondary text-xs font-weight-bold">{item.name}</span>
                                                                </td>
                                                                <td style={{ paddingRight: '150px' }} className="align-middle text-center">
                                                                    <span className="text-secondary text-xs font-weight-bold">{item.category}</span>
                                                                </td>
                                                                <td style={{ paddingRight: '150px' }} className="align-middle text-center">
                                                                    <ul>
                                                                        {item.keywords.map((keyword, index) => (
                                                                            <li key={index} className="text-secondary text-xs font-weight-bold">
                                                                                {keyword}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ backgroundColor: 'white', width: '34%', borderRadius: '10px' }} >
                        <button onClick={(e) => setIsModalOpen(false)} className="close-modal" style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '8px', marginRight: '10px' }}>X</button>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mb-3">
                                <label htmlFor="exampleInputName" className="form-label">Template Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="exampleInputName"
                                    aria-describedby="emailHelp"
                                    required
                                    autoComplete="username"
                                    style={{ border: '1px solid #d2d6da', padding: '5px', height: '40px' }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder='Enter template name'
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="categorySelect" className="form-label">Category</label>
                                <select
                                    className="form-control"
                                    id="categorySelect"
                                    required
                                    style={{ border: '1px solid #d2d6da', height: 'unset', padding: '5px', height: '40px' }}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="" disabled selected>Select Category</option>
                                    <option value="yearbook">Yearbook</option>
                                    <option value="frames">Frames</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="exampleInputKeywords" className="form-label">Keywords</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="exampleInputKeywords"
                                    required
                                    autoComplete="new-password"
                                    style={{ border: '1px solid #d2d6da', padding: '5px', height: '40px' }}
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder='Enter keywords for a search'
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="pdfImageUpload" className="form-label">Upload Image</label>
                                <div className="input-group input-group-outline mb-3">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="pdfImageUpload"
                                            accept='image/*'
                                            required
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#541f8b] file:text-white hover:file:bg-[#6b2aa9] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="keywordsTextareaPageContent" className="form-label">Page Content</label>
                                <textarea
                                    className="form-control"
                                    id="keywordsTextareaPageContent"
                                    required
                                    rows="4"
                                    style={{ border: '1px solid #d2d6da', padding: '5px', height: '100px', resize: 'none', overflowY: 'scroll' }}
                                    value={pageContent}
                                    onChange={(e) => setPageContent(e.target.value)}
                                    placeholder='Paste your html here...'
                                ></textarea>
                            </div>
                            <div style={{ textAlign: 'end' }}>
                                <button type="submit" id="saveNewCreateUser" className="p-2 bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out text-white w-[150px] h-[45px] rounded-md" >Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

