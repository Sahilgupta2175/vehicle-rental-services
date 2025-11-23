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

    useEffect(() => {
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
            pending: {
                bg: "bg-yellow-500/20",
                text: "text-yellow-400",
                border: "border-yellow-500/30",
                icon: "⏳",
                label: "Pending Approval"
            },
            approved: {
                bg: "bg-blue-500/20",
                text: "text-blue-400",
                border: "border-blue-500/30",
                icon: "✓",
                label: "Approved"
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
            rejected: {
                bg: "bg-red-500/20",
                text: "text-red-400",
                border: "border-red-500/30",
                icon: "✗",
                label: "Rejected"
            },
            cancelled: {
                bg: "bg-slate-500/20",
                text: "text-slate-400",
                border: "border-slate-500/30",
                icon: "✗",
                label: "Cancelled"
            }
        };
        return configs[status] || configs.pending;
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
                        padding: 40px;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    .print-header {
                        border-bottom: 3px solid #2563eb;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .print-company-name {
                        font-size: 28px;
                        font-weight: bold;
                        color: #1e293b;
                        margin-bottom: 5px;
                    }
                    
                    .print-company-tagline {
                        color: #64748b;
                        font-size: 14px;
                    }
                    
                    .print-title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1e293b;
                        text-align: center;
                        margin: 20px 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    .print-section {
                        margin-bottom: 25px;
                        page-break-inside: avoid;
                    }
                    
                    .print-section-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #1e293b;
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 8px;
                        margin-bottom: 15px;
                    }
                    
                    .print-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                    }
                    
                    .print-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #f1f5f9;
                    }
                    
                    .print-label {
                        color: #64748b;
                        font-weight: 500;
                    }
                    
                    .print-value {
                        color: #1e293b;
                        font-weight: 600;
                    }
                    
                    .print-total {
                        background: #f1f5f9;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .print-total-label {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1e293b;
                    }
                    
                    .print-total-amount {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2563eb;
                    }
                    
                    .print-footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 2px solid #e2e8f0;
                        text-align: center;
                    }
                    
                    .print-terms {
                        margin-top: 30px;
                        padding: 20px;
                        background: #f8fafc;
                        border-radius: 8px;
                        font-size: 11px;
                        color: #475569;
                        line-height: 1.6;
                    }
                    
                    .print-terms-title {
                        font-weight: 600;
                        color: #1e293b;
                        margin-bottom: 10px;
                        font-size: 12px;
                    }
                    
                    .print-barcode {
                        text-align: center;
                        margin: 20px 0;
                        padding: 15px;
                        background: #f8fafc;
                        border-radius: 8px;
                    }
                    
                    .print-booking-id {
                        font-family: monospace;
                        font-size: 14px;
                        color: #1e293b;
                        letter-spacing: 2px;
                        font-weight: bold;
                    }
                    
                    .print-status-badge {
                        display: inline-block;
                        padding: 5px 15px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                    }
                    
                    .print-status-paid {
                        background: #d1fae5;
                        color: #065f46;
                    }
                    
                    .print-vehicle-image {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin-bottom: 15px;
                    }
                    
                    .print-contact-info {
                        background: #f8fafc;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 10px;
                    }
                    
                    .print-signature {
                        margin-top: 40px;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 40px;
                    }
                    
                    .print-signature-box {
                        border-top: 2px solid #cbd5e1;
                        padding-top: 10px;
                        text-align: center;
                    }
                    
                    .print-qr-section {
                        text-align: center;
                        margin: 20px 0;
                    }
                }
            `}</style>

            {/* Printable Receipt */}
            <div id="printable-receipt" className="hidden">
                {/* Print Header */}
                <div className="print-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div className="print-company-name">🚗 Vehicle Rental Services</div>
                            <div className="print-company-tagline">Your Trusted Mobility Partner</div>
                            <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                                <div>📧 Email: support@vehiclerental.com</div>
                                <div>📞 Phone: +91-1234567890</div>
                                <div>🌐 Website: www.vehiclerental.com</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                                Receipt Date: {new Date().toLocaleDateString('en-IN', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                })}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                Print Time: {new Date().toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="print-title">📝 Booking Receipt</div>

                {/* Booking ID Barcode Style */}
                <div className="print-barcode">
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '5px' }}>BOOKING ID</div>
                    <div className="print-booking-id">{booking._id}</div>
                    <div style={{ marginTop: '10px' }}>
                        <span className={`print-status-badge ${booking.payment?.status === 'paid' ? 'print-status-paid' : ''}`}>
                            ✓ PAYMENT {booking.payment?.status?.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="print-section">
                    <div className="print-section-title">👤 Customer Information</div>
                    <div className="print-grid">
                        <div className="print-item">
                            <span className="print-label">Name:</span>
                            <span className="print-value">{booking.user?.name || 'N/A'}</span>
                        </div>
                        <div className="print-item">
                            <span className="print-label">Email:</span>
                            <span className="print-value">{booking.user?.email || 'N/A'}</span>
                        </div>
                        <div className="print-item">
                            <span className="print-label">Phone:</span>
                            <span className="print-value">{booking.user?.phone || 'N/A'}</span>
                        </div>
                        <div className="print-item">
                            <span className="print-label">Booking Status:</span>
                            <span className="print-value" style={{ textTransform: 'capitalize' }}>{booking.status}</span>
                        </div>
                    </div>
                </div>

                {/* Vehicle Information */}
                <div className="print-section">
                    <div className="print-section-title">🚗 Vehicle Details</div>
                    {booking.vehicle?.images?.[0] && (
                        <img 
                            src={booking.vehicle.images[0].url} 
                            alt={booking.vehicle.name}
                            className="print-vehicle-image"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                        />
                    )}
                    <div className="print-grid">
                        <div className="print-item">
                            <span className="print-label">Vehicle Name:</span>
                            <span className="print-value">{booking.vehicle?.name}</span>
                        </div>
                        <div className="print-item">
                            <span className="print-label">Vehicle Type:</span>
                            <span className="print-value" style={{ textTransform: 'capitalize' }}>{booking.vehicle?.type}</span>
                        </div>
                        <div className="print-item">
                            <span className="print-label">Location:</span>
                            <span className="print-value">
                                {booking.vehicle?.location?.city}, {booking.vehicle?.location?.state}
                            </span>
                        </div>
                        <div className="print-item">
                            <span className="print-label">Rate:</span>
                            <span className="print-value">₹{booking.vehicle?.pricePerHour}/hour</span>
                        </div>
                    </div>
                    {booking.vehicle?.description && (
                        <div style={{ marginTop: '15px', padding: '10px', background: '#f8fafc', borderRadius: '6px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Description:</div>
                            <div style={{ fontSize: '13px', color: '#334155' }}>{booking.vehicle.description}</div>
                        </div>
                    )}
                </div>

                {/* Rental Period */}
                <div className="print-section">
                    <div className="print-section-title">📅 Rental Period & Duration</div>
                    <div className="print-grid">
                        <div className="print-item">
                            <span className="print-label">Start Date & Time:</span>
                            <span className="print-value">{formatDate(booking.start)}</span>
                        </div>
                        <div className="print-item">
                            <span className="print-label">End Date & Time:</span>
                            <span className="print-value">{formatDate(booking.end)}</span>
                        </div>
                        <div className="print-item">
                            <span className="print-label">Total Duration:</span>
                            <span className="print-value">{calculateDuration()}</span>
                        </div>
                        <div className="print-item">
                            <span className="print-label">Booking Date:</span>
                            <span className="print-value">
                                {new Date(booking.createdAt).toLocaleDateString('en-IN', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="print-section">
                    <div className="print-section-title">💳 Payment Details</div>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                        <div className="print-item">
                            <span className="print-label">Payment Method:</span>
                            <span className="print-value" style={{ textTransform: 'capitalize' }}>
                                {booking.payment?.provider || 'N/A'}
                            </span>
                        </div>
                        {booking.payment?.providerPaymentId && (
                            <div className="print-item">
                                <span className="print-label">Transaction ID:</span>
                                <span className="print-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                    {booking.payment.providerPaymentId}
                                </span>
                            </div>
                        )}
                        <div className="print-item">
                            <span className="print-label">Payment Status:</span>
                            <span className="print-value" style={{ 
                                color: booking.payment?.status === 'paid' ? '#059669' : '#d97706',
                                textTransform: 'uppercase'
                            }}>
                                {booking.payment?.status || 'Pending'}
                            </span>
                        </div>
                        {booking.payment?.paidAt && (
                            <div className="print-item">
                                <span className="print-label">Payment Date:</span>
                                <span className="print-value">
                                    {new Date(booking.payment.paidAt).toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="print-total">
                        <span className="print-total-label">Total Amount Paid:</span>
                        <span className="print-total-amount">₹{booking.totalAmount}</span>
                    </div>
                </div>

                {/* Vendor Information */}
                {booking.vendor && (
                    <div className="print-section">
                        <div className="print-section-title">🏢 Vendor Information</div>
                        <div className="print-contact-info">
                            <div className="print-grid">
                                <div className="print-item">
                                    <span className="print-label">Vendor Name:</span>
                                    <span className="print-value">{booking.vendor.name}</span>
                                </div>
                                {booking.vendor.email && (
                                    <div className="print-item">
                                        <span className="print-label">Email:</span>
                                        <span className="print-value">{booking.vendor.email}</span>
                                    </div>
                                )}
                                {booking.vendor.phone && (
                                    <div className="print-item">
                                        <span className="print-label">Contact:</span>
                                        <span className="print-value">{booking.vendor.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Important Instructions */}
                <div className="print-section">
                    <div className="print-section-title">⚠️ Important Instructions</div>
                    <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#92400e', lineHeight: '1.8' }}>
                            <li>Please carry a valid ID proof and driving license at the time of pickup</li>
                            <li>Vehicle inspection will be done before handover. Any damage must be reported immediately</li>
                            <li>Fuel level should be same at the time of return as it was during pickup</li>
                            <li>Late return charges: ₹{Math.round(booking.vehicle?.pricePerHour * 1.5)}/hour after grace period of 1 hour</li>
                            <li>For any issues or queries, contact the vendor or our support team immediately</li>
                            <li>Keep this receipt for your records and present it during vehicle pickup</li>
                        </ul>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="print-terms">
                    <div className="print-terms-title">📋 Terms & Conditions</div>
                    <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>The renter must be at least 21 years old and possess a valid driving license.</li>
                        <li>Security deposit (if applicable) will be refunded within 7 working days after vehicle return.</li>
                        <li>The vehicle must be returned in the same condition as it was at the time of pickup.</li>
                        <li>Any traffic violations, fines, or penalties during the rental period are the renter's responsibility.</li>
                        <li>The renter is liable for any damage to the vehicle during the rental period unless covered by insurance.</li>
                        <li>Cancellation charges apply as per the cancellation policy. Refund will be processed within 7-10 business days.</li>
                        <li>The company reserves the right to refuse service or terminate the rental in case of misuse.</li>
                        <li>This receipt is valid only for the booking mentioned above and cannot be transferred.</li>
                        <li>For complete terms and conditions, please visit our website or contact customer support.</li>
                    </ol>
                </div>

                {/* Signatures */}
                <div className="print-signature">
                    <div className="print-signature-box">
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#475569' }}>Customer Signature</div>
                    </div>
                    <div className="print-signature-box">
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#475569' }}>Authorized Signature</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="print-footer">
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '5px' }}>
                        This is a computer-generated receipt and does not require a physical signature.
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>
                        Thank you for choosing Vehicle Rental Services! 🚗
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                        For support: support@vehiclerental.com | +91-1234567890 | Available 24/7
                    </div>
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', fontSize: '10px', color: '#94a3b8' }}>
                        © {new Date().getFullYear()} Vehicle Rental Services. All rights reserved. | GST No: 29XXXXX1234X1ZY
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
                <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed</h1>
                                <div className="flex items-center gap-3">
                                    <code className="text-sm font-mono text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-cyan-500/30">
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
                    <div className="bg-slate-800/50 border-t border-slate-700 p-6">
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all"
                            >
                                Back to Dashboard
                            </button>
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