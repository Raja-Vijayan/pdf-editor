import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SlNote } from "react-icons/sl";
import { FaAmazonPay, FaUser } from "react-icons/fa";
import LeftNavBar from '../components/LeftNavBar';
import Purchases from './Purchases';
import { DashboardDetailsAPI } from '../ServerApi/server';

export default function Dashboard() {

    const { state: userDetails } = useLocation();
    const { role, userId } = userDetails;
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(role === 'admin' ? 'dashboard' : 'purchase');
    const [totalSales, setTotalSales] = useState('');
    const [totalOrders, setTotalOrders] = useState('');
    const [totalPayments, setTotalPayments] = useState('');
    const [totalUsers, setTotalUsers] = useState('');

    useEffect(() => {
        const dashboardOrdersTrack = async () => {
            const apiResponse = await DashboardDetailsAPI()

            if (apiResponse.status === 200) {
                setTotalSales(apiResponse.data.total_dispatched_orders)
                setTotalOrders(apiResponse.data.total_orders)
                setTotalPayments(apiResponse.data.total_payments.total_amount ? apiResponse.data.total_payments.total_amount : 0)
                setTotalUsers(apiResponse.data.total_users)
            }
        }
        dashboardOrdersTrack()
    }, []);

    return (
        <div className="g-sidenav-show  bg-gray-200">
            <LeftNavBar setDashboard={setDashboard} role={role} />
            <div className="main-content position-relative h-[100vh] border-radius-lg ml-72">
                <nav className="w-full min-h-[40px] flex justify-between items-center p-2 sticky top-0">
                    <div className="container-fluid py-1 px-3">
                        <nav aria-label="breadcrumb">
                            <div>
                                <h6 className="font-weight-bolder mb-0 underline underline-offset-8">Dashboard</h6>
                            </div>
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
                <div className="container-fluid py-4 mt-5">
                    <div className="row">
                        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                            <div className="card">
                                <div className="card-header p-3 pt-2">
                                    <div className="icon icon-lg icon-shape bg-gradient-dark shadow-dark text-center border-radius-xl mt-n4 position-absolute"
                                        style={{ height: '64px', width: '64px' }}>
                                        <SlNote style={{ marginLeft: '21px', marginTop: '18px', fontSize: 'x-large', color: 'white' }} />
                                    </div>
                                    <div className="text-end pt-1">
                                        <p className="text-sm mb-0 text-capitalize">Total Orders</p>
                                        <h4 className="mb-0">{totalOrders}</h4>
                                    </div>
                                </div>
                                <hr className="dark horizontal my-0" />
                                <div className="card-footer p-3">
                                    <p className="mb-0"><span className="text-success text-sm font-weight-bolder">+55% </span>than last week</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                            <div className="card">
                                <div className="card-header p-3 pt-2">
                                    <div className="icon icon-lg icon-shape shadow-primary text-center border-radius-xl mt-n4 position-absolute"
                                        style={{ height: '64px', width: '64px', backgroundColor: '#541f8b' }} >
                                        <SlNote style={{ marginLeft: '21px', marginTop: '18px', fontSize: 'x-large', color: 'white' }} />
                                    </div>
                                    <div className="text-end pt-1">
                                        <p className="text-sm mb-0 text-capitalize">Total Sales</p>
                                        <h4 className="mb-0">{totalSales}</h4>
                                    </div>
                                </div>
                                <hr className="dark horizontal my-0" />
                                <div className="card-footer p-3">
                                    <p className="mb-0"><span className="text-success text-sm font-weight-bolder">+3% </span>than last month</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                            <div className="card">
                                <div className="card-header p-3 pt-2">
                                    <div className="icon icon-lg icon-shape bg-gradient-success shadow-success text-center border-radius-xl mt-n4 position-absolute"
                                        style={{ height: '64px', width: '64px' }}>
                                        <FaAmazonPay style={{ marginLeft: '17px', marginTop: '18px', fontSize: 'xx-large', color: 'white' }} />
                                    </div>
                                    <div className="text-end pt-1">
                                        <p className="text-sm mb-0 text-capitalize">Total Payments ${totalPayments}</p>
                                    </div>
                                </div>
                                <hr className="dark horizontal my-0" />
                                <div className="card-footer p-3">
                                    <p className="mb-0"><span className="text-danger text-sm font-weight-bolder">-2%</span> than yesterday</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-sm-6">
                            <div className="card">
                                <div className="card-header p-3 pt-2">
                                    <div className="icon icon-lg icon-shape bg-gradient-info shadow-info text-center border-radius-xl mt-n4 position-absolute"
                                        style={{ height: '64px', width: '64px' }} >
                                        <FaUser style={{ marginLeft: '19px', marginTop: '18px', fontSize: 'x-large', color: 'white' }} />
                                    </div>
                                    <div className="text-end pt-1">
                                        <p className="text-sm mb-0 text-capitalize">Total Users</p>
                                        <h4 className="mb-0">{totalUsers}</h4>
                                    </div>
                                </div>
                                <hr className="dark horizontal my-0" />
                                <div className="card-footer p-3">
                                    <p className="mb-0"><span className="text-success text-sm font-weight-bolder">+5% </span>than yesterday</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col-lg-4 col-md-6 mt-4 mb-4">
                            <div className="card z-index-2 ">
                                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent">
                                    <div className="shadow-primary border-radius-lg py-3 pe-1" style={{ backgroundColor: '#541f8b' }}>
                                        <div className="chart">
                                            <canvas id="chart-bars" className="chart-canvas" height="170"></canvas>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h6 className="mb-0 "> Orders Views</h6>
                                    <p className="text-sm ">Monthly Performance</p>
                                    <hr className="dark horizontal" />
                                    <div className="d-flex ">
                                        <i className="material-icons text-sm my-auto me-1">schedule</i>
                                        <p className="mb-0 text-sm"> campaign sent 2 days ago </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mt-4 mb-4">
                            <div className="card z-index-2  ">
                                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent">
                                    <div className="bg-gradient-success shadow-success border-radius-lg py-3 pe-1">
                                        <div className="chart">
                                            <canvas id="chart-line" className="chart-canvas" height="170"></canvas>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h6 className="mb-0 "> Sales Views</h6>
                                    <p className="text-sm "> (<span className="font-weight-bolder">+15%</span>) increase in today sales. </p>
                                    <hr className="dark horizontal" />
                                    <div className="d-flex ">
                                        <i className="material-icons text-sm my-auto me-1">schedule</i>
                                        <p className="mb-0 text-sm"> updated 4 min ago </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 mt-4 mb-3">
                            <div className="card z-index-2 ">
                                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent">
                                    <div className="bg-gradient-dark shadow-dark border-radius-lg py-3 pe-1">
                                        <div className="chart">
                                            <canvas id="chart-line-tasks" className="chart-canvas" height="170"></canvas>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h6 className="mb-0 ">Completed Tasks</h6>
                                    <p className="text-sm ">Last Campaign Performance</p>
                                    <hr className="dark horizontal" />
                                    <div className="d-flex ">
                                        <i className="material-icons text-sm my-auto me-1">schedule</i>
                                        <p className="mb-0 text-sm">just updated</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {(dashboard === 'purchase' || dashboard === 'saved') && (
                <Purchases role={role} dashboard={dashboard} logoutOption={() => { localStorage.removeItem('userId'); localStorage.removeItem('role'); navigate('/') }} />
            )}
        </div>
    );
}

