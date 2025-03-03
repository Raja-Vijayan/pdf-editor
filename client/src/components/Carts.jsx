import React, { useState, useEffect } from 'react';
import LeftNavBar from '../components/LeftNavBar';
import { useNavigate } from 'react-router-dom';
import { GetCarts } from '../ServerApi/server';
import axios from 'axios';

export default function Carts() {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId');

        if (!userId) {
            console.warn('User ID is not provided. Redirecting to login.');
            navigate('/');
            return;
        }

        const fetchCarts = async () => {
            try {
                const response = await GetCarts(userId);
                console.log('Response from GetCarts:', response);

                if (response.status === 200) {
                    console.log(response.data);
                    setCarts(response.data);
                } else {

                }
            } catch (error) {
                console.error('Error fetching carts:', error);
                setError('An error occurred while fetching carts.');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };


        fetchCarts();
    }, [navigate]);

    const handleBuyNow = async (cart) => {
        try {
            const { total_amount, yearbook_id } = cart;

            if (!yearbook_id) {
                console.error('Yearbook ID is not available.');
                return;
            }

            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/accounts/process_payment/`, {
                params: {
                    total_amount,
                    yearbook_id: yearbook_id,
                },
            });

            if (response.data.status_code === 200) {
                const confirmationResponse = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/accounts/order_confirmation/`, {
                    total_amount,
                    yearbook_id: yearbook_id,
                    session_token: response.data.session_token,
                });

                if (confirmationResponse.status === 200) {
                    navigate('/confirmation', { state: { sessionToken: response.data.session_token } });
                } else {
                    console.error('Order confirmation failed:', confirmationResponse.data.message);
                }
            } else {
                console.error('Payment processing failed:', response.data.message);
            }
        } catch (error) {
            console.error('Error processing payment or confirming order:', error);
        }
    };

    return (
        <div>
            <div className="g-sidenav-show bg-gray-200" style={{ height: '100vh' }}>
                <LeftNavBar />
                <div className="main-content position-relative max-height-vh-800 h-100 border-radius-lg ml-72">
                    <nav className="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                        <div className="container-fluid py-1 px-3">
                            <nav aria-label="breadcrumb">
                                <h6 className="font-weight-bolder mb-0 underline underline-offset-8">Carts</h6>
                            </nav>
                        </div>
                        <div className='cursor-pointer bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out w-[120px] text-white rounded-md text-center'>
                            <h6 className="font-weight-bolder mb-0 text-white rounded-md" onClick={() => { localStorage.removeItem('userId'); localStorage.removeItem('role'); navigate('/') }} style={{ padding: '10px' }}>Logout</h6>
                        </div>
                    </nav>
                    <div className="container-fluid py-4">
                        <div className="row">
                            <div className="col-12">
                                <div className="card my-4">
                                    <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                        <div className="shadow-primary border-radius-lg pt-4 pb-3 bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3]">
                                            <h6 className="text-white text-capitalize ps-3">Cart Items</h6>
                                        </div>
                                    </div>
                                    <div className="card-body px-0 pb-2">
                                        <div className="table-responsive p-0">
                                            <table className="table align-items-center mb-0">
                                                <thead>
                                                    <tr>
                                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Yearbook</th>
                                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Quantity</th>
                                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Quantity Amount</th>
                                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total Amount</th>
                                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date</th>
                                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Buy Now</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {carts.map((cart, index) => {
                                                        console.log('Cart Data:', cart);
                                                        return (
                                                            <tr key={index}>
                                                                <td>
                                                                    <div className="d-flex px-2 py-1">
                                                                        <div>
                                                                            <img
                                                                                src={cart.yearbook_front_page ? `${process.env.REACT_APP_SERVER_URL}${cart.yearbook_front_page}` : 'default_image_url.jpg'}
                                                                                className="avatar avatar-sm me-3 border-radius-lg"
                                                                                alt="Yearbook Front Page"
                                                                                loading='lazy'
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <p className="text-xs font-weight-bold mb-0">{cart.quantity}</p>
                                                                </td>
                                                                <td>
                                                                    <p className="text-xs font-weight-bold mb-0">
                                                                        ${cart.amount ? cart.amount : 'N/A'}
                                                                    </p>
                                                                </td>
                                                                <td>
                                                                    <p className="text-xs font-weight-bold mb-0">${cart.total_amount}</p>
                                                                </td>
                                                                <td>
                                                                    <span className="text-secondary text-xs font-weight-bold">{new Date(cart.date).toLocaleDateString()}</span>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-primary btn-sm"
                                                                        onClick={() => handleBuyNow(cart)}
                                                                    >
                                                                        Buy Now
                                                                    </button>
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
        </div>
    );
}

