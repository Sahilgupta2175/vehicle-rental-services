import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import useAuthStore from '../store/authStore';
import PageContainer from '../components/common/PageContainer';
import Loader from '../components/common/Loader';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, user } = useAuthStore();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link');
                return;
            }

            try {
                const response = await authApi.verifyEmail(token);
                
                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message || 'Email verified successfully!');
                    
                    // Update user in store if logged in
                    if (user) {
                        setUser({ ...user, emailVerified: true });
                        
                        // Redirect to user's dashboard based on role
                        setTimeout(() => {
                            if (user.role === 'vendor') {
                                navigate('/dashboard/vendor');
                            } else if (user.role === 'admin') {
                                navigate('/dashboard/admin');
                            } else {
                                navigate('/dashboard/user');
                            }
                        }, 3000);
                    } else {
                        // Not logged in, redirect to login
                        setTimeout(() => {
                            navigate('/login');
                        }, 3000);
                    }
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
            }
        };

        verifyEmail();
    }, [searchParams, navigate, setUser, user]);

    if (status === 'verifying') {
        return (
            <PageContainer>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                        <Loader />
                        <p className="text-white mt-4 text-lg">Verifying your email...</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-slate-800/50 backdrop-blur border border-slate-600/50 rounded-xl p-8 text-center">
                    {status === 'success' ? (
                        <>
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                Email Verified!
                            </h1>
                            <p className="text-slate-300 mb-6">
                                {message}
                            </p>
                            <p className="text-slate-400 text-sm">
                                Redirecting you to browse vehicles...
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                Verification Failed
                            </h1>
                            <p className="text-slate-300 mb-6">
                                {message}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all"
                                >
                                    Go to Profile
                                </button>
                                <button
                                    onClick={() => navigate('/vehicles')}
                                    className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all"
                                >
                                    Browse Vehicles
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default VerifyEmail;
