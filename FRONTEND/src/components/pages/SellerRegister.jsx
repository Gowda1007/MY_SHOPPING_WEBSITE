// SellerRegister.jsx
import React, { useState, useEffect } from 'react';
import OtpInput from '../OtpInput';
import { useUser } from '../context/UserContext';
import API from '../api/API';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SellerRegister = () => {
    const navigate = useNavigate()
    const { user } = useUser();
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleOtpSubmit = async (otp) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await API.post("/auth/verify-otp", { otp });
            console.log(response)
            if (response.status === 200) {
                toast.success("OTP verified successfully!");
                navigate("/home")
            } else {
                toast.error("Invalid OTP. Please try again.");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
            toast.error("Could not verify OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        
        try {
            setIsLoading(true);
            const response = await API.get("/auth/get-otp");
            
            if (response.data.success) {
                toast.success("New OTP sent!");
                setCountdown(60);
            } else {
                toast.error("Failed to send OTP");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Resend failed');
            toast.error("Could not resend OTP");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    // Initial OTP send on component mount
    useEffect(() => {
        const sendInitialOtp = async () => {
            try {
                await API.get("/auth/get-otp");
                toast.success("OTP sent to your registered number");
                setCountdown(30);
            } catch (err) {
                toast.error("Failed to send initial OTP");
            }
        };
        sendInitialOtp();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Become a Seller</h1>
                <h6 className="text-secondary mb-4">Hi 👋 {user.username}</h6>
                <p className="text-gray-600 mb-6">
                    Join our platform and start selling to thousands of customers nationwide.
                </p>

                <h2 className="text-xl font-semibold text-gray-700 mb-2">Verify Mobile Number</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Enter 6-digit OTP sent to <span className='text-secondary'>{user.phone}</span>
                </p>

                <OtpInput 
                    onSubmit={handleOtpSubmit}
                    isLoading={isLoading}
                />

                <div className="mt-6 text-sm text-gray-500">
                    {countdown > 0 ? (
                        <span>Resend OTP in <span className="font-semibold">{countdown}s</span></span>
                    ) : (
                        <button
                            onClick={handleResendOtp}
                            disabled={isLoading}
                            className="text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                    )}
                </div>

                {error && (
                    <p className="text-red-500 text-sm mt-4 animate-pulse">⚠️ {error}</p>
                )}
            </div>
        </div>
    );
};

export default SellerRegister;