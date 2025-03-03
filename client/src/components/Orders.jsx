import React from 'react'
import LeftNavBar from '../components/LeftNavBar'
import { FiDownload } from "react-icons/fi";
import { useNavigate, useLocation } from 'react-router-dom'

export default function Orders() {

    const role = localStorage.getItem('role')
    const navigate = useNavigate();

    const { state: orderDetails } = useLocation();

    var acceptedList = []
    var processedList = []
    var dispatchedList = []
    if (role === 'admin') {
        acceptedList = orderDetails?.orderDetails[0]?.accepted || [];
        processedList = orderDetails?.orderDetails[1]?.processed || [];
        dispatchedList = orderDetails?.orderDetails[2]?.dispatched || [];
    } else {
        var userOrdersList = orderDetails?.orderDetails || [];
    }

    return (
        <div>
            <div class="g-sidenav-show bg-gray-200" style={{ height: '100vh' }}>
                <LeftNavBar />
                <div class="main-content position-relative max-height-vh-800 h-100 border-radius-lg ml-72">
                    <nav class="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                        <div class="container-fluid py-1 px-3">
                            <nav aria-label="breadcrumb">
                                <h6 class="font-weight-bolder mb-0 underline underline-offset-8">Orders</h6>
                            </nav>
                        </div>
                        <div className='cursor-pointer bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out w-[120px] text-white rounded-md text-center'><h6 className="font-weight-bolder mb-0 text-white rounded-md" onClick={() => { localStorage.removeItem('userId'); localStorage.removeItem('role'); navigate('/') }} style={{ padding: '10px' }}>Logout</h6></div>
                    </nav>
                    <div class="container-fluid py-4">
                        {role === 'admin' && (
                            <>  {acceptedList && (
                                <div class="row">
                                    <div class="col-12">
                                        <div class="card my-4">
                                            <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                                <div class="shadow-primary border-radius-lg pt-4 pb-3 bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3]">
                                                    <h6 class="text-white text-capitalize ps-3">Current Orders</h6>
                                                </div>
                                            </div>
                                            <div class="card-body px-0 pb-2">
                                                <div class="table-responsive p-0">
                                                    <table class="table align-items-center mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Name</th>
                                                                {/* <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Amount</th> */}
                                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Yearbook</th>
                                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date</th>
                                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Accept</th>
                                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Reject</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {acceptedList?.length ? acceptedList.map((img, index) => (
                                                                <tr>
                                                                    <td>
                                                                        <div class="d-flex px-2 py-1">
                                                                            <div>
                                                                                <img src={img.yearbook_front_page} class="avatar avatar-sm me-3 border-radius-lg" alt="user1" loading='lazy' />
                                                                            </div>
                                                                            <div class="d-flex flex-column justify-content-center">
                                                                                <h6 class="mb-0 text-sm">{img.name}</h6>

                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    {/* <td>
                                                                        <p class="text-xs font-weight-bold mb-0" style={{ textAlign: 'center' }}>${img.amount}</p>
                                                                    </td> */}
                                                                    <td class="align-middle text-center text-sm">
                                                                        <span class="badge badge-sm bg-gradient-success">{img.status}</span>
                                                                    </td>
                                                                    <td className="align-middle text-center">
                                                                        <span className="text-secondary text-xs font-weight-bold">
                                                                            <center>
                                                                                <a
                                                                                    href="#"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        fetch(img.yearbook)
                                                                                            .then(response => response.blob())
                                                                                            .then(blob => {
                                                                                                const url = window.URL.createObjectURL(blob);
                                                                                                const a = document.createElement("a");
                                                                                                a.href = url;
                                                                                                a.download = "yearbook.pdf";
                                                                                                document.body.appendChild(a);
                                                                                                a.click();
                                                                                                a.remove();
                                                                                                window.URL.revokeObjectURL(url);
                                                                                            })
                                                                                            .catch(error => console.error("File download error:", error));
                                                                                    }}
                                                                                >
                                                                                    <FiDownload style={{ fontSize: "25px" }} />
                                                                                </a>
                                                                            </center>
                                                                        </span>
                                                                    </td>

                                                                    <td class="align-middle text-center">
                                                                        <span class="text-secondary text-xs font-weight-bold">{img.order_date}</span>
                                                                    </td>
                                                                    <td class="align-middle text-center">
                                                                        <input type="checkbox" />
                                                                    </td>
                                                                    <td class="align-middle text-center">
                                                                        <input type="checkbox" />
                                                                    </td>
                                                                </tr>
                                                            )) : <></>}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                                {[processedList, dispatchedList].map((order, index) => (

                                    <div class="row">
                                        <div class="col-12">
                                            <div class="card my-4">
                                                <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                                    <div class="shadow-primary border-radius-lg pt-4 pb-3 bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3]">
                                                        <h6 class="text-white text-capitalize ps-3">{index === 0 ? 'Processed Orders' : 'Dispatched Orders'}</h6>
                                                    </div>
                                                </div>
                                                <div class="card-body px-0 pb-2">
                                                    <div class="table-responsive p-0">
                                                        <table class="table align-items-center mb-0">
                                                            <thead>
                                                                <tr>
                                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{role === 'admin' ? 'Name' : 'Yearbook'}</th>
                                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Amount</th>
                                                                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                                                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date</th>
                                                                    <th class="text-secondary opacity-7"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order?.length ? order.map((orderimage, index) => (
                                                                    <tr>
                                                                        <td>
                                                                            <div class="d-flex px-2 py-1">
                                                                                <div>
                                                                                    <img src={orderimage.yearbook_front_page} class="avatar avatar-sm me-3 border-radius-lg" alt="user1" loading='lazy' />
                                                                                </div>

                                                                                <div class="d-flex flex-column justify-content-center">
                                                                                    <h6 class="mb-0 text-sm">{orderimage.name}</h6>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <p class="text-xs font-weight-bold mb-0">${orderimage.amount}</p>
                                                                        </td>
                                                                        <td class="align-middle text-center text-sm">
                                                                            <span class="badge badge-sm bg-gradient-success">{orderimage.status}</span>
                                                                        </td>
                                                                        <td class="align-middle text-center">
                                                                            <span class="text-secondary text-xs font-weight-bold">{orderimage.dispatched_date}</span>
                                                                        </td>
                                                                    </tr>
                                                                )) : <></>}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {role === 'student' && (
                            <div class="row">
                                <div class="col-12">
                                    <div class="card my-4">
                                        <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                            <div class="shadow-primary border-radius-lg pt-4 pb-3 bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3]">
                                                <h6 class="text-white text-capitalize ps-3">Dispatched Orders</h6>
                                            </div>
                                        </div>
                                        <div class="card-body px-0 pb-2">
                                            <div class="table-responsive p-0">
                                                <table class="table align-items-center mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Yearbook</th>
                                                            {/* <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Amount</th> */}
                                                            <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                                            <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date</th>
                                                            <th class="text-secondary opacity-7"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userOrdersList?.length ? userOrdersList?.map((userOrder, index) => (
                                                            <tr>
                                                                <td>
                                                                    <div class="d-flex px-2 py-1">
                                                                        <div>
                                                                            <img src={userOrder.yearbook_front_page} class="avatar avatar-sm me-3 border-radius-lg" alt="user1" loading='lazy' />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                {/* <td>
                                                                    <p class="text-xs font-weight-bold mb-0">${userOrder.amount}</p>
                                                                </td> */}
                                                                <td class="align-middle text-center text-sm">
                                                                    <span class="badge badge-sm bg-gradient-success">{userOrder.status}</span>
                                                                </td>
                                                                <td class="align-middle text-center">
                                                                    <span class="text-secondary text-xs font-weight-bold">{userOrder.order_date}</span>
                                                                </td>
                                                            </tr>
                                                        )) : <></>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

