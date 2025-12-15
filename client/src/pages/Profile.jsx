import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authApi } from '../api/auth';
import PageContainer from '../components/common/PageContainer';
import Loader from '../components/common/Loader';

const Profile = () => {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: user?.location?.address || '',
        city: user?.location?.city || '',
        state: user?.location?.state || '',
        country: user?.location?.country || ''
    });
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                address: user.location?.address || '',
                city: user.location?.city || '',
                state: user.location?.state || '',
                country: user.location?.country || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authApi.updateProfile({
                name: formData.name,
                phone: formData.phone,
                location: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country
                }
            });

            if (response.data.success) {
                setUser(response.data.user);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditing(false);
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update profile' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match!' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordSection(false);
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to change password' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size must be less than 5MB' });
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await authApi.uploadProfilePicture(formData);

            if (response.data.success) {
                // Update user with new profile picture
                const updatedUser = { ...user, profilePicture: response.data.profilePicture };
                setUser(updatedUser);
                setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to upload profile picture' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authApi.resendVerification();

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' });
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

    const getRoleColor = (role) => {
        switch(role) {
            case 'admin': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            case 'vendor': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        }
    };

    if (!user) {
        return <Loader />;
    }

    return (
        <PageContainer>
            <div className="max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">My Profile</h1>

                {/* Message Display */}
                {message.text && (
                    <div className={`mb-3 sm:mb-4 p-3 rounded-lg text-sm ${
                        message.type === 'success' 
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Email Verification Banner */}
                {!user.emailVerified && (
                    <div className="mb-3 sm:mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h3 className="text-yellow-400 font-semibold text-sm sm:text-base">Email Not Verified</h3>
                                    <p className="text-yellow-300/80 text-xs sm:text-sm mt-1">
                                        Please verify your email address to access all features and receive important notifications.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleResendVerification}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                                {loading ? 'Sending...' : 'Resend Email'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile Picture Section */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-600/50 rounded-xl p-4 sm:p-5 mb-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-slate-700 shadow-lg">
                                {user.profilePicture ? (
                                    <img 
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-2xl sm:text-3xl font-bold text-white">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">{user.name}</h2>
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureUpload}
                                    className="hidden"
                                    disabled={loading}
                                />
                                <div className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all hover:scale-105 inline-block">
                                    {loading ? 'Uploading...' : 'Change Picture'}
                                </div>
                            </label>
                            <p className="text-xs text-slate-400 mt-1.5">
                                JPG, PNG, GIF or WebP. Max 5MB
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-xl p-4 sm:p-5 mb-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-white">Profile Information</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-all"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-3">
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing || loading}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing || loading}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 text-sm cursor-not-allowed"
                                    />
                                    {user.emailVerified && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-400">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs mt-1 flex items-center gap-1">
                                    <span className="text-slate-500">Cannot be changed</span>
                                    {user.emailVerified && (
                                        <span className="text-green-400">• Verified</span>
                                    )}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                    Role
                                </label>
                                <div className={`inline-block px-3 py-1.5 rounded-lg border text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
                                    {user.role}
                                </div>
                            </div>
                        </div>

                        {/* Location Fields */}
                        <div className="pt-3 border-t border-slate-700">
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Location</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        disabled={!isEditing || loading}
                                        placeholder="Enter your address"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        disabled={!isEditing || loading}
                                        placeholder="City"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        disabled={!isEditing || loading}
                                        placeholder="State"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        disabled={!isEditing || loading}
                                        placeholder="Country"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-2 sm:gap-3 pt-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user.name,
                                            phone: user.phone,
                                            email: user.email,
                                            address: user.location?.address || '',
                                            city: user.location?.city || '',
                                            state: user.location?.state || '',
                                            country: user.location?.country || ''
                                        });
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-600/50 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-white">Security</h2>
                        {!showPasswordSection && (
                            <button
                                onClick={() => setShowPasswordSection(true)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-all"
                            >
                                Change Password
                            </button>
                        )}
                    </div>

                    {showPasswordSection && (
                        <form onSubmit={handlePasswordUpdate} className="space-y-3">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 sm:gap-3 pt-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordSection(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default Profile;
