import React from 'react'
import LeftNavBar from './LeftNavBar'
import { useNavigate } from 'react-router-dom'

export default function Schools() {

    const navigate = useNavigate();

    return (
        <div className="g-sidenav-show  bg-gray-200" style={{ height: '100vh' }}>
            <LeftNavBar />
            <div className="main-content position-relative min-h-[100vh] border-radius-lg ml-72">
                <nav className="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                    <div className="container-fluid py-1 px-3">
                        <nav aria-label="breadcrumb">
                            <h6 className="font-weight-bolder mb-0 underline underline-offset-8">Schools</h6>
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
                                    <h4 className="font-weight-bolder">Add School</h4>
                                </div>
                                <div className="card-body -mt-8">
                                    <form role="form">
                                        <label className="form-label">School Name</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <input type="text" className="form-control" style={{ height: '40px' }} placeholder='Enter your school name' />
                                        </div>

                                        <label className="form-label">Phone</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <input type="number" className="form-control" style={{ height: '40px' }} placeholder='Enter you phone number' />
                                        </div>
                                        <label className="form-label">Email</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <input type="email" className="form-control" style={{ height: '40px' }} placeholder='Enter your email' />
                                        </div>

                                        <label className="form-label">Address</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <textarea className="form-control" style={{ height: '100px', resize: 'none', overflowY: 'scroll' }}></textarea>
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            <div>
                                                <div className="text-center">
                                                    <button type="button" className="p-2 bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out text-white w-[150px] h-[45px] rounded-md">Save</button>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-center">
                                                    <button type="button" className="px-3 py-2 bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out text-white min-w-[150px] h-[45px] rounded-md">Save and Add Another</button>
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
        </div>
    )
}