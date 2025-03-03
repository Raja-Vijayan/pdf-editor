import axios from 'axios';

const serverUrl = process.env.REACT_APP_SERVER_URL;

export const AccessCodeAPI = async (access_code) => {
    let url = `${serverUrl}/api/validate_access_code`;
    const payload = { access_code };

    try {
        const accessCodeApiResponse = await axios.post(url, payload);
        return accessCodeApiResponse;
    } catch (error) {
        return error;
    }
};

export const EmailNumberAPI = async (access_code, email_number) => {
    let url = `${serverUrl}/api/email_number`;
    const payload = { access_code, email_number };

    try {
        const emailNumberApiResponse = await axios.post(url, payload);
        return emailNumberApiResponse;
    } catch (error) {
        return error;
    }
};

export const VerificationToken = async (access_token) => {
    let url = `${serverUrl}/api/verify_token`;
    const payload = { access_token };

    try {
        const userDetailsApiResponse = await axios.post(url, payload);
        return userDetailsApiResponse;
    } catch (error) {
        return error;
    }
};

export const UploadImageAPI = async (formData) => {
    let url = `${serverUrl}/api/user_panel/upload_image`;
    const header = { header: { 'Content-Type': 'multipart/form-data' } };

    try {
        const uploadImageApiResponse = await axios.post(url, formData, header);
        return uploadImageApiResponse;
    } catch (error) {
        return error;
    }
};

export const GetImages = async (asset_type, user_id) => {
    let url = `${serverUrl}/api/user_panel/get_images`;
    const payload = { asset_type, user_id };
    try {
        const uploadImageApiResponse = await axios.post(url, payload);
        return uploadImageApiResponse;
    } catch (error) {
        return error;
    }
};

export const GetCarts = async (userId) => {
    const url = `${serverUrl}/api/accounts/carts/`;

    try {
        const response = await axios.get(url, {
            params: { user_id: userId },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("Response :",response)
        return response;
    } catch (error) {
        console.error('Error fetching carts:', error.response ? error.response.data : error.message);
        return { status: 500, data: [] };
    }
};

export const AddToCartAPI = async (cartData) => {
    let url = `${serverUrl}/api/accounts/addcarts/`;

    try {
        const response = await axios.post(url, cartData);
        return response;
    } catch (error) {
        console.error('Error adding to cart:', error.response?.data);
        throw error;
    }
};

export const DashboardDetailsAPI = async () => {
    let url = `${serverUrl}/api/accounts/order_statistics/`;

    try {
        const dashboardDetailsApiResponse = await axios.get(url);
        return dashboardDetailsApiResponse;
    } catch (error) {
        return error;
    }
};

export const UserDetailsApi = async () => {
    let url = `${serverUrl}/api/accounts/user_details/`;

    try {
        const userDetailsApiResponse = await axios.get(url);
        return userDetailsApiResponse;
    } catch (error) {
        return error;
    }
};

export const AdminOrdersDetailsApi = async (user_id, role) => {
    let url = `${serverUrl}/api/accounts/current_dispatched_orders/`;
    const payload = { user_id, role };

    try {
        const adminOrdersApiResponse = await axios.post(url, payload);
        return adminOrdersApiResponse;
    } catch (error) {
        return error;
    }
};

export const PaymentDetailsApi = async (user_id, role) => {
    let url = `${serverUrl}/api/accounts/payment_details/`;
    const payload = { user_id, role };

    try {
        const paymentDetailsApiResponse = await axios.post(url, payload);
        return paymentDetailsApiResponse;
    } catch (error) {
        return error;
    }
};

export const PurchaseYearbookDetailsApi = async (yearbook_option, user_id) => {
    let url = `${serverUrl}/api/accounts/purchase_saved_yearbook/`;
    const payload = { yearbook_option, user_id };

    try {
        const purchaseYearbookDetailsApiResponse = await axios.post(url, payload);
        return purchaseYearbookDetailsApiResponse;
    } catch (error) {
        return error;
    }
};

export const CreateUsersApi = async (name, email, phone, role) => {
    let url = `${serverUrl}/api/create_users`;
    const payload = { name, email, phone, role };

    try {
        const createUserApiResponse = await axios.post(url, payload);
        return createUserApiResponse;
    } catch (error) {
        return error;
    }
};

export const saveEditedHTML = async (payload) => {
    let url = `${serverUrl}/api/accounts/save_edited_html/`;
    try {
        const storeEditedHTML = await axios.post(url, payload);
        return storeEditedHTML;
    } catch (error) {
        return error;
    }
};

export const getLatestEditedPdf = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/accounts/latest-edited-pdf/`, {
            params: { user_id: localStorage.getItem('userId'), email: localStorage.getItem('email') },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching latest edited PDFs:', error);
        return { error: error.response.data.error || 'An error occurred' };
    }
};

export const UploadPDFFileApi = async (formData) => {
    let url = `${serverUrl}/api/accounts/upload_pdf_pages/`;

    try {
        const createUserApiResponse = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return createUserApiResponse;
    } catch (error) {
        return error;
    }
};


export const createAllYearbookEntry = async (userId, tempYearbookId, totalAmount) => {
    const url = `${serverUrl}/api/accounts/create_all_yearbook/`;
    const payload = {
        user: userId,
        temp_yearbook_id: tempYearbookId,
        total_amount: totalAmount,
    };
    try {
        const response = await axios.post(url, payload);
        return response;
    } catch (error) {
        console.error('Failed to create yearbook entry:', error.response?.data || error.message);
        throw error;
    }
};


export const createTemporaryYearbookAPI = async (userId, thumbnailBlob, pdfBlob) => {
    const url = `${serverUrl}/api/accounts/temporaryyearbooks/`;
    const formData = new FormData();
    formData.append('user', userId);
    formData.append('yearbook_front_page', thumbnailBlob, 'front_page.png');
    formData.append('yearbook', pdfBlob, 'yearbook.pdf');

    try {
        const response = await axios.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create yearbook entry:', error.response?.data || error.message);
        throw error;
    }
};


export const fakePaymentProcess = () => new Promise(resolve => setTimeout(() => resolve(true), 2000));

export const createOrder = async (orderData) => {
    const url = `${serverUrl}/api/accounts/orders/`;
    try {
        const response = await axios.post(url, orderData);
        return response;
    } catch (error) {
        console.error('Failed to create order:', error.response?.data || error.message);
        throw error;
    }
};

export const generateSessionLink = async (userId, email, pdfId) => {
    const url = `${serverUrl}/api/accounts/generate_session_link/`;
    const payload = {
        user_id: userId,
        email: email,
        session_data: { pdfId },
    };

    try {
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.status !== 200) {
            throw new Error('Failed to generate session link');
        }

        return response.data.link;
    } catch (error) {
        console.error('Error generating session link:', error);
        throw error;
    }
};

export const getSessionData = async (sessionLink, userId) => {
    const url = `${serverUrl}/api/accounts/get_session_data/`;

    try {
        // Include user_id in the params
        const response = await axios.get(url, {
            params: {
                session_link: sessionLink,
                user_id: userId,
            },
        });

        return response.data; // Return session data
    } catch (error) {
        if (error.response) {
            console.error('Server error:', error.response.data);
            throw new Error(error.response.data.error || 'Failed to fetch session data');
        } else if (error.request) {
            console.error('No response from server:', error.request);
            throw new Error('No response received from server');
        } else {
            console.error('Error setting up request:', error.message);
            throw new Error('Error setting up request');
        }
    }
};


export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${serverUrl}/api/accounts/list_users/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};


export const updatePermissionsAPI = async (sessionLink, permissions) => {
    try {
        const response = await axios.post(`${serverUrl}/api/accounts/update_permissions/`, {
            session_link: sessionLink,
            permissions,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating permissions:', error);
        throw error;
    }
};



export const sendEmailAPI = async (email, sessionLink, userName) => {
    try {
        const response = await axios.post(`${serverUrl}/api/accounts/send-email/`, {
            email,
            session_link: sessionLink,
            user_name: userName,
        });
        return response.data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const fetchLinks = async (userId) => {
    if (!userId) throw new Error("User ID is required");

    const response = await axios.get(`${serverUrl}/api/accounts/user-links/${userId}/`);
    return response.data.links;
};

// Fetch users with/without permissions for a specific session link
export const fetchUsersBySessionLink = async (sessionLinkId, userId) => {
    if (!sessionLinkId || !userId) throw new Error("Session Link ID and User ID are required");

    const response = await axios.get(`${serverUrl}/api/accounts/permission-status/${sessionLinkId}/${userId}/`);
    return response.data;
};

// Update permissions for selected users
export const updatePermissions = async (payload) => {
    const response = await axios.post(`${serverUrl}/api/accounts/update-permissions/`, payload);
    return response.data;
};

// Send email notifications to users
export const sendEmailNotification = async (email, sessionLink, userName) => {
    const payload = { email, session_link: sessionLink, user_name: userName };
    const response = await axios.post(`${serverUrl}/api/accounts/send-email/`, payload);
    return response.data;
};

// Payment gateway APIs
export const getInvoiceNumber = async () => {
    const url = `${serverUrl}/api/accounts/generate_invoice_number/`
    const response = await axios.get(url);
    return response
}

export const getConvergeSessionToken = async (amount) => {
    const url = `https://yearbook.3pstudio.us/api/accounts/get_converge_session_token/`
    const payload = { amount };
    try {
        const getConvergeSessionTokenAPIResponse = await axios.post(url, payload);
        return getConvergeSessionTokenAPIResponse;
    } catch (error) {
        return error;
    }
}

export const transactionResponse = async (payment_response, user_data) => {
    const url = `${serverUrl}/api/accounts/transaction_response/`

    if (process.env.REACT_APP_SITE_URL?.includes('localhost')) {

        var payment_response = {
            'ssl_merchant_initiated_unscheduled': 'N',
            'ssl_issuer_response': '00',
            'ssl_partner_app_id': '01',
            'ssl_card_number': '41******4860',
            'ssl_oar_data': '01004053841204063311000004755420000000000019959G433906405384',
            'ssl_transaction_type': 'SALE',
            'ssl_result': '0',
            'ssl_txn_id': '041224O17-853A7CD1-4379-4EC7-A0B9-87AB3703E7BE',
            'ssl_avs_response': 'Y',
            'ssl_approval_code': '19959G',
            'ssl_amount': '1.00',
            'ssl_txn_time': '12/04/2024 01:33:11 AM',
            'ssl_account_balance': '0.00',
            'ssl_ps2000_data': 'W464339235910209CNKRG3',
            'ssl_exp_date': '0928',
            'ssl_result_message': 'APPROVAL',
            'ssl_card_short_description': 'VISA',
            'ssl_get_token': 'Y',
            'ssl_par_value': 'V0010013017287789212924241174',
            'ssl_token_response': 'Action Not Permitted',
            'ssl_card_type': 'CREDITCARD',
            'ssl_invoice_number': 'INV91338795',
            'ssl_cvv2_response': 'M'
        }
    }

    const payload = { payment_response, user_data };
    try {
        const transactionAPIResponse = await axios.post(url, payload);
        return transactionAPIResponse;
    } catch (error) {
        return error;
    }
}
