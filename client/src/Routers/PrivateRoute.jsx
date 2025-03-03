import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { VerificationToken } from '../ServerApi/server';

const PrivateRoute = ({ component: Component, ...rest }) => {
    const [isTokenValid, setIsTokenValid] = useState(null);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAccessToken = async () => {
            const access_token = Cookies.get('access_token');
            try {
                const accessCodeApiResponse = await VerificationToken(access_token);

                if (accessCodeApiResponse.status === 200) {
                    setIsTokenValid(true);
                } else if (accessCodeApiResponse.status === 400) {
                    localStorage.removeItem('access_code');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('role');
                    navigate('/');
                } else {
                    Cookies.remove('access_token');
                    Cookies.remove('access_token_expiry');
                    setIsTokenValid(false);
                    setIsSessionExpired(true);
                }
            } catch (error) {
                console.error('Token verification error:', error);
                setIsTokenValid(false);
                setIsSessionExpired(true);
            }
        };

        verifyAccessToken(); 
    }, [navigate]);

    const handleOkClick = () => {
        localStorage.removeItem('access_code');
        localStorage.removeItem('access_token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        navigate('/');
    };

    if (isTokenValid === null) {
        return <div>Loading...</div>; 
    }

    return (
        <div style={{ pointerEvents: isSessionExpired ? 'none' : 'auto' }}>
            {isTokenValid && <Component {...rest} />}
            {!isTokenValid && (
                <>
                    <Component {...rest} />
                    {isSessionExpired && (
                        <>
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 9998,
                                pointerEvents: 'auto',
                            }} />

                            <div style={{
                                color: 'white',
                                position: 'fixed',
                                bottom: '75%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0, 0, 0, 0.8)',
                                padding: '20px',
                                borderRadius: '5px',
                                zIndex: 9999,
                                textAlign: 'center',
                                pointerEvents: 'auto',
                            }}>
                                <p>Your session has expired. Please log in again to continue.</p>
                                <button
                                    onClick={handleOkClick}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        zIndex: 10000,
                                    }}
                                >
                                    OK
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default PrivateRoute;
