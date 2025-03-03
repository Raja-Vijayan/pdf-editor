import React, { useState, useRef } from 'react'
import LeftNavBar from './LeftNavBar'
import { useNavigate } from 'react-router-dom'
import { UploadImageAPI } from '../ServerApi/server'
import Cookies from 'js-cookie';
import { CONNECTION_REFUSED } from '../helper/Helpers';
import RefusedPopup from '../components/RefusedPopupMessage';
import SuccessPopup from '../components/SuccessPopupMessage'


export default function DesignAssets() {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [name, setName] = useState('');
    const [assetType, setAssetType] = useState('png');
    const fileInputRef = useRef(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopupRefused, setShowPopupRefused] = useState(false);
    const [popupRefusedMessage, setPopupRefusedMessage] = useState('');

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const addDesignAsset = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('asset_type', assetType);
        formData.append('upload_files', image);

        try {
            const designAssetsResponse = await UploadImageAPI(formData)
            setImage(null);
            setName('');
            setAssetType('png');
            fileInputRef.current.value = ''
            setPopupMessage(designAssetsResponse.data.message);
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
        } catch (error) {
            setPopupRefusedMessage(CONNECTION_REFUSED);
            setShowPopupRefused(true);
            setTimeout(() => setShowPopupRefused(false), 2000);
        }
    };

    return (
        <div className="g-sidenav-show bg-gray-200" style={{ height: '100vh' }}>
            <LeftNavBar />
            <div className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ml-72">
                <nav className="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                    <div className="container-fluid py-1 px-3">
                        <nav aria-label="breadcrumb">
                            <h6 className="font-weight-bolder mb-0 underline underline-offset-8">Design Assets</h6>
                        </nav>
                        <div className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">

                            <ul className="navbar-nav  justify-content-end">

                                <li className="nav-item d-flex align-items-center">
                                    <a href="pages/sign-in.html" className="nav-link text-body font-weight-bold px-0">
                                        <i className="fa fa-user me-sm-1"></i>
                                        <span className="d-sm-inline d-none">Sign In</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className='cursor-pointer bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out w-[120px] text-white rounded-md text-center'><h6 className="font-weight-bolder mb-0 text-white rounded-md" onClick={() => { localStorage.removeItem('userId'); localStorage.removeItem('role'); navigate('/') }} style={{ padding: '10px' }}>Logout</h6></div>
                </nav>
                <div className="container-fluid py-4">
                    <div className="row">
                        <div className="col-xl-6 col-sm-6 mb-xl-0 mb-4">
                            <div className="card card-plain">
                                <div className="card-header bg-transparent">
                                    <h4 className="font-weight-bolder">Add Design Asset</h4>
                                </div>
                                <div className="card-body -mt-5">
                                    <form role="form" onSubmit={addDesignAsset}>
                                        <label className="form-label">Name</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <input type="text" className="form-control" style={{ height: '40px' }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter the asset name" required />
                                        </div>
                                        <label className="form-label">File</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageChange}
                                                    required
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#541f8b] file:text-white hover:file:bg-[#6b2aa9] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <label className="form-label">Asset Type</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <select className="form-control" style={{ height: '40px' }} value={assetType} onChange={(e) => setAssetType(e.target.value)} required>
                                                <option>--Select--</option>
                                                <option value='png'>PNG Images</option>
                                                <option value='svg'>SVG Images</option>
                                                <option value='background'>Background Images</option>
                                            </select>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                                <div className="text-center">
                                                    <button type="submit" className="p-2 bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out text-white w-[150px] h-[45px] rounded-md">Save</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showPopup && (
                <SuccessPopup popupMessage={popupMessage} />
            )}
            {showPopupRefused && (
                <RefusedPopup popupRefusedMessage={popupRefusedMessage} />
            )}
        </div>
    )
}