import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessCodeAPI, PurchaseYearbookDetailsApi } from '../ServerApi/server';
import SuccessPopup from '../components/SuccessPopupMessage';
import RefusedPopup from '../components/RefusedPopupMessage';
import Cookies from 'js-cookie';
import { CONNECTION_REFUSED } from '../helper/Helpers';
import backgroundVideo from '../assets/video/background_video.mp4';
import PurePixel from '../assets/3pstudio/logo.png';
import { FaArrowRight } from "react-icons/fa";
import { EmailNumberAPI } from '../ServerApi/server';

export default function LoginAccessCode() {
    const [accessCode, setAccessCode] = useState('')
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopupRefused, setShowPopupRefused] = useState(false);
    const [popupRefusedMessage, setPopupRefusedMessage] = useState('');
    const [currentStatus, setCurrentStatus] = useState('default');
    const navigate = useNavigate();

    const [emailNumber, setEmailNumber] = useState('');

    const emailNumberVerification = async () => {

        try {
            console.log("Access code1 :",accessCode)
            const emailNumberApiResponse = await EmailNumberAPI(accessCode, emailNumber);
            const { access_code, access_token, id: userId, role } = emailNumberApiResponse.data.user;

            localStorage.setItem('email', emailNumber);
            localStorage.setItem('access_code', access_code);
            localStorage.setItem('userId', userId);
            localStorage.setItem('role', role);
            Cookies.set('access_token', access_token);

            const sessionLink = sessionStorage.getItem('sessionLink');
            if (sessionLink) {
                window.location.href = sessionLink;
            } else if (role === 'admin') {
                navigate('/dashboard', {
                    state: { role, userId },
                });
            } else if (role === 'student') {
                try {
                    const purchaseYearBookApiResponse = await PurchaseYearbookDetailsApi('purchase', userId);
                    if (purchaseYearBookApiResponse.status === 200) {
                        navigate('/purchase', {
                            state: purchaseYearBookApiResponse.data.purchase_all_yearbook_details,
                        });
                    } else {
                        setPopupMessage(
                            purchaseYearBookApiResponse.response?.data?.message || 'Unexpected error occurred.'
                        );
                        setShowPopup(true);
                        setTimeout(() => setShowPopup(false), 2000);
                    }
                } catch (error) {
                    console.error('Error fetching purchase yearbook details:', error);
                    setPopupRefusedMessage('Connection refused. Please try again.');
                    setShowPopupRefused(true);
                    setTimeout(() => setShowPopupRefused(false), 2000);
                }
            }
        } catch (error) {
            console.error('Error during email number verification:', error);
            setPopupRefusedMessage('Connection refused. Please try again.');
            setShowPopupRefused(true);
            setTimeout(() => setShowPopupRefused(false), 2000);
        }
    };

    useEffect(() => {
        const checkUserAndRole = async () => {
            const userId = localStorage.getItem('userId');
            const role = localStorage.getItem('role');
            if (!userId || !role) {
                Cookies.remove('access_token');
                Cookies.remove('access_token_expiry');
                navigate('/');
            } else {
                if (role === 'admin') {
                    navigate('/dashboard', {
                        state: {
                            role: role,
                            userId: userId
                        }
                    });
                } else {
                    try {
                        const purchaseYearBookApiResponse = await PurchaseYearbookDetailsApi('purchase', userId);
                        if (purchaseYearBookApiResponse.status === 200) {
                            navigate('/purchase', { state: purchaseYearBookApiResponse.data.purchase_all_yearbook_details });
                        } else {
                            setPopupMessage(purchaseYearBookApiResponse.response.data.message);
                            setShowPopup(true);
                            setTimeout(() => setShowPopup(false), 2000);
                        }
                    } catch (error) {
                        setPopupRefusedMessage(CONNECTION_REFUSED);
                        setShowPopupRefused(true);
                        setTimeout(() => setShowPopupRefused(false), 2000);
                    }
                }
            }
        };

        checkUserAndRole();
    }, [navigate]);

    const accessCodeVerification = async () => {
        try {
            const accessCodeApiResponse = await AccessCodeAPI(accessCode);

            if (accessCodeApiResponse.status === 200) {
                setCurrentStatus('email_verification');
                setAccessCode(accessCodeApiResponse.data.access_code);
                console.log("Access code from server:",accessCodeApiResponse.data)
                console.log("Access code2 :",accessCode)
            } else {
                setPopupMessage(accessCodeApiResponse.response.data.message);
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

    return (
        <div>
            <div className="main-content mt-0">
                <div className="relative min-vh-100 flex items-center justify-between">
                    <video src={backgroundVideo} muted autoPlay loop className='absolute w-full h-full' style={{ objectFit: 'unset' }}></video>
                    <span className="mask bg-gradient-to-r from-[#00c5cc70] to-[#7c2ae872]"></span>
                    <div className="container my-auto">
                        <div className="row">
                            <div className="col-lg-6 col-md-8 col-12 mx-auto bg-[rgba(255,255,255,0.2)] rounded-md py-5 cursor-pointer transition-all duration-300 ease-in-out hover:-mt-8" style={{ backdropFilter: 'blur(2px)' }}>
                                <div className="hero-text hero-text-left">
                                    <h1 className="text-[rgba(0,0,0,0.8)] font-serif font-[100]">
                                        Printed yearbooks. <br />Created together online.
                                    </h1>
                                    <p className="h1-subheading hidden-iphone5 text-[rgba(0,0,0,0.8)] no-font-weight underline decoration-[rgba(0,0,0,0.1)] underline-offset-2">
                                        Yearbook Machine is a complete service for producing yearbooks and leavers' books.
                                    </p>
                                    <div className="flex w-full gap-4">
                                        <a className="text-white w-[150px] h-[50px] rounded-sm flex items-center justify-center bg-[#00c4cc] hover:bg-[#00a8b3] transition-colors duration-300" href="https://knowledgebase.3pstudio.us/" target='_blank'>
                                            Start a book
                                        </a>
                                        <a href="" className="text-white w-[150px] h-[50px] rounded-sm flex items-center justify-center bg-purple-500 hover:bg-purple-700 transition-colors duration-300">
                                            Request a sample
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-8 col-12 mx-auto flex items-center">
                                {currentStatus === "default" &&
                                    <div>
                                        <center>
                                            <img src={PurePixel} style={{ width: '150px' }} alt="Logo" loading='lazy' />
                                        </center>
                                        <div className="animated-box mt-6 hover:bg-[#00c5ccd4] transition-all duration-200 ease-in-out">
                                            <span onClick={() => setCurrentStatus('access_code')} className="box-content">
                                                Login
                                                <FaArrowRight className="arrow-icon" />
                                            </span>
                                        </div>
                                    </div>
                                }
                                {currentStatus === "access_code" &&
                                    <div className="card z-index-0 fadeIn3 fadeInBottom w-[95%]">
                                        <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                            <div className="shadow-primary border-radius-lg py-3 pe-1" style={{ backgroundColor: 'rgb(115 170 227)' }} >
                                                <h4 className="text-white font-weight-bolder text-center mt-2 mb-0">Sign in!</h4>
                                                <center>
                                                    <img src={PurePixel} style={{ width: '150px' }} alt="Logo" loading='lazy' />
                                                </center>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <form role="form" className="text-start">
                                                <div className={`input-group input-group-outline mb-3}`}>
                                                    <input
                                                        type="text"
                                                        value={accessCode}
                                                        onChange={(e) => setAccessCode(e.target.value)}
                                                        className="form-control"
                                                        placeholder="Enter Access Code"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                accessCodeVerification();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <button type="button" className="bg-[#3d4142] hover:bg-[#3d4142bf] w-full h-[40px] text-white mt-4 rounded-md" onClick={accessCodeVerification}>
                                                        Submit
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                }
                                {currentStatus === "email_verification" &&
                                    <div class="card z-index-0 fadeIn3 fadeInBottom w-[95%]">
                                        <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                            <div class="shadow-primary border-radius-lg py-3 pe-1" style={{ backgroundColor: 'rgb(115 170 227)' }}>
                                                <h4 class="text-white font-weight-bolder text-center mt-2 mb-0">Sign in!</h4>
                                                <center><img src={PurePixel} style={{ width: '150px' }} loading='lazy' /></center>
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <form role="form" class="text-start">
                                                <div class="input-group input-group-outline mb-3">
                                                    <input
                                                        type="text"
                                                        value={emailNumber}
                                                        onChange={(e) => setEmailNumber(e.target.value)}
                                                        className="form-control"
                                                        placeholder="Enter Email"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                emailNumberVerification();
                                                            }
                                                        }}
                                                    />

                                                </div>
                                                <div class="text-center">
                                                    <button type="button" className="bg-[#3d4142] hover:bg-[#3d4142bf] w-full h-[40px] text-white mt-3 rounded-md" onClick={emailNumberVerification}>
                                                        Submit
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                }
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
            </div>
        </div>
    )
}

