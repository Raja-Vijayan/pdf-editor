import React, { useState } from "react";
import visa from "../assets/payment/visa.png";
import american from "../assets/payment/american-express.png";
import bank from "../assets/payment/bank-transfer.png";
import discover from "../assets/payment/discover.png";
import paymentFail from "../assets/payment/paymentFail.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import { getConvergeSessionToken, transactionResponse, PurchaseYearbookDetailsApi } from '../ServerApi/server';
import LeftNavBar from './LeftNavBar';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { newYearbookId, userId, invoiceNumber, amount } = location.state || {};
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    email: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.cardNumber || formData.cardNumber.length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits.";
    }
    if (!formData.expiryDate || !/^(0[1-9]|1[0-2])\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Expiration date must be in MMYY format.";
    }
    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = "CVV must be 3 digits.";
    }
    if (!formData.firstName) {
      newErrors.firstName = "First name is required.";
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required.";
    }
    if (!formData.address1) {
      newErrors.address1 = "Address1 is required.";
    }
    if (!formData.city) {
      newErrors.city = "City is required.";
    }
    if (!formData.state) {
      newErrors.state = "State/Province is required.";
    }
    if (!formData.postalCode) {
      newErrors.postalCode = "Postal code is required.";
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required.";
    }
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = "Phone number must be at least 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getConvergeSessionTokenFunction = async (amount) => {
    try {
      const getConvergeSessionTokenResponse = await getConvergeSessionToken(amount);
      if (getConvergeSessionTokenResponse.data.client_status_code === 200) {
        return getConvergeSessionTokenResponse.data.session_token
      } else {
        return null
      }
    } catch (error) {
      console.error('Error fetching session token:', error);
    }
  };

  const transactionResponseFunction = async (payment_response, user_data) => {
    try {
      const transactionAPIResponse = await transactionResponse(payment_response, user_data);
      if (transactionAPIResponse.data.client_status_code === 200) {
        return transactionAPIResponse.data
      } else {
        return null
      }
    } catch (error) {
      console.error('Error fetching session token:', error);
    }
  };

  const [isPaymentFailed, setIsPaymentFailed] = useState(false);

  const user_data = {
    'user_id': userId,
    'last_name': formData.lastName,
    'first_name': formData.firstName,
    'email': formData.email,
    'phone': formData.phoneNumber,
    'state': formData.state,
    'city': formData.city,
    'address': formData.address1 + ' ' + formData.address2,
    'zip': formData.postalCode,
    'yearbook': newYearbookId,
    'status': 'accepted',
  }

  const callback = !process.env.REACT_APP_SITE_URL?.includes('localhost') ? {
    onError: async (error) => {
      setLoading(false);
      setIsPaymentFailed(true)
    },
    onDeclined: async (response) => {
      setLoading(false);
      setIsPaymentFailed(true)
    },
    onApproval: async (response) => {
      await transactionResponseFunction(response, user_data);
      const purchaseYearBookApiResponse = await PurchaseYearbookDetailsApi('purchase', userId);
      navigate('/purchase', {
        state: purchaseYearBookApiResponse.data.purchase_all_yearbook_details,
      });
      setLoading(false);
    },
  } : {
    onError: async (error) => {
      setLoading(false);
      setIsPaymentFailed(true)

    },
    onDeclined: async (response) => {
      await transactionResponseFunction(response, user_data);
      const purchaseYearBookApiResponse = await PurchaseYearbookDetailsApi('purchase', userId);
      navigate('/purchase', {
        state: purchaseYearBookApiResponse.data.purchase_all_yearbook_details,
      });
      setLoading(false);
      // setIsPaymentFailed(true)
    },
    onApproval: async (response) => {
      await transactionResponseFunction(response, user_data);
      const purchaseYearBookApiResponse = await PurchaseYearbookDetailsApi('purchase', userId);
      navigate('/purchase', {
        state: purchaseYearBookApiResponse.data.purchase_all_yearbook_details,
      });
      setLoading(false);
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) { } else { return; }
    setLoading(true);
    const convergeSessionToken = await getConvergeSessionTokenFunction(1)
    const paymentData = {
      ssl_txn_auth_token: convergeSessionToken,
      ssl_card_number: formData.cardNumber,
      ssl_exp_date: formData.expiryDate,
      ssl_get_token: 'y',
      ssl_add_token: 'y',
      ssl_invoice_number: invoiceNumber,
      ssl_first_name: formData.firstName,
      ssl_last_name: formData.lastName,
      ssl_cvv2cvc2: formData.cvv,
      ssl_avs_address: formData.address1,
      ssl_address2: formData.address2,
      ssl_city: formData.city,
      ssl_state: formData.state,
      ssl_avs_zip: formData.postalCode,
    };
    window.ConvergeEmbeddedPayment.pay(paymentData, callback);
  };

  return (
    <div class="g-sidenav-show  bg-gray-200">
      <LeftNavBar />
      <div class="main-content position-relative min-h-[100vh] border-radius-lg ml-72">
        <nav class="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
          <div class="container-fluid py-1 px-3">
            <nav aria-label="breadcrumb">
              <h6 class="font-weight-bolder mb-0">Billing</h6>
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
        <div>
          <form onSubmit={handleSubmit}>
            <div className="px-5 py-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Order Section */}
              <div className="flex flex-col gap-3">
                <div className="border border-neutral-300 rounded-md overflow-hidden bg-white">
                  <h1 className="px-2 py-1 w-full bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3] text-lg font-semibold text-white h-[40px]">
                    Order Section
                  </h1>
                  <div className="pt-3 pb-4 px-5 flex flex-col gap-1">
                    <p className="font-semibold text-base sm:text-[17px]">
                      Amount: <span className="font-light text-base">$ {amount}</span>
                    </p>
                    <p className="font-semibold text-base sm:text-[17px]">
                      Invoice Number: <span className="font-light text-base">{invoiceNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="border border-neutral-300 rounded-md overflow-hidden bg-white mt-4">
                  <h1 className="px-2 py-1 w-full bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3] text-lg font-semibold text-white h-[40px]">
                    Payment
                  </h1>
                  <div className="pt-3 pb-4 px-5 flex flex-col gap-1">
                    <p className="font-semibold text-base sm:text-[17px]">Payment Card</p>
                    <div className="flex">
                      <img src={visa} alt="visa" className="w-10 mr-[10px]" loading="lazy" />
                      <img src={american} alt="american-express" className="w-10 mr-[10px]" loading="lazy" />
                      <img src={bank} alt="bank-transfer" className="w-10 mr-[10px]" loading="lazy" />
                      <img src={discover} alt="discover" className="w-10 mr-[10px]" loading="lazy" />
                    </div>
                    {/* Card Details */}
                    <div className="flex flex-col gap-[2px]">
                      <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                        Card Number*
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="Enter your card number"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className="px-2 py-[6px] border border-neutral-300 rounded"
                      />
                      {errors.cardNumber && <span className="text-red-500 text-sm">{errors.cardNumber}</span>}
                    </div>
                    {/* Other fields (Expiry, CVV) */}
                    <div className="flex flex-col gap-[2px]">
                      <label htmlFor="expiryDate" className="font-semibold text-base sm:text-[17px]">
                        Expiration Date (MM/YY)*
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className="px-2 py-[6px] border border-neutral-300 rounded"
                      />
                      {errors.expiryDate && <span className="text-red-500 text-sm">{errors.expiryDate}</span>}
                    </div>
                    <div className="flex flex-col gap-[2px]">
                      <label htmlFor="cvv" className="font-semibold text-base sm:text-[17px]">
                        CVV*
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        placeholder="Enter your CVV"
                        value={formData.cvv}
                        onChange={handleChange}
                        className="px-2 py-[6px] border border-neutral-300 rounded"
                      />
                      {errors.cvv && <span className="text-red-500 text-sm">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address Section */}
              <div className="border border-neutral-300 rounded-md overflow-hidden bg-white">
                <h1 className="px-2 py-1 w-full bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3] text-lg font-semibold text-white h-[40px]">
                  Billing Address
                </h1>

                <div className="pt-3 pb-4 px-5 flex flex-col gap-1">

                  <div className="grid grid-cols-2 gap-7">
                    <div className="flex flex-col gap-[2px]">
                      <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                        First Name*
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="px-2 py-[6px] border border-neutral-300 rounded"
                      />
                      {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName}</span>}
                    </div>
                    <div className="flex flex-col gap-[2px]">
                      <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="px-2 py-[6px] border border-neutral-300 rounded"
                      />
                      {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                      Address1*
                    </label>
                    <input
                      type="text"
                      name="address1"
                      placeholder="Street Address"
                      value={formData.address1}
                      onChange={handleChange}
                      className="px-2 py-[6px] border border-neutral-300 rounded"
                    />
                    {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName}</span>}
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                      Address2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="address2"
                      placeholder="Apartment, suite, etc"
                      className="px-2 py-[6px] border border-neutral-300 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-7">
                    <div className="flex flex-col gap-[2px]">
                      <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                        City*
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        className="px-2 py-[6px] border border-neutral-300 rounded"
                      />
                      {errors.city && <span className="text-red-500 text-sm">{errors.city}</span>}
                    </div>
                    <div className="flex flex-col gap-[2px]">
                      <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                        State/Province*
                      </label>
                      <input
                        type="text"
                        name="state"
                        placeholder="State/Province"
                        value={formData.state}
                        onChange={handleChange}
                        className="px-2 py-[6px] border border-neutral-300 rounded"
                      />
                      {errors.state && <span className="text-red-500 text-sm">{errors.state}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                      Postal Code*
                    </label>
                    <input
                      type="number"
                      name="postalCode"
                      placeholder="Postal Code"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="px-2 py-[6px] border border-neutral-300 rounded"
                    />
                    {errors.postalCode && <span className="text-red-500 text-sm">{errors.postalCode}</span>}
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="px-2 py-[6px] border border-neutral-300 rounded"
                    />
                    {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <label htmlFor="cardNumber" className="font-semibold text-base sm:text-[17px]">
                      Phone Number*
                    </label>
                    <input
                      type="number"
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="px-2 py-[6px] border border-neutral-300 rounded"
                    />
                    {errors.phoneNumber && <span className="text-red-500 text-sm">{errors.phoneNumber}</span>}
                  </div>
                </div>

              </div>
            </div>
            <div className="w-full flex items-center justify-center pb-6">
              <button
                type="submit"
                className="p-2 bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out text-white w-[180px] h-[45px] rounded-md"
              >
                Confirm Payment
              </button>
            </div>
          </form>
          <div>
            {loading && (
              <div
                className="fixed top-0 left-72 w-[83%] h-full bg-white bg-opacity-90 flex flex-col justify-center items-center z-50"
              >
                <span className="flex justify-center items-center flex-col -ml-14 mt-24 relative">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-4 border-t-[#541f8b] rounded-full animate-spin"></div>
                  <p className="mt-4 text-lg text-gray-600">Loading, please wait...</p>
                </span>
              </div>
            )}
          </div>

          <div>
            {isPaymentFailed &&
              <div
                className="fixed top-0 left-0 w-full h-full bg-[#7F7F7F] flex flex-col justify-center items-center z-[150]"
              >
                <div
                  className="w-3/4 sm:w-3/5 md:w-1/2 lg:w-2/5 xl:w-1/3 bg-white rounded-lg animate-slide-down"
                >
                  <div className="border-b">
                    <div className="flex flex-col border-b-4 border-b-red-600 items-center gap-1 sm:gap-2 mx-4 my-8 lg:my-12 py-6 sm:py-8 md:py-12 rounded-md shadow-[0px_0px_6px_2px_rgba(0,0,0,0.1)]">
                      <div className="w-24 sm:w-36">
                        <img src={paymentFail} alt="paymentFail" className="w-full" loading="lazy" />
                      </div>
                      <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-medium">Transaction <br />Declined</h1>
                      <p className="text-base sm:text-lg text-neutral-600 font-medium">Try again later</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end px-4 py-4">
                    <button
                      className="bg-neutral-500 hover:bg-neutral-600 duration-200 px-3 py-[6px] rounded text-white"
                      onClick={() => setIsPaymentFailed(false)}
                    >
                      Close
                    </button>
                    <button
                      className="bg-neutral-500 hover:bg-neutral-600 duration-200 px-3 py-[6px] rounded text-white"
                      onClick={() => setIsPaymentFailed(false)}
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;