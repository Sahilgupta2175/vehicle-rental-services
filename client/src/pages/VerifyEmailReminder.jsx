import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import useAuthStore from '../store/authStore';
import PageContainer from '../components/common/PageContainer';

const VerifyEmailReminder = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleResendVerification = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authApi.resendVerification();

            if (response.data.success) {
                setMessage({ 
                    type: 'success', 
                    text: 'Verification email sent! Please check your inbox and spam folder.' 
                });
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to send verification email' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    if (user.emailVerified) {
        navigate('/profile');
        return null;
    }

    return (
        <PageContainer>
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur border border-slate-600/50 rounded-xl p-6 sm:p-8">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
                        Verify Your Email Address
                    </h1>

                    {/* Description */}
                    <div className="text-center mb-6">
                        <p className="text-slate-300 mb-2">
                            We've sent a verification email to:
                        </p>
                        <p className="text-blue-400 font-semibold text-lg mb-4">
                            {user.email}
                        </p>
                        <p className="text-slate-400 text-sm">
                            Please check your inbox and click the verification link to activate your account.
                        </p>
                    </div>

                    {/* Message Display */}
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg text-sm ${
                            message.type === 'success' 
                                ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            What to do next:
                        </h3>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">1.</span>
                                <span>Check your email inbox for our verification email</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">2.</span>
                                <span>If you don't see it, check your spam or junk folder</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">3.</span>
                                <span>Click the verification link in the email</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">4.</span>
                                <span>You'll be redirected back and can access all features</span>
                            </li>
                        </ul>
                    </div>

                    {/* Benefits */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                        <h3 className="text-blue-400 font-semibold mb-2 text-sm">
                            Why verify your email?
                        </h3>
                        <ul className="space-y-1 text-slate-300 text-sm">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Access booking features
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Receive booking confirmations
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Secure your account
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Enable password recovery
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleResendVerification}
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                'Resend Verification Email'
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Footer Note */}
                    <p className="text-slate-500 text-xs text-center mt-6">
                        The verification link expires in 24 hours for security reasons.
                    </p>
                </div>
            </div>
        </PageContainer>
    );
};

export default VerifyEmailReminder;
