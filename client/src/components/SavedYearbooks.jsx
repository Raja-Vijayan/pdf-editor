import React from 'react'
import LeftNavBar from '../components/LeftNavBar'
import { useLocation, useNavigate } from 'react-router-dom'

export default function SavedYearBook({ role, dashboard }) {

    const { state: savedImageDetails } = useLocation();
    const navigate = useNavigate();

    const editSavedYearBook = (savadImageId) => {
        alert('edit the yearbook')
    }

    return (
        <div>
            <div class="g-sidenav-show  bg-gray-200" style={{ height: '100vh' }}>
                <LeftNavBar />
                <div class="main-content position-relative max-height-vh-800 h-100 border-radius-lg ml-72">
                    <nav class="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                        <div class="container-fluid py-1 px-3">
                            <nav aria-label="breadcrumb">
                                <h6 class="font-weight-bolder mb-0 underline underline-offset-8">{dashboard === 'purchase' ? 'Purchase Yearbooks' : 'Saved Yearbooks'}</h6>
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
                                            <h6 class="text-white text-capitalize ps-3">Yearbook Details</h6>
                                        </div>
                                    </div>
                                    <div class="card-body px-0 pb-2">
                                        <div class="table-responsive p-0">
                                            <table class="table align-items-center mb-0">
                                                <thead>
                                                    <tr>
                                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">YearBook</th>
                                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">{dashboard === 'purchase' ? 'Amount' : 'Date'}</th>
                                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{dashboard === 'purchase' ? 'Date' : 'Edit'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {savedImageDetails?.map((savedImage, index) => (
                                                        <tr>
                                                            <td>
                                                                <div class="d-flex px-2 py-1">
                                                                    <div>
                                                                        <img src={savedImage.yearbook_front_page} class="avatar avatar-sm me-3 border-radius-lg" alt="user1" loading='lazy' />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <p class="text-xs font-weight-bold mb-0">{savedImage.date}</p>
                                                            </td>
                                                            <td class="align-middle text-center">
                                                                <span class="text-secondary text-xs font-weight-bold hover-effect" style={{ padding: '10px' }} id={savedImage.id} onClick={() => { editSavedYearBook(savedImage.id) }}>Click</span>
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
}
