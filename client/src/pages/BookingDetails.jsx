import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookingApi } from "../api/bookings";
import Loader from "../components/common/Loader";
import { toast } from "react-toastify";

const BookingDetails = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBooking = async () => {
        try {
            const { data } = await bookingApi.getById(bookingId);
            
            // Only allow access if payment is completed
            if (data.payment?.status !== 'paid') {
                toast.error("This page is only accessible after payment completion");
                navigate("/dashboard");
                return;
            }
            
            setBooking(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load booking details");
            navigate("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await bookingApi.cancel(bookingId);
                toast.success('Booking cancelled successfully');
                await fetchBooking();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to cancel booking');
            }
        }
    };

    useEffect(() => {
        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId, navigate]);

    if (loading) {
        return <Loader />;
    }

    if (!booking) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">Booking not found</p>
            </div>
        );
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const calculateDuration = () => {
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        const hours = Math.ceil((end - start) / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        if (days > 0) {
            return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
        }
        return `${hours}h`;
    };

    const getStatusConfig = (status) => {
        const configs = {
            approved: {
                bg: "bg-blue-500/20",
                text: "text-blue-400",
                border: "border-blue-500/30",
                icon: "✓",
                label: "Approved - Awaiting Payment"
            },
            paid: {
                bg: "bg-emerald-500/20",
                text: "text-emerald-400",
                border: "border-emerald-500/30",
                icon: "✓",
                label: "Paid"
            },
            completed: {
                bg: "bg-purple-500/20",
                text: "text-purple-400",
                border: "border-purple-500/30",
                icon: "✓",
                label: "Completed"
            },
            cancelled: {
                bg: "bg-slate-500/20",
                text: "text-slate-400",
                border: "border-slate-500/30",
                icon: "✗",
                label: "Cancelled"
            }
        };
        return configs[status] || configs.approved;
    };

    const statusConfig = getStatusConfig(booking.status);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            {/* Print Styles */}
            <style>{`
                @media print {
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body * {
                        visibility: hidden;
                    }
                    
                    #printable-receipt,
                    #printable-receipt * {
                        visibility: visible;
                    }
                    
                    #printable-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                        padding: 30px 40px;
                        display: block !important;
                        font-family: Arial, sans-serif;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    .print-header {
                        border-bottom: 3px solid #3b82f6;
                        padding-bottom: 20px;
                        margin-bottom: 25px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                    }
                    
                    .print-company-name {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1e293b;
                        margin-bottom: 5px;
                    }
                    
                    .print-company-tagline {
                        color: #64748b;
                        font-size: 12px;
                        margin-bottom: 10px;
                    }
                    
                    .print-company-details {
                        font-size: 11px;
                        color: #64748b;
                        line-height: 1.6;
                    }
                    
                    .print-header-right {
                        text-align: right;
                        font-size: 11px;
                        color: #64748b;
                    }
                    
                    .print-title {
                        font-size: 20px;
                        font-weight: bold;
                        color: #1e293b;
                        text-align: center;
                        margin: 20px 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        padding: 10px;
                        background: #f1f5f9;
                        border-radius: 6px;
                    }
                    
                    .print-section {
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                    }
                    
                    .print-section-title {
                        font-size: 14px;
                        font-weight: 700;
                        color: #1e293b;
                        background: #f8fafc;
                        padding: 8px 12px;
                        margin-bottom: 12px;
                        border-left: 4px solid #3b82f6;
                    }
                    
                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    
                    .print-table tr {
                        border-bottom: 1px solid #e2e8f0;
                    }
                    
                    .print-table tr:last-child {
                        border-bottom: none;
                    }
                    
                    .print-table td {
                        padding: 10px 8px;
                        font-size: 12px;
                    }
                    
                    .print-table td:first-child {
                        color: #64748b;
                        font-weight: 500;
                        width: 35%;
                    }
                    
                    .print-table td:last-child {
                        color: #1e293b;
                        font-weight: 600;
                    }
                    
                    .print-barcode {
                        text-align: center;
                        margin: 15px 0;
                        padding: 15px;
                        background: #f8fafc;
                        border: 2px dashed #cbd5e1;
                        border-radius: 8px;
                    }
                    
                    .print-booking-id {
                        font-family: 'Courier New', monospace;
                        font-size: 13px;
                        color: #1e293b;
                        letter-spacing: 1px;
                        font-weight: bold;
                        margin: 8px 0;
                    }
                    
                    .print-status-badge {
                        display: inline-block;
                        padding: 6px 16px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 700;
                        margin-top: 8px;
                    }
                    
                    .print-status-paid {
                        background: #d1fae5;
                        color: #065f46;
                        border: 1px solid #10b981;
                    }
                    
                    .print-total-box {
                        background: #eff6ff;
                        border: 2px solid #3b82f6;
                        padding: 15px 20px;
                        border-radius: 8px;
                        margin-top: 15px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .print-total-label {
                        font-size: 16px;
                        font-weight: 700;
                        color: #1e293b;
                    }
                    
                    .print-total-amount {
                        font-size: 22px;
                        font-weight: bold;
                        color: #2563eb;
                    }
                    
                    .print-instructions {
                        background: #fef3c7;
                        padding: 15px;
                        border-radius: 6px;
                        border: 1px solid #fbbf24;
                        margin-top: 10px;
                    }
                    
                    .print-instructions ul {
                        margin: 0;
                        padding-left: 20px;
                        font-size: 11px;
                        color: #92400e;
                        line-height: 1.8;
                    }
                    
                    .print-terms {
                        margin-top: 20px;
                        padding: 15px;
                        background: #f8fafc;
                        border-radius: 6px;
                        font-size: 10px;
                        color: #475569;
                        line-height: 1.7;
                    }
                    
                    .print-terms-title {
                        font-weight: 700;
                        color: #1e293b;
                        margin-bottom: 10px;
                        font-size: 12px;
                    }
                    
                    .print-terms ol {
                        margin: 0;
                        padding-left: 20px;
                    }
                    
                    .print-signature {
                        margin-top: 35px;
                        display: flex;
                        justify-content: space-between;
                        gap: 60px;
                    }
                    
                    .print-signature-box {
                        flex: 1;
                        border-top: 2px solid #cbd5e1;
                        padding-top: 10px;
                        text-align: center;
                        font-size: 11px;
                        font-weight: 600;
                        color: #475569;
                    }
                    
                    .print-footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 2px solid #e2e8f0;
                        text-align: center;
                        font-size: 10px;
                        color: #64748b;
                        line-height: 1.6;
                    }
                    
                    .print-vehicle-image {
                        max-width: 100%;
                        max-height: 180px;
                        height: auto;
                        border-radius: 6px;
                        margin-bottom: 15px;
                        display: block;
                        margin-left: auto;
                        margin-right: auto;
                        border: 1px solid #e2e8f0;
                    }
                }
            `}</style>

            {/* Printable Receipt */}
            <div id="printable-receipt" className="hidden">
                {/* Print Header */}
                <div className="print-header">
                    <div>
                        <div className="print-company-name">🚗 Vehicle Rental Services</div>
                        <div className="print-company-tagline">Your Trusted Mobility Partner</div>
                        <div className="print-company-details">
                            <div>📧 support@vehiclerental.com</div>
                            <div>📞 +91-1234567890</div>
                            <div>🌐 www.vehiclerental.com</div>
                        </div>
                    </div>
                    <div className="print-header-right">
                        <div><strong>Receipt Date:</strong></div>
                        <div>{new Date().toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                        })}</div>
                        <div style={{ marginTop: '8px' }}><strong>Print Time:</strong></div>
                        <div>{new Date().toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                        })}</div>
                    </div>
                </div>

                <div className="print-title">📝 Booking Receipt</div>

                {/* Booking ID */}
                <div className="print-barcode">
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '5px', fontWeight: '600' }}>BOOKING ID</div>
                    <div className="print-booking-id">{booking._id}</div>
                    <div>
                        <span className="print-status-badge print-status-paid">
                            ✓ PAYMENT {booking.payment?.status?.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="print-section">
                    <div className="print-section-title">👤 Customer Information</div>
                    <table className="print-table">
                        <tbody>
                            <tr>
                                <td>Name:</td>
                                <td>{booking.user?.name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Email:</td>
                                <td>{booking.user?.email || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Phone:</td>
                                <td>{booking.user?.phone || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Booking Status:</td>
                                <td style={{ textTransform: 'capitalize' }}>{booking.status}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Vehicle Information */}
                <div className="print-section">
                    <div className="print-section-title">🚗 Vehicle Details</div>
                    {booking.vehicle?.images?.[0] && (
                        <img 
                            src={booking.vehicle.images[0].url} 
                            alt={booking.vehicle.name}
                            className="print-vehicle-image"
                        />
                    )}
                    <table className="print-table">
                        <tbody>
                            <tr>
                                <td>Vehicle Name:</td>
                                <td>{booking.vehicle?.name}</td>
                            </tr>
                            <tr>
                                <td>Vehicle Type:</td>
                                <td style={{ textTransform: 'capitalize' }}>{booking.vehicle?.type}</td>
                            </tr>
                            <tr>
                                <td>Location:</td>
                                <td>
                                    {booking.vehicle?.location?.city}, {booking.vehicle?.location?.state}
                                </td>
                            </tr>
                            <tr>
                                <td>Hourly Rate:</td>
                                <td>Rs. {booking.vehicle?.pricePerHour}/hour</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Rental Period */}
                <div className="print-section">
                    <div className="print-section-title">📅 Rental Period</div>
                    <table className="print-table">
                        <tbody>
                            <tr>
                                <td>Start Date & Time:</td>
                                <td>{formatDate(booking.start)}</td>
                            </tr>
                            <tr>
                                <td>End Date & Time:</td>
                                <td>{formatDate(booking.end)}</td>
                            </tr>
                            <tr>
                                <td>Total Duration:</td>
                                <td>{calculateDuration()}</td>
                            </tr>
                            <tr>
                                <td>Booking Date:</td>
                                <td>
                                    {new Date(booking.createdAt).toLocaleDateString('en-IN', { 
                                        day: '2-digit', 
                                        month: 'short', 
                                        year: 'numeric' 
                                    })}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Payment Details */}
                <div className="print-section">
                    <div className="print-section-title">💳 Payment Details</div>
                    <table className="print-table">
                        <tbody>
                            <tr>
                                <td>Payment Method:</td>
                                <td style={{ textTransform: 'capitalize' }}>
                                    {booking.payment?.provider || 'N/A'}
                                </td>
                            </tr>
                            {booking.payment?.providerPaymentId && (
                                <tr>
                                    <td>Transaction ID:</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                        {booking.payment.providerPaymentId}
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <td>Payment Status:</td>
                                <td style={{ 
                                    color: booking.payment?.status === 'paid' ? '#059669' : '#d97706',
                                    textTransform: 'uppercase',
                                    fontWeight: '700'
                                }}>
                                    {booking.payment?.status || 'Pending'}
                                </td>
                            </tr>
                            {booking.payment?.paidAt && (
                                <tr>
                                    <td>Payment Date:</td>
                                    <td>
                                        {new Date(booking.payment.paidAt).toLocaleString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    <div className="print-total-box">
                        <span className="print-total-label">Total Amount Paid:</span>
                        <span className="print-total-amount">Rs. {booking.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {/* Vendor Information */}
                {booking.vendor && (
                    <div className="print-section">
                        <div className="print-section-title">🏢 Vendor Information</div>
                        <table className="print-table">
                            <tbody>
                                <tr>
                                    <td>Vendor Name:</td>
                                    <td>{booking.vendor.name}</td>
                                </tr>
                                {booking.vendor.email && (
                                    <tr>
                                        <td>Email:</td>
                                        <td>{booking.vendor.email}</td>
                                    </tr>
                                )}
                                {booking.vendor.phone && (
                                    <tr>
                                        <td>Contact:</td>
                                        <td>{booking.vendor.phone}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Important Instructions */}
                <div className="print-section">
                    <div className="print-section-title">⚠️ Important Instructions</div>
                    <div className="print-instructions">
                        <ul>
                            <li>Carry valid ID proof and driving license at pickup</li>
                            <li>Vehicle inspection will be done before handover</li>
                            <li>Return vehicle with same fuel level as pickup</li>
                            <li>Late charges: Rs. {Math.round(booking.vehicle?.pricePerHour * 1.5)}/hour after 1 hour grace period</li>
                            <li>Contact vendor/support for issues or queries</li>
                            <li>Keep this receipt for pickup and records</li>
                        </ul>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="print-terms">
                    <div className="print-terms-title">📋 Terms & Conditions</div>
                    <ol>
                        <li>Renter must be at least 21 years old with valid driving license.</li>
                        <li>Security deposit refunded within 7 working days after return.</li>
                        <li>Vehicle must be returned in same condition as pickup.</li>
                        <li>Renter responsible for traffic violations and fines.</li>
                        <li>Renter liable for damage unless covered by insurance.</li>
                        <li>Cancellation charges apply. Refund processed in 7-10 days.</li>
                        <li>Company reserves right to refuse service or terminate rental.</li>
                        <li>Receipt valid only for this booking, non-transferable.</li>
                    </ol>
                </div>

                {/* Signatures */}
                <div className="print-signature">
                    <div className="print-signature-box">
                        Customer Signature
                    </div>
                    <div className="print-signature-box">
                        Authorized Signature
                    </div>
                </div>

                {/* Footer */}
                <div className="print-footer">
                    <div style={{ marginBottom: '5px' }}>
                        This is a computer-generated receipt and does not require a physical signature.
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: '8px 0' }}>
                        Thank you for choosing Vehicle Rental Services! 🚗
                    </div>
                    <div>
                        Support: support@vehiclerental.com | +91-1234567890 | Available 24/7
                    </div>
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                        © {new Date().getFullYear()} Vehicle Rental Services. All rights reserved.
                    </div>
                </div>
            </div>

        <div className="min-h-[70vh] py-8 px-4 no-print">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Success Banner */}
                {booking.payment?.status === 'paid' && (
                    <div className="bg-linear-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 rounded-2xl p-6 flex items-center gap-4 animate-fadeIn">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-1">Payment Successful!</h2>
                            <p className="text-emerald-200">Your booking has been confirmed. We've sent the details to your email.</p>
                        </div>
                    </div>
                )}

                {/* Main Details Card */}
                <div className="bg-linear-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed</h1>
                                <div className="flex items-center gap-3">
                                    <code className="text-sm font-mono text-cyan-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                                        ID: {booking._id}
                                    </code>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(booking._id);
                                            toast.success("Booking ID copied!");
                                        }}
                                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                                        title="Copy Booking ID"
                                    >
                                        <svg className="w-4 h-4 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                {statusConfig.icon} {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Vehicle Information */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Vehicle Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {booking.vehicle?.images?.[0] && (
                                    <div className="rounded-lg overflow-hidden border border-slate-700">
                                        <img 
                                            src={booking.vehicle.images[0].url} 
                                            alt={booking.vehicle.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-2xl font-bold text-white">{booking.vehicle?.name}</h4>
                                        <p className="text-slate-400 capitalize">{booking.vehicle?.type}</p>
                                    </div>
                                    {booking.vehicle?.description && (
                                        <p className="text-sm text-slate-400 line-clamp-3">{booking.vehicle.description}</p>
                                    )}
                                    {booking.vehicle?.location && (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {booking.vehicle.location.address}, {booking.vehicle.location.city}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-400">Rate:</span>
                                        <span className="text-lg font-semibold text-amber-400">₹{booking.vehicle?.pricePerHour}/hr</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Timeline */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Rental Period
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Start Time</p>
                                    <p className="text-sm font-semibold text-white">{formatDate(booking.start)}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">End Time</p>
                                    <p className="text-sm font-semibold text-white">{formatDate(booking.end)}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                                    <p className="text-sm font-semibold text-white">{calculateDuration()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-slate-700">
                                    <span className="text-slate-400">Payment Status</span>
                                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                        booking.payment?.status === 'paid' 
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    }`}>
                                        {booking.payment?.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                                    </span>
                                </div>
                                {booking.payment?.provider && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-700">
                                        <span className="text-slate-400">Payment Method</span>
                                        <span className="text-white font-medium capitalize">{booking.payment.provider}</span>
                                    </div>
                                )}
                                {booking.payment?.providerPaymentId && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-700">
                                        <span className="text-slate-400">Transaction ID</span>
                                        <code className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-cyan-500/30">
                                            {booking.payment.providerPaymentId}
                                        </code>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-3 bg-linear-to-r from-emerald-600/20 to-emerald-500/20 px-4 rounded-lg border border-emerald-500/30 mt-4">
                                    <span className="text-white font-semibold text-lg">Total Amount</span>
                                    <span className="text-3xl font-bold text-emerald-400">₹{booking.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Vendor Information */}
                        {booking.vendor && (
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Vendor Contact
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="font-medium">{booking.vendor.name}</span>
                                    </div>
                                    {booking.vendor.email && (
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {booking.vendor.email}
                                        </div>
                                    )}
                                    {booking.vendor.phone && (
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {booking.vendor.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="bg-slate-700/50 border-t border-slate-600 p-6">
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all"
                            >
                                Back to Dashboard
                            </button>
                            {(booking.status === 'approved' || booking.status === 'paid') && (
                                <button
                                    onClick={handleCancelBooking}
                                    className="px-6 py-3 rounded-xl bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium transition-all flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel Booking
                                </button>
                            )}
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default BookingDetails;