import React, { useState, useEffect } from 'react'
import LeftNavBar from './LeftNavBar'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaCartArrowDown } from "react-icons/fa";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import { AddToCartAPI, createAllYearbookEntry, fakePaymentProcess, createOrder, getInvoiceNumber } from '../ServerApi/server';


export default function AddCart() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [quantity, setQuantity] = useState(1);
    const location = useLocation();
    const { pageCount, pages, yearbook_front_page, tempYearbookId } = location.state || {};
    const pricePerPage = 5;
    const mainPrice = pricePerPage * pageCount * quantity;
    const taxRate = 8.87;
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const taxAmount = (mainPrice * taxRate) / 100;
    const totalCost = mainPrice + taxAmount;
    const formattedTotalCost = totalCost.toFixed(2);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const addOrUpdateCart = async () => {
            const cartData = {
                quantity,
                amount: mainPrice.toFixed(2),
                total_amount: formattedTotalCost,
                user: localStorage.getItem('userId'),
                pages: pageCount,
                tempYearbookId,
                yearbook_front_page,
            };

            try {
                const response = await AddToCartAPI(cartData);
                console.log('Cart added or updated:', response.data);
            } catch (error) {
                console.error('Error updating cart:', error.response?.data);
            }
        };

        addOrUpdateCart();
    }, [quantity, location.state]);

    const increaseQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const formatDateTime = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleDateString('en-US', options);
    };

    const getInvoiceNumberDetails = async () => {
        const getInvoiceNumberAPIResponse = await getInvoiceNumber()
        if (getInvoiceNumberAPIResponse.data.client_status_code === 200) {
            return getInvoiceNumberAPIResponse.data.invoice_number
        } else {
            return null
        }
    }

    const handlePayment = async () => {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        const invoiceNumber = await getInvoiceNumberDetails()
        try {
            const allYearbookResponse = await createAllYearbookEntry(userId, tempYearbookId, formattedTotalCost);
            if (!allYearbookResponse || !allYearbookResponse.data) {
                throw new Error('Failed to create yearbook entry in AllYearBooks');
            }
            const newYearbookId = allYearbookResponse.data.all_yearbook_id;
            navigate('/payment_gateway', { state: { newYearbookId: newYearbookId, userId: userId, invoiceNumber: invoiceNumber, amount: formattedTotalCost } })
        } catch (error) {
            console.error('Payment error', error);
            alert('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="g-sidenav-show  bg-gray-200" style={{ height: '100vh' }}>
            <LeftNavBar />
            <div class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ml-72">
                <nav class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl" id="navbarBlur" data-scroll="true">
                    <div class="container-fluid py-1 px-3">
                        <nav className='w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]'>
                            <h6 class="font-weight-bolder mb-0 underline underline-offset-8">Cart</h6>
                        </nav>
                        <div class="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
                            <ul class="navbar-nav  justify-content-end">
                                <li class="nav-item d-flex align-items-center">
                                    <a href="pages/sign-in.html" class="nav-link text-body font-weight-bold px-0">
                                        <i class="fa fa-user me-sm-1"></i>
                                        <span class="d-sm-inline d-none">Sign In</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className='cursor-pointer bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out w-[120px] text-white rounded-md text-center'><h6 className="font-weight-bolder mb-0 text-white rounded-md" onClick={() => { localStorage.removeItem('userId'); localStorage.removeItem('role'); navigate('/') }} style={{ padding: '10px' }}>Logout</h6></div>
                </nav>

                <div class="container-fluid py-4">

                    <div class="row">

                        <div class="col-md-7 mt-4">
                            <div class="card">
                                <div class="card-header pb-0 px-3">
                                    <h6 class="mb-0 text-[18px] font-bold">Yearbook Information</h6>
                                </div>
                                <div class="card-body pt-4 p-3">
                                    <ul class="list-group">
                                        <li style={{ justifyContent: "space-between" }} class="flex items-center border-0 d-flex bg-gray-100 border-radius-lg h-[205px]" >
                                            <div>
                                                <img
                                                    src={URL.createObjectURL(yearbook_front_page)}
                                                    alt="Yearbook Front Page Thumbnail"
                                                    style={{ width: '100px', height: 'auto', borderRadius: '5px' }}
                                                    loading='lazy'
                                                />
                                            </div>

                                            <div class="d-flex flex-column mr-5">
                                                <h6 class="mb-3 text-sm"></h6>
                                                <span class="mb-2 text-xs"><span className='underline'>Description :</span><span class="text-dark font-weight-bold ms-sm-2 no-underline">Yearbook</span></span>
                                                <span class="mb-2 text-xs flex"><span className='underline mt-[3px]'>Quantity :</span><span class="text-dark ms-sm-2 font-weight-bold" style={{ display: 'flex' }}>
                                                    <CiSquareMinus style={{ fontSize: '22px', cursor: 'pointer' }} onClick={decreaseQuantity} />&nbsp;<span style={{ marginTop: '3px' }}>{quantity}</span>&nbsp;<CiSquarePlus style={{ fontSize: '22px', cursor: 'pointer' }} onClick={increaseQuantity} /></span></span>
                                                <span class="mb-2 text-xs"><span className='underline'>Price :</span><span class="text-dark ms-sm-2 font-weight-bold">$ {mainPrice}</span></span>
                                            </div>
                                        </li>
                                    </ul>

                                    <div class="text-center">
                                        <button
                                            type="button"
                                            class="p-2 bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out text-white w-[250px] h-[45px] text-[14px] rounded-md mt-3"
                                            id='submitEmailButton'
                                            onClick={handlePayment}
                                            disabled={loading}
                                        >
                                            {isPaymentProcessing ? 'Processing Payment...' : `Pay $ ${formattedTotalCost}`}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div class="col-md-5 mt-4">
                            <div class="card h-100 mb-4">
                                <div class="card-header pb-0 px-3">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6 class="mb-0" style={{ display: 'flex' }}>Cart Summary<FaCartArrowDown style={{ marginLeft: '8px', fontSize: '25px' }} /></h6>
                                        </div>

                                    </div>
                                </div>
                                <div class="card-body pt-4 p-3">

                                    <ul class="list-group">

                                        <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                            <div class="d-flex align-items-center">

                                                <div class="d-flex flex-column">
                                                    <h6 class="mb-1 text-dark text-sm">Yearbook Cost</h6>
                                                    <span class="text-xs">{formatDateTime(currentTime)}</span>
                                                </div>
                                            </div>
                                            <div class="d-flex align-items-center text-success text-gradient text-sm font-weight-bold">
                                                $ {mainPrice}
                                            </div>
                                        </li>
                                        <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                            <div class="d-flex align-items-center">

                                                <div class="d-flex flex-column">
                                                    <h6 class="mb-1 text-dark text-sm">NY Sales Tax</h6>
                                                    <span class="text-xs">{formatDateTime(currentTime)}</span>
                                                </div>
                                            </div>
                                            <div class="d-flex align-items-center text-success text-gradient text-sm font-weight-bold">
                                                $ {taxAmount.toFixed(2)} ({taxRate}%)
                                            </div>
                                        </li>
                                        <hr style={{ background: "#000" }} />
                                        <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                            <div class="d-flex align-items-center">

                                                <div class="d-flex flex-column">
                                                    <h6 class="mb-1 text-dark text-sm">Total</h6>
                                                    <span class="text-xs">{formatDateTime(currentTime)}</span>
                                                </div>
                                            </div>
                                            <div class="d-flex align-items-center text-success text-gradient text-sm font-weight-bold">
                                                $ {formattedTotalCost}
                                            </div>
                                        </li>
                                        <hr style={{ background: "#000" }} />
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
