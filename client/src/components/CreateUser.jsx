import React, { useState } from 'react'
import LeftNavBar from './LeftNavBar'
import { CreateUsersApi } from '../ServerApi/server'
import { CONNECTION_REFUSED } from '../helper/Helpers'
import { useNavigate } from 'react-router-dom'

export default function CreateUser() {

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');

    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopupRefused, setShowPopupRefused] = useState(false);
    const [popupRefusedMessage, setPopupRefusedMessage] = useState('');
    const [errors, setErrors] = useState({});


    const createNewUsersApi = async () => {

        const validateForm = () => {
            const newErrors = {};
            if (!name) newErrors.name = "Name is required";
            if (!email) newErrors.email = "Email is required";
            if (!phone) newErrors.phone = "Phone number is required";
            if (!role) newErrors.role = "Role is required";
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        validateForm();

        try {
            const createNewUsersApiResponse = await CreateUsersApi(name, email, phone, role)
            if (createNewUsersApiResponse.status === 200) {
                setName('');
                setPhone('');
                setEmail('');
                setRole('');
            } else {
                setPopupMessage(createNewUsersApiResponse.response.data.message);
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
        <div className="g-sidenav-show  bg-gray-200" style={{ height: '100vh' }}>
            <LeftNavBar />
            <div className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ml-72">
                <nav className="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                    <div className="container-fluid py-1 px-3">
                        <nav aria-label="breadcrumb">
                            <h6 className="font-weight-bolder mb-0 underline underline-offset-8">Create User</h6>
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
                                    <h4 className="font-weight-bolder">Add User</h4>
                                </div>
                                <div className="card-body -mt-8">
                                    <form role="form">
                                        <label className="form-label">Name</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} className="form-control" style={{ height: '40px' }} placeholder='Enter you name' required />
                                        </div>
                                        {errors.name && <div className="text-danger">{errors.name}</div>}
                                        <label className="form-label">Gmail</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value) }} className="form-control" style={{ height: '40px' }} placeholder='Enter your gmail' required />
                                        </div>
                                        {errors.email && <div className="text-danger">{errors.email}</div>}
                                        <label className="form-label">Phone</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <input type="number" value={phone} onChange={(e) => { setPhone(e.target.value) }} className="form-control" style={{ height: '40px' }} placeholder='Enter your phone number' required />
                                        </div>
                                        {errors.phone && <div className="text-danger">{errors.phone}</div>}
                                        <label className="form-label">Role</label>
                                        <div className="input-group input-group-outline mb-3">
                                            <select className="form-control" style={{ height: '40px' }} value={role} onChange={(e) => { setRole(e.target.value) }}>
                                                <option>--Select--</option>
                                                <option>Admin</option>
                                                <option>Manager</option>
                                                <option>Student</option>
                                            </select>
                                        </div>
                                        {errors.role && <div className="text-danger">{errors.role}</div>}
                                        <div className="flex gap-3 mt-4">
                                            <div>
                                                <div className="text-center">
                                                    <button type="button" className="p-2 bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out text-white w-[150px] h-[45px] rounded-md" onClick={createNewUsersApi}>Save</button>
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