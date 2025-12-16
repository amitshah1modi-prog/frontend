import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// Using a placeholder URL internally to resolve the 'Could not resolve' error.
import { BACKEND_URL } from '../config';

// --- Icon Components for a professional look (using simple SVG for no external library) ---
const PhoneIcon = (props) => (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);
const UserIcon = (props) => (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);
const HomeIcon = (props) => (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);
const NotesIcon = (props) => (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
);
const ClipboardIcon = (props) => (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
);
const ClockIcon = (props) => (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
// --------------------------------------------------------------------------------------


export default function UserDashboardPage() {
    // ... (STATE DECLARATIONS - UNCHANGED) ...
    const { userId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const phoneNumber = queryParams.get('phoneNumber');
    const navigate = useNavigate();
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [subscriptionStatus] = useState('Premium');
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressFetchMessage, setAddressFetchMessage] = useState('Fetching addresses...');
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Function to fetch orders, memoized to be stable
    const fetchAssignedOrders = useCallback(async () => {
        if (!phoneNumber) {
            setAssignedOrders([]);
            return;
        }

        setOrdersLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/call/orders/assigned?phoneNumber=${phoneNumber}`);

            if (response.ok) {
                const data = await response.json();
                setAssignedOrders(data.orders || []);
            } else {
                console.error("Failed to fetch assigned orders");
                setAssignedOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setAssignedOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    }, [phoneNumber]);


    useEffect(() => {
        // Clock timer for the header
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // EFFECT 1: Fetch addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            // ... (ADDRESS FETCH LOGIC - UNCHANGED) ...
            if (!userId) {
                setAddressFetchMessage('Error: User ID not provided in route.');
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/call/address/${userId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch addresses: ${response.statusText}`);
                }

                const result = await response.json();
                const addresses = result.addresses;

                if (addresses.length > 0) {
                    setUserAddresses(addresses);
                    setSelectedAddressId(addresses[0].address_id);
                    setAddressFetchMessage(`${addresses.length} addresses loaded.`);
                } else {
                    setAddressFetchMessage('No addresses found for this user.');
                    setUserAddresses([]);
                    setSelectedAddressId(null);
                }

            } catch (error) {
                console.error('Address Fetch Error:', error);
                setAddressFetchMessage(`❌ Failed to load addresses: ${error.message}`);
            }
        };

        fetchAddresses();
    }, [userId]);

    // EFFECT 2: Fetch Assigned Orders for this Phone Number
    useEffect(() => {
        fetchAssignedOrders();
    }, [fetchAssignedOrders]);

    // 🚀 FUNCTION: Cancel an Assigned Order
    const handleCancelOrder = async (orderId) => {
        if(!window.confirm("Are you sure the customer wants to cancel this order?")) return;

        try {
            const response = await fetch(`${BACKEND_URL}/call/orders/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: 'Cust_Cancelled' })
            });

            if (response.ok) {
                alert("Order cancelled successfully.");
                // Refetch the orders to get the updated list
                fetchAssignedOrders();
            } else {
                alert("Failed to cancel order.");
            }
        } catch (error) {
            console.error("Cancel Error:", error);
            alert("Error cancelling order.");
        }
    };


    // --- FUNCTION: Save Notes to Backend as a Ticket and Navigate ---
    const saveNotesAsTicket = async () => {
        // ... (VALIDATION LOGIC - UNCHANGED) ...
        if (!notes.trim()) {
            setSaveMessage('Error: Notes cannot be empty.');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        if (!selectedAddressId && userAddresses.length > 0) {
            setSaveMessage('Error: Please select an address.');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        if (!phoneNumber) {
            setSaveMessage('Error: Call phone number is missing from the URL query.');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        setIsSaving(true);
        setSaveMessage('Saving...');

        try {
            const actualPhoneNumber = phoneNumber;

            const response = await fetch(`${BACKEND_URL}/call/ticket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Agent-Id': 'AGENT_001',
                },
                body: JSON.stringify({
                    phoneNumber: actualPhoneNumber,
                    requestDetails: notes.trim(),
                }),
            });

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (e) {
                    const errorText = await response.text();
                    throw new Error(`Server responded with ${response.status}. Body: ${errorText.substring(0, 100)}...`);
                }
                throw new Error(errorData.message || 'Server error occurred.');
            }

            const result = await response.json();

            console.log(`Ticket ${result.ticket_id} created. Navigating to service selection.`);

            navigate('/user/services', {
                state: {
                    ticketId: result.ticket_id,
                    requestDetails: result.requestDetails || notes.trim(),
                    selectedAddressId: selectedAddressId,
                    phoneNumber: phoneNumber,
                }
            });

        } catch (error) {
            console.error('API Error:', error);
            setSaveMessage(`❌ Failed to create ticket: ${error.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 5000);
        }
    };
    // --------------------------------------------------------

    // --- UPDATED STYLES FOR PROFESSIONAL UI ---
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: '#eef2f6', // Lighter, professional background
            color: '#1f2937',
        },
        // **Header**
        header: {
            height: '64px',
            backgroundColor: '#1c2e4a', // Deep Navy Blue
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
        },
        brand: {
            fontSize: '1.25rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#34d399', // Professional Accent Green
        },
        headerRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
        },
        clock: {
            fontFamily: 'monospace',
            color: '#9ca3af',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        avatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6', // Blue for agent
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: '600',
            border: '2px solid #60a5fa',
        },
        // **Main Layout (Grid/Flex)**
        main: {
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
        },
        // **Sidebar/Info Panel**
        sidebar: {
            width: '360px', // Wider sidebar
            backgroundColor: 'white',
            borderRight: '1px solid #d1d5db',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flexShrink: 0,
            overflowY: 'auto',
        },
        // **Main Content (Notes)**
        contentArea: {
            flex: 1,
            padding: '30px',
            backgroundColor: '#f9fafb',
            overflowY: 'auto',
        },
        // **Card Styling**
        card: {
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        },
        // **Typography**
        title: {
            fontSize: '1.75rem', // Larger title
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '20px',
            borderBottom: '3px solid #60a5fa', // Accent border
            paddingBottom: '10px',
        },
        userInfoTitle: {
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#1c2e4a', // Darker text for titles
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        infoRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #f3f4f6',
        },
        infoKey: {
            fontSize: '0.9rem',
            color: '#6b7280',
            fontWeight: '500',
        },
        infoVal: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#111827',
        },
        // **Badges**
        subscriptionBadge: {
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            backgroundColor: subscriptionStatus === 'Premium' ? '#d1fae5' : '#fef9c3',
            color: subscriptionStatus === 'Premium' ? '#065f46' : '#a16207',
        },
        phoneNumberDisplay: {
            fontWeight: '700',
            color: '#4f46e5',
            backgroundColor: '#eef2ff',
            padding: '3px 8px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            border: '1px solid #a5b4fc',
        },
        // **Address List**
        addressItem: {
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
            lineHeight: '1.4',
            backgroundColor: '#f9fafb',
        },
        addressSelected: {
            backgroundColor: '#e0f7fa', // Light blue/cyan for selection
            borderColor: '#00bcd4', // Cyan border
            fontWeight: '700',
            boxShadow: '0 0 0 2px #b2ebf2',
        },
        // **Notes & Action**
        notesTextarea: {
            width: '100%',
            minHeight: '450px', // Taller textarea
            padding: '20px',
            fontSize: '1rem',
            border: '2px solid #d1d5db',
            borderRadius: '10px',
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            ':focus': {
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
            }
        },
        saveButton: {
            padding: '12px 25px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: isSaving || !phoneNumber ? 'default' : 'pointer',
            backgroundColor: isSaving || !phoneNumber ? '#9ca3af' : '#34d399', // Professional Green
            color: 'white',
            transition: 'background-color 0.3s, transform 0.1s',
            boxShadow: '0 4px 10px rgba(52, 211, 153, 0.4)',
            ':hover': isSaving || !phoneNumber ? {} : { backgroundColor: '#10b981' }
        },
        message: {
            marginRight: '15px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: saveMessage.includes('Error') ? '#ef4444' : '#047857',
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: saveMessage.includes('Error') ? '#fee2e2' : '#d1fae5',
        },
        // **Order Cards**
        orderCard: {
            border: '1px solid #fca5a5',
            backgroundColor: '#fff1f2',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        },
        orderHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: '700',
            color: '#b91c1c',
            borderBottom: '1px solid #fecaca',
            paddingBottom: '5px',
        },
        cancelBtn: {
            width: '100%',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '10px',
            transition: 'background-color 0.2s',
            ':hover': { backgroundColor: '#dc2626' }
        },
        emptyState: {
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '0.9rem',
            padding: '20px 0',
            fontStyle: 'italic',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #e5e7eb',
        }
    };
    // --------------------------------------------------------

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <header style={styles.header}>
                <div style={styles.brand}>
                    <PhoneIcon style={{color: '#34d399'}}/>
                    <span>CC Agent Console</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>
                        <ClockIcon style={{color: '#9ca3af'}} />
                        {currentTime}
                    </span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            <div style={styles.main}>
                {/* SIDEBAR - User Info and Actions */}
                <aside style={styles.sidebar}>
                    {/* CUSTOMER DETAILS CARD */}
                    <div style={{ ...styles.card, padding: '15px' }}>
                        <div style={styles.userInfoTitle}><UserIcon /> Customer Details</div>

                        <div style={styles.infoRow}>
                            <span style={styles.infoKey}>📞 Calling Phone No.</span>
                            <span style={styles.phoneNumberDisplay}>
                                {phoneNumber || 'N/A'}
                            </span>
                        </div>

                        <div style={styles.infoRow}>
                            <span style={styles.infoKey}>🆔 User ID</span>
                            <span style={styles.infoVal}>{userId || 'N/A'}</span>
                        </div>

                        <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
                            <span style={styles.infoKey}>⭐ Subscription</span>
                            <span style={styles.subscriptionBadge}>{subscriptionStatus}</span>
                        </div>
                    </div>

                    {/* ADDRESS SELECTION CARD */}
                    <div style={styles.card}>
                        <div style={styles.userInfoTitle}><HomeIcon /> Select Address</div>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '10px' }}>
                            *Select an address to link the new service request.
                        </p>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {userAddresses.length > 0 ? (
                                userAddresses.map((address) => (
                                    <div
                                        key={address.address_id}
                                        style={{
                                            ...styles.addressItem,
                                            ...(selectedAddressId === address.address_id ? styles.addressSelected : {})
                                        }}
                                        onClick={() => setSelectedAddressId(address.address_id)}
                                    >
                                        <p style={{ margin: 0, fontWeight: '700' }}>{address.address_line.split(',')[0]}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                                            {address.address_line.substring(address.address_line.indexOf(',') + 1).trim()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ ...styles.emptyState, border: '1px dashed #fca5a5', backgroundColor: '#fff1f2', color: '#b91c1c' }}>
                                    {addressFetchMessage}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ACTIVE ASSIGNED ORDERS */}
                    <div style={styles.card}>
                        <div style={styles.userInfoTitle}><ClipboardIcon /> Active Orders</div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '10px' }}>
                            Immediate action items related to the caller.
                        </p>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {ordersLoading ? (
                                <p style={styles.emptyState}>Loading orders...</p>
                            ) : assignedOrders.length > 0 ? (
                                assignedOrders.map((order) => (
                                    <div key={order.order_id} style={styles.orderCard}>
                                        <div style={styles.orderHeader}>
                                            <span>ORDER **#{order.order_id}**</span>
                                            <span style={{color: '#991b1b', backgroundColor: '#fecaca', padding: '2px 6px', borderRadius: '4px'}}>
                                                {order.order_status}
                                            </span>
                                        </div>
                                        <div style={{fontSize: '0.8rem', marginBottom: '6px', color: '#4b5563', fontStyle: 'italic', padding: '0 5px'}}>
                                            {order.request_details || "General Service Request"}
                                        </div>
                                        <button
                                            style={styles.cancelBtn}
                                            onClick={() => handleCancelOrder(order.order_id)}
                                        >
                                            <span style={{marginRight: '5px'}}>❌</span> Customer Cancel
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p style={styles.emptyState}>No active "Assigned" orders found.</p>
                            )}
                        </div>
                    </div>
                </aside>

                {/* CONTENT AREA - Note Taking & Main Action */}
                <main style={styles.contentArea}>
                    <h2 style={styles.title}><NotesIcon style={{marginRight: '10px', color: '#3b82f6'}}/> Service Request Notes</h2>

                    <div style={styles.card}>
                        <textarea
                            style={styles.notesTextarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Start typing the complete request or issue here. Detailed notes are critical for follow-up and ticket resolution..."
                        />
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {saveMessage && (
                            <span style={styles.message}>{saveMessage}</span>
                        )}
                        <button
                            onClick={saveNotesAsTicket}
                            disabled={isSaving || !phoneNumber || (userAddresses.length > 0 && !selectedAddressId)}
                            style={styles.saveButton}
                        >
                            {isSaving ? 'Processing Ticket...' : 'Save Notes & Create Service Ticket »'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export UserDashboardPage ;
