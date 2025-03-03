import React from 'react';
import user from '../assets/user.png';
import { useLocation, useNavigate } from 'react-router-dom';
import LeftNavBar from '../components/LeftNavBar';

export default function Users() {

    const { state: allUserDetails } = useLocation();

    const userDetails = allUserDetails.allUserDetails;

    const navigate = useNavigate();

    return (
        <div>
            <div class="g-sidenav-show bg-gray-200" style={{ height: '100vh' }}>
                <LeftNavBar />
                <div class="main-content position-relative max-height-vh-800 h-100 border-radius-lg ml-72">
                    <nav class="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                        <div class="container-fluid py-1 px-3" >
                            <nav aria-label="breadcrumb">
                                <h6 class="font-weight-bolder mb-0 underline underline-offset-8">Users</h6>
                            </nav>
                        </div>
                        <div className='cursor-pointer bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out w-[120px] text-white rounded-md text-center'><h6 className="font-weight-bolder mb-0 text-white rounded-md" onClick={() => { localStorage.removeItem('userId'); localStorage.removeItem('role'); navigate('/') }} style={{ padding: '10px' }}>Logout</h6></div>
                    </nav>
                    <div class="container-fluid py-4">
                        <div class="row">
                            <div class="col-12">
                                <div class="card my-4">
                                    <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                        <div class="shadow-primary border-radius-lg pt-4 pb-3 bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3]">
                                            <h6 class="text-white text-capitalize ps-3">Users Details</h6>
                                        </div>
                                    </div>
                                    <div class="card-body px-0 pb-2">
                                        <div class="table-responsive p-0">
                                            <table class="table align-items-center mb-0">
                                                <thead>
                                                    <tr>
                                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Name</th>
                                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Email</th>
                                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Phone Number</th>
                                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Last Login</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userDetails.map((userDetail) => (

                                                        <tr>
                                                            <td>
                                                                <div class="d-flex px-2 py-1">
                                                                    <div>
                                                                        <img src={user} class="avatar avatar-sm me-3 border-radius-lg" alt="user1" loading='lazy' />
                                                                    </div>
                                                                    <div class="d-flex flex-column justify-content-center">
                                                                        <h6 class="mb-0 text-sm">{userDetail.name}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <p class="text-xs font-weight-bold mb-0">{userDetail.email}</p>
                                                            </td>
                                                            <td class="align-middle text-center">
                                                                <span class="text-secondary text-xs font-weight-bold">{userDetail.phone_number}</span>
                                                            </td>
                                                            <td class="align-middle text-center">
                                                                <span class="text-secondary text-xs font-weight-bold">{userDetail.date_created}</span>
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
    )
};