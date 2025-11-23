import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const navigate = useNavigate();

    const loadStats = async () => {
        try {
            const { data } = await adminApi.stats();
            setStats(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadUsers = async () => {
        try {
            const { data } = await adminApi.users();
            // Filter out admin users from the list
            const nonAdminUsers = (data.users || data).filter(u => u.role !== 'admin');
            setUsers(nonAdminUsers);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        (async () => {
            await loadStats();
            await loadUsers();
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
            const res = await adminApi.downloadMonthlyReport(year, month);
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `monthly-report-${year}-${month}.pdf`;
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
                <div className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-900 to-blue-900/30 border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(148 163 184) 1px, transparent 0)',
                            backgroundSize: '48px 48px'
                        }}></div>
                    </div>

                    <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
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
                        <button
                            onClick={() => navigate("/vehicles")}
                            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Browse Vehicles
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                        {[
                            { 
                                label: "Total Users", 
                                value: stats?.usersCount ?? "--", 
                                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                                gradient: "from-blue-500/20 to-blue-600/20", 
                                border: "border-blue-500/30", 
                                text: "text-blue-400" 
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
                                    <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center">
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

                {/* Users & Vendors Section */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-800/50">
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

                {/* Monthly Report Section */}
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
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Year
                            </label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Month
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white"
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
            </div>
        </div>
    );
};

export default AdminDashboard;