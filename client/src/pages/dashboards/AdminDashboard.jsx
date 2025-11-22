import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import { toast } from "react-toastify";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

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
            setUsers(data.users || data);
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
        <div className="space-y-4">
            <h1 className="text-lg font-semibold">Admin dashboard</h1>

            <section className="grid md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <p className="text-slate-400 text-[11px]">Total users</p>
                    <p className="text-xl font-semibold">
                        {stats?.usersCount ?? "--"}
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <p className="text-slate-400 text-[11px]">Total bookings</p>
                    <p className="text-xl font-semibold">
                        {stats?.bookingsCount ?? "--"}
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <p className="text-slate-400 text-[11px]">Revenue (₹)</p>
                    <p className="text-xl font-semibold">
                        {stats?.totalRevenue?.toFixed?.(0) ?? "--"}
                    </p>
                </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-semibold">Users & vendors</h2>
                    <div className="flex gap-2 text-[11px] text-slate-400">
                        <span>Manage vendors and their approval</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="py-2 pr-2">Name</th>
                                <th className="py-2 pr-2">Email</th>
                                <th className="py-2 pr-2">Role</th>
                                <th className="py-2 pr-2">Status</th>
                                <th className="py-2 pr-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr
                                    key={u._id}
                                    className="border-b border-slate-800/60 last:border-0"
                                >
                                    <td className="py-2 pr-2">{u.name}</td>
                                    <td className="py-2 pr-2">{u.email}</td>
                                    <td className="py-2 pr-2 capitalize">{u.role}</td>
                                    <td className="py-2 pr-2">
                                        {u.isApproved ? "Approved" : "Pending"}
                                    </td>
                                    <td className="py-2 pr-2 text-right">
                                        {u.role === "vendor" && !u.isApproved && (
                                            <button
                                                onClick={() => handleApproveVendor(u._id)}
                                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[10px]"
                                            >
                                                Approve vendor
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-3 text-slate-400 text-center text-[11px]"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-semibold">Monthly report</h2>
                </div>
                <div className="flex gap-3 items-end">
                    <div className="space-y-1">
                        <label>Year</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="w-24"
                        />
                    </div>
                    <div className="space-y-1">
                        <label>Month</label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="w-20"
                        />
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="px-4 py-2 rounded-xl bg-primary-soft hover:bg-primary-dark text-xs font-medium"
                    >
                        Download PDF
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;