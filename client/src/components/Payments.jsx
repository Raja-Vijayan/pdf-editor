import React from 'react';
import LeftNavBar from '../components/LeftNavBar';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Payments() {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const { state: paymentDetails } = useLocation();
    const navigate = useNavigate();

    return (
        <div>
            <div className="g-sidenav-show bg-gray-200" style={{ height: '100vh' }}>
                <LeftNavBar />
                <div className="main-content position-relative max-height-vh-800 h-100 border-radius-lg ml-72">
                    <nav className="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                        <div className="container-fluid py-1 px-3">
                            <nav aria-label="breadcrumb">
                                <h6 className="font-weight-bolder mb-0 underline underline-offset-8">Payments</h6>
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
                                            <h6 className="text-white text-capitalize ps-3">Transaction Details</h6>
                                        </div>
                                    </div>
                                    <div className="card-body px-0 pb-2">
                                        <div className="table-responsive p-0">
                                            <table className="table align-items-center mb-0">
                                                <thead>
                                                    <tr>
                                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{role === 'admin' ? 'Name' : 'Yearbook'}</th>
                                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Transaction Id</th>
                                                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Amount</th>
                                                        <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paymentDetails?.length && paymentDetails?.map((paymentdetail) => (
                                                        <tr key={paymentdetail.payment_details}>
                                                            <td>
                                                                <div className="d-flex px-2 py-1">
                                                                    <div>
                                                                        <img src={paymentdetail.yearbook_front_page} className="avatar avatar-sm me-3 border-radius-lg" alt="user1" loading='lazy' />
                                                                    </div>
                                                                    {role === 'admin' && (
                                                                        <div className="d-flex flex-column justify-content-center">
                                                                            <h6 className="mb-0 text-sm">{paymentdetail.name}</h6>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <p className="text-xs font-weight-bold mb-0">{paymentdetail.payment_details}</p>
                                                            </td>
                                                            <td className="align-middle text-center text-sm">
                                                                <span className="badge badge-sm bg-gradient-success">{paymentdetail.status}</span>
                                                            </td>
                                                            <td className="align-middle text-center">
                                                                <span className="text-secondary text-xs font-weight-bold">${paymentdetail.amount}</span>
                                                            </td>
                                                            <td className="align-middle text-center">
                                                                <span className="text-secondary text-xs font-weight-bold">{paymentdetail.payment_date}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
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
