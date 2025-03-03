import React, { useState } from 'react'
import { MdOutlineDashboard, MdDesignServices } from "react-icons/md";
import { SlNote } from "react-icons/sl";
import { FaAmazonPay, FaUser } from "react-icons/fa";
import { RiSchoolLine } from "react-icons/ri";
import { FaUsersGear, FaCartShopping, FaLink } from "react-icons/fa6";
import { GiSecretBook } from "react-icons/gi";
import { BiPurchaseTag } from "react-icons/bi";
import { IoIosCreate } from "react-icons/io";
import { IoCloudUpload } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { UserDetailsApi, AdminOrdersDetailsApi, PaymentDetailsApi, PurchaseYearbookDetailsApi } from '../ServerApi/server'
import { CONNECTION_REFUSED } from '../helper/Helpers'
import { Link } from 'react-router-dom';
import Links from './Links';
import PurePixel from '../assets/3pstudio/logo.png';

export default function LeftNavBar() {

    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopupRefused, setShowPopupRefused] = useState(false);
    const [popupRefusedMessage, setPopupRefusedMessage] = useState('');

    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')

    const userDetailsApi = async () => {

        try {
            const userDetailsApiResponse = await UserDetailsApi();

            if (userDetailsApiResponse.status === 200) {
                navigate('/profile', { state: { allUserDetails: userDetailsApiResponse.data.custom_user_details } })
            } else {
                setPopupMessage(userDetailsApiResponse.response.data.message);
                setShowPopup(true);
                setTimeout(() => {
                    setShowPopup(false);
                }, 2000);
            }
        } catch (error) {
            setPopupRefusedMessage(CONNECTION_REFUSED);
            setShowPopupRefused(true);
            setTimeout(() => {
                setShowPopupRefused(false);
            }, 2000);
        }
    }

    const adminAndUserordersApi = async () => {
        try {
            const adminAndUserordersApiResponse = await AdminOrdersDetailsApi(userId, role);

            if (adminAndUserordersApiResponse.status === 200) {
                navigate('/orders', { state: { orderDetails: adminAndUserordersApiResponse.data.all_order_status } })
            } else {
                setPopupMessage(adminAndUserordersApiResponse.response.data.message);
                setShowPopup(true);
                setTimeout(() => {
                    setShowPopup(false);
                }, 2000);
            }
        } catch (error) {
            setPopupRefusedMessage(CONNECTION_REFUSED);
            setShowPopupRefused(true);
            setTimeout(() => {
                setShowPopupRefused(false);
            }, 2000);
        }
    }

    const paymentdetailsApi = async () => {
        try {
            const paymentdetailsApiResponse = await PaymentDetailsApi(userId, role);
            if (paymentdetailsApiResponse.status === 200) {
                navigate('/payments', { state: paymentdetailsApiResponse.data.all_payment_details })
            } else {
                setPopupMessage(paymentdetailsApiResponse.response.data.message);
                setShowPopup(true);
                setTimeout(() => {
                    setShowPopup(false);
                }, 2000);
            }
        } catch (error) {
            setPopupRefusedMessage(CONNECTION_REFUSED);
            setShowPopupRefused(true);
            setTimeout(() => {
                setShowPopupRefused(false);
            }, 2000);
        }
    }


    const handleNavClick = (moduleName, callback) => {
        callback();
    };

    const adminDashboard = () => {
        navigate('/dashboard', {
            state: {
                role: role,
                userId: userId
            }
        })
    }

    const designAssets = () => {
        navigate('/design_assets')
    }

    const schools = () => {
        navigate('/schools')
    }

    const purchaseYearBook = async (yearbookOption) => {
        try {
            const purchaseYearBookApiResponse = await PurchaseYearbookDetailsApi(yearbookOption, userId);
            if (purchaseYearBookApiResponse.status === 200) {
                yearbookOption === 'purchase' ? navigate('/purchase', { state: purchaseYearBookApiResponse.data.purchase_all_yearbook_details }) : navigate('/saved_yearbook', { state: purchaseYearBookApiResponse.data.yearbook_serializer })
            } else {
                setPopupMessage(purchaseYearBookApiResponse.response.data.message);
                setShowPopup(true);
                setTimeout(() => {
                    setShowPopup(false);
                }, 2000);
            }
        } catch (error) {
            setPopupRefusedMessage(CONNECTION_REFUSED);
            setShowPopupRefused(true);
            setTimeout(() => {
                setShowPopupRefused(false);
            }, 2000);
        }
    }

    const CreateUser = () => {
        navigate('/create_user')
    }

    const UploadFiles = () => {
        navigate('/upload_files')
    }

    return (
        <aside className="fixed top-0 left-0 w-72 bg-gradient-to-b from-purple-900 via-indigo-800 to-indigo-900 text-gray-200 shadow-2xl h-screen overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0 font-sans">

            <div className="sidenav-header flex items-center justify-between px-4 py-5 border-b border-indigo-700">
                <div className="flex items-center">
                    <img src={PurePixel} className="mr-3 shadow-md w-[95px] h-[70px] p-1 rounded-sm bg-[rgba(255,255,255, 0.5)] cursor-pointer" alt="main_logo" loading='lazy' />
                </div>
            </div>

            <hr className="border-indigo-700" />

            <div className="navbar-collapse w-auto">
                <ul className="navbar-nav">
                    {role === 'admin' && (
                        <>
                            <li className="nav-item">
                                <h6 className="ps-4 text-uppercase text-[17px] text-white font-weight-bolder opacity-8">Admin Panel</h6>
                            </li>
                            <li className={`nav-item`}>
                                <a className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/dashboard' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('dashboard', adminDashboard)}>
                                    <MdOutlineDashboard className="me-2" />
                                    <span>Dashboard</span>
                                </a>
                            </li>
                            <li className={`nav-item`}>
                                <a className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/design_assets' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('design_assets', designAssets)}>
                                    <MdDesignServices className="me-2" />
                                    <span>Design Assets</span>
                                </a>
                            </li>
                            <li className={`nav-item`}>
                                <a className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/orders' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('orders', adminAndUserordersApi)}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <SlNote style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Orders</span>
                                </a>
                            </li>
                            <li className={`nav-item`}>
                                <Link to={'/payments'} className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/payments' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('payments', paymentdetailsApi)}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <FaAmazonPay style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Payments</span>
                                </Link>
                            </li>
                            <li className={`nav-item`}>
                                <a className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/schools' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('schools', schools)}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <RiSchoolLine style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Schools</span>
                                </a>
                            </li>
                            <li className={`nav-item`}>
                                <a className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/profile' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('users', userDetailsApi)}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <FaUsersGear style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Users</span>
                                </a>
                            </li>
                            <li className={`nav-item`}>
                                <a className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/create_user' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('create_user', CreateUser)}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <FaUser style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Create User</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/upload_files' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={UploadFiles}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <IoCloudUpload style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Upload Files</span>
                                </a>
                            </li>
                        </>)}
                    {role === 'student' && (
                        <>
                            <li className="nav-item">
                                <h6 className="ps-4 text-uppercase text-[17px] text-white font-weight-bolder opacity-8">User Panel</h6>
                            </li>
                            <li className={`nav-item`}>
                                <a className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/purchase' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('purchase', () => purchaseYearBook('purchase'))}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <BiPurchaseTag style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Purchase Yearbooks</span>
                                </a>
                            </li>
                            <li className={`nav-item`}>
                                <Link to={'/design/edit'} className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white`}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <IoIosCreate style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Create Yearbook</span>
                                </Link>
                            </li>
                            <li className={`nav-item`}>
                                <Link to={'/saved'} className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/saved' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('saved', () => purchaseYearBook('saved'))}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <GiSecretBook style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Saved Yearbooks</span>
                                </Link>
                            </li>
                            <li className={`nav-item`}>
                                <Link to={'/payments'} className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/payments' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('payments', paymentdetailsApi)}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <FaAmazonPay style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Payments</span>
                                </Link>
                            </li>
                            <li className={`nav-item`}>
                                <a className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/orders' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`} onClick={() => handleNavClick('orders', adminAndUserordersApi)}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <SlNote style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Orders</span>
                                </a>
                            </li>
                            <li className={`nav-item`}>
                                <Link to="/carts" className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/carts' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <FaCartShopping style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Carts</span>
                                </Link>
                            </li>

                            <li className={`nav-item`}>
                                <Link to="/links" className={`flex justify-start items-center px-4 py-3 hover:bg-[rgba(255,255,255,0.1)] w-full cursor-pointer transition-all duration-200 ease-in-out text-white ${window.location.pathname === '/links' ? 'bg-[rgba(255,255,255,0.1)]' : ''}`}>
                                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                        <FaLink style={{ fontSize: 'large' }} />
                                    </div>
                                    <span className="nav-link-text ms-1">Links</span>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </aside>
    )
}