import React from 'react';

const ApiDocs = () => {
    const sections = [
        {
            title: "Authentication",
            basePath: "/auth",
            endpoints: [
                { method: "POST", path: "/register", description: "Register a new user or vendor", access: "Public" },
                { method: "POST", path: "/login", description: "Login with email and password", access: "Public" },
                { method: "POST", path: "/admin/login", description: "Admin login", access: "Public" },
                { method: "GET", path: "/me", description: "Get current user profile", access: "Authenticated" },
                { method: "PUT", path: "/profile", description: "Update user profile details", access: "Authenticated" },
                { method: "POST", path: "/profile-picture", description: "Upload profile picture", access: "Authenticated" },
                { method: "POST", path: "/forgot-password", description: "Request password reset link", access: "Public" },
                { method: "POST", path: "/reset-password", description: "Reset password using token", access: "Public" },
                { method: "POST", path: "/change-password", description: "Change current password", access: "Authenticated" },
            ]
        },
        {
            title: "Vehicles",
            basePath: "/vehicles",
            endpoints: [
                { method: "GET", path: "/", description: "Get all vehicles (with filters)", access: "Public" },
                { method: "GET", path: "/:id", description: "Get vehicle details by ID", access: "Public" },
                { method: "POST", path: "/", description: "Add a new vehicle", access: "Vendor/Admin" },
                { method: "PUT", path: "/:id", description: "Update vehicle details", access: "Vendor/Admin" },
                { method: "DELETE", path: "/:id", description: "Delete a vehicle", access: "Vendor/Admin" },
            ]
        },
        {
            title: "Bookings",
            basePath: "/bookings",
            endpoints: [
                { method: "POST", path: "/", description: "Create a new booking", access: "User" },
                { method: "GET", path: "/me", description: "Get current user's bookings", access: "User" },
                { method: "GET", path: "/vendor", description: "Get bookings for vendor's vehicles", access: "Vendor" },
                { method: "GET", path: "/:id", description: "Get booking details by ID", access: "Authenticated" },
                { method: "POST", path: "/:id/cancel", description: "Cancel a booking", access: "User" },
                { method: "POST", path: "/complete-expired", description: "Mark expired bookings as completed", access: "Admin/Vendor" },
            ]
        },
        {
            title: "Payments",
            basePath: "/payments",
            endpoints: [
                { method: "POST", path: "/razorpay/create-order", description: "Create a Razorpay order", access: "Authenticated" },
                { method: "POST", path: "/razorpay/verify", description: "Verify payment signature", access: "Authenticated" },
                { method: "POST", path: "/razorpay/refund", description: "Initiate a refund", access: "Admin/Vendor" },
                { method: "POST", path: "/razorpay/webhook", description: "Handle payment events", access: "Public (Webhook)" },
            ]
        },
        {
            title: "Admin",
            basePath: "/admin",
            endpoints: [
                { method: "GET", path: "/stats", description: "Get platform statistics", access: "Admin" },
                { method: "GET", path: "/users", description: "List all users", access: "Admin" },
                { method: "GET", path: "/bookings/recent", description: "Get recent bookings", access: "Admin" },
                { method: "GET", path: "/transactions/recent", description: "Get recent transactions", access: "Admin" },
                { method: "POST", path: "/vendor/:id/approve", description: "Approve a vendor account", access: "Admin" },
                { method: "DELETE", path: "/vendor/:id/remove", description: "Remove/Ban a vendor", access: "Admin" },
            ]
        },
        {
            title: "Reports",
            basePath: "/reports",
            endpoints: [
                { method: "GET", path: "/stats", description: "Get dashboard statistics", access: "Admin" },
                { method: "GET", path: "/monthly/:year/:month/download", description: "Download monthly report (CSV/PDF)", access: "Admin" },
            ]
        },
        {
            title: "Transactions",
            basePath: "/transactions",
            endpoints: [
                { method: "GET", path: "/my-transactions", description: "Get current user's transaction history", access: "Authenticated" },
                { method: "GET", path: "/:id", description: "Get transaction details by ID", access: "Authenticated" },
            ]
        },
        {
            title: "SMS",
            basePath: "/sms",
            endpoints: [
                { method: "POST", path: "/send", description: "Send an SMS notification", access: "Admin/Vendor" },
            ]
        }
    ];

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'POST': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'PUT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                        Vehicle Rental Services API
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Comprehensive documentation for the Vehicle Rental Services REST API.
                    </p>
                    <div className="mt-6 inline-block px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 font-mono text-sm">
                        Base URL: <span className="text-blue-400">https://vrs-frontend-sg.vercel.app/api</span>
                    </div>
                </div>

                <div className="space-y-12">
                    {sections.map((section, index) => (
                        <div key={index} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800/80">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                                    {section.title}
                                    <span className="text-sm font-normal text-slate-400 font-mono ml-auto">
                                        {section.basePath}
                                    </span>
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-700/50">
                                {section.endpoints.map((endpoint, idx) => (
                                    <div key={idx} className="p-6 hover:bg-slate-800/80 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                                            <div className={`px-3 py-1 rounded-md border font-mono text-sm font-bold w-fit ${getMethodColor(endpoint.method)}`}>
                                                {endpoint.method}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                                    <code className="text-blue-300 font-mono text-base">
                                                        {endpoint.path}
                                                    </code>
                                                    <span className="hidden md:inline text-slate-600">•</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600 w-fit">
                                                        {endpoint.access}
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 text-sm">
                                                    {endpoint.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} Vehicle Rental Services. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default ApiDocs;
