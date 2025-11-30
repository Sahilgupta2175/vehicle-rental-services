import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DatePicker from "../../components/common/DatePicker";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
    });
    const navigate = useNavigate();

    const loadStats = async () => {
        try {
            const { data } = await adminApi.stats();
            setStats(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadRecentBookings = async () => {
        try {
            const { data } = await adminApi.recentBookings();
            setRecentBookings(data.bookings || data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadRecentTransactions = async () => {
        try {
            const { data } = await adminApi.recentTransactions();
            setRecentTransactions(data.transactions || data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadUsers = async () => {
        try {
            const { data } = await adminApi.users();
            // Filter out admin users from the list
            const nonAdminUsers = (data.users || data).filter(u => u.role !== 'admin');
            setAllUsers(nonAdminUsers);
            filterUsers(nonAdminUsers, roleFilter);
        } catch (err) {
            console.error(err);
        }
    };

    const filterUsers = (userList, filter, search = searchQuery) => {
        let filtered = userList;

        // Apply role filter
        if (filter !== 'all') {
            filtered = filtered.filter(u => u.role === filter);
        }

        // Apply search filter
        if (search.trim()) {
            const query = search.toLowerCase().trim();
            filtered = filtered.filter(u => {
                const name = u.name?.toLowerCase() || '';
                const email = u.email?.toLowerCase() || '';
                const role = u.role?.toLowerCase() || '';
                const status = u.role === 'vendor'
                    ? (u.isVendorApproved ? 'approved' : 'pending')
                    : 'active';

                return name.includes(query) ||
                    email.includes(query) ||
                    role.includes(query) ||
                    status.includes(query);
            });
        }

        setUsers(filtered);
    };

    const handleRoleFilterChange = (filter) => {
        setRoleFilter(filter);
        filterUsers(allUsers, filter, searchQuery);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        filterUsers(allUsers, roleFilter, query);
    };

    useEffect(() => {
        (async () => {
            await Promise.all([
                loadStats(),
                loadUsers(),
                loadRecentBookings(),
                loadRecentTransactions()
            ]);
        })();
    }, []);

    const handleApproveVendor = async (id) => {
        try {
            await adminApi.approveVendor(id);
            toast.success("Vendor approved");
            loadUsers();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Failed to approve vendor");
        }
    };

    const handleRemoveVendor = async (id, vendorName) => {
        if (!window.confirm(`Are you sure you want to remove vendor "${vendorName}"? This will also delete all their vehicles and cannot be undone.`)) {
            return;
        }

        try {
            await adminApi.removeVendor(id);
            toast.success("Vendor removed successfully");
            loadUsers();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Failed to remove vendor");
        }
    };

    const handleDownloadReport = async () => {
        try {
            const res = await adminApi.downloadMonthlyReport(selectedDate.year, selectedDate.month);
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `monthly-report-${selectedDate.year}-${selectedDate.month}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Failed to download report");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header Section */}
                <div className="relative overflow-hidden bg-linear-to-br from-slate-800 via-slate-800 to-blue-900/30 border border-slate-600/50 rounded-3xl p-8 shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(148 163 184) 1px, transparent 0)',
                            backgroundSize: '48px 48px'
                        }}></div>
                    </div>

                    <div className="relative flex items-start gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/40 shrink-0">
                            <svg className="w-11 h-11 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-linear-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent mb-2">
                                Admin Dashboard
                            </h1>
                            <p className="text-slate-400 text-base">Manage users, vendors, and system analytics</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        {[
                            { 
                                label: "Total Users", 
                                value: stats?.usersCount ?? "--", 
                                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                                gradient: "from-blue-500/20 to-blue-600/20", 
                                border: "border-blue-500/30", 
                                text: "text-blue-400" 
                            },
                            { 
                                label: "Total Vendors", 
                                value: stats?.vendorsCount ?? "--", 
                                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                                gradient: "from-amber-500/20 to-orange-500/20", 
                                border: "border-amber-500/30", 
                                text: "text-amber-400" 
                            },
                            { 
                                label: "Total Bookings", 
                                value: stats?.bookingsCount ?? "--", 
                                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                                gradient: "from-purple-500/20 to-pink-500/20", 
                                border: "border-purple-500/30", 
                                text: "text-purple-400" 
                            },
                            { 
                                label: "Revenue", 
                                value: `₹${stats?.totalRevenue?.toFixed?.(0) ?? "--"}`, 
                                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                                gradient: "from-emerald-500/20 to-green-500/20", 
                                border: "border-emerald-500/30", 
                                text: "text-emerald-400" 
                            },
                        ].map((stat) => (
                            <div key={stat.label} className={`bg-linear-to-br ${stat.gradient} border ${stat.border} rounded-2xl p-5 hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                                        <svg className={`w-5 h-5 ${stat.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                                </div>
                                <p className={`text-3xl font-bold ${stat.text}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-2">
                    <div className="flex gap-2 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                            { id: 'users', label: 'Users & Vendors', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                            { id: 'bookings', label: 'Recent Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                            { id: 'transactions', label: 'Transactions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                            { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                </svg>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Recent Bookings
                            </h3>
                            <div className="space-y-3">
                                {recentBookings.slice(0, 5).map((booking) => (
                                    <div key={booking._id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-blue-500/50 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-medium">{booking.vehicle?.name}</p>
                                                <p className="text-xs text-slate-400">{booking.user?.name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                booking.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                                                booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {new Date(booking.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                                {recentBookings.length === 0 && (
                                    <p className="text-slate-500 text-center py-8">No recent bookings</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Recent Transactions
                            </h3>
                            <div className="space-y-3">
                                {recentTransactions.slice(0, 5).map((transaction) => (
                                    <div key={transaction._id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-emerald-500/50 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-medium">₹{transaction.amount}</p>
                                                <p className="text-xs text-slate-400">{transaction.user?.name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                transaction.type === 'charge' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {transaction.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-slate-500">
                                                {new Date(transaction.createdAt).toLocaleString()}
                                            </p>
                                            <span className={`text-xs font-medium ${
                                                transaction.status === 'completed' ? 'text-green-400' :
                                                transaction.status === 'refunded' ? 'text-orange-400' :
                                                'text-yellow-400'
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {recentTransactions.length === 0 && (
                                    <p className="text-slate-500 text-center py-8">No recent transactions</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users & Vendors Tab */}
                {activeTab === 'users' && (
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl">
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Users & Vendors</h2>
                                    <p className="text-sm text-slate-400">Manage vendors and their approval</p>
                                </div>
                            </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search by name, email, role, or status..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        filterUsers(allUsers, roleFilter, '');
                                    }}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleRoleFilterChange('all')}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                                    roleFilter === 'all'
                                        ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                All ({allUsers.length})
                            </button>
                            <button
                                onClick={() => handleRoleFilterChange('user')}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                                    roleFilter === 'user'
                                        ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                Users ({allUsers.filter(u => u.role === 'user').length})
                            </button>
                            <button
                                onClick={() => handleRoleFilterChange('vendor')}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                                    roleFilter === 'vendor'
                                        ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                Vendors ({allUsers.filter(u => u.role === 'vendor').length})
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/50">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-700/50">
                                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Name</th>
                                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Email</th>
                                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Role</th>
                                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Status</th>
                                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr
                                        key={u._id}
                                        className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="py-4 px-4 text-white font-medium">{u.name}</td>
                                        <td className="py-4 px-4 text-slate-300">{u.email}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                u.role === 'admin' 
                                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                    : u.role === 'vendor'
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            }`}>
                                                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            {u.role === 'vendor' ? (
                                                u.isVendorApproved ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Pending
                                                    </span>
                                                )
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {u.role === "vendor" && !u.isVendorApproved && (
                                                    <button
                                                        onClick={() => handleApproveVendor(u._id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Approve
                                                    </button>
                                                )}
                                                {u.role === "vendor" && (
                                                    <button
                                                        onClick={() => handleRemoveVendor(u._id, u.name)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-slate-400">No users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    </div>
                )}

                {/* Recent Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6">All Recent Bookings</h2>
                        <div className="space-y-4">
                            {recentBookings.map((booking) => (
                                <div key={booking._id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-blue-500/30 transition-all">
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-1">{booking.vehicle?.name}</h3>
                                            <p className="text-sm text-slate-400">{booking.vehicle?.type}</p>
                                            <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                                <span className="text-slate-300">
                                                    <strong>User:</strong> {booking.user?.name}
                                                </span>
                                                <span className="text-slate-300">
                                                    <strong>Vendor:</strong> {booking.vendor?.name}
                                                </span>
                                                <span className="text-slate-300">
                                                    <strong>Amount:</strong> ₹{booking.totalAmount}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                booking.status === 'paid' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                booking.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            }`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                            <p className="text-xs text-slate-500">
                                                {new Date(booking.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentBookings.length === 0 && (
                                <div className="text-center py-16">
                                    <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-slate-400">No bookings found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6">All Recent Transactions</h2>
                        <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/50">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700 bg-slate-700/50">
                                        <th className="text-left py-4 px-4 font-semibold text-slate-300">User</th>
                                        <th className="text-left py-4 px-4 font-semibold text-slate-300">Amount</th>
                                        <th className="text-left py-4 px-4 font-semibold text-slate-300">Type</th>
                                        <th className="text-left py-4 px-4 font-semibold text-slate-300">Provider</th>
                                        <th className="text-left py-4 px-4 font-semibold text-slate-300">Status</th>
                                        <th className="text-left py-4 px-4 font-semibold text-slate-300">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map((transaction) => (
                                        <tr key={transaction._id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-4 text-white">{transaction.user?.name}</td>
                                            <td className="py-4 px-4 text-emerald-400 font-semibold">₹{transaction.amount}</td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                                                    transaction.type === 'charge' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-300 capitalize">{transaction.provider}</td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                                                    transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                    transaction.status === 'refunded' ? 'bg-orange-500/20 text-orange-400' :
                                                    transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-400 text-xs">
                                                {new Date(transaction.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center">
                                                <p className="text-slate-400">No transactions found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Monthly Report</h2>
                            <p className="text-sm text-slate-400">Download detailed monthly analytics</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                label="Select Month"
                            />
                        </div>
                        <button
                            onClick={handleDownloadReport}
                            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;