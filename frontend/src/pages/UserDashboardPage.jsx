import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 

// Using a placeholder URL internally to resolve the 'Could not resolve' error.
import { BACKEND_URL } from '../config';

export default function UserDashboardPage() {
    
    // 1. URL PARAMETERS (e.g., /dashboard/1)
    const { userId } = useParams();
    
    // 2. QUERY PARAMETERS (e.g., ?phoneNumber=...)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const phoneNumber = queryParams.get('phoneNumber'); 

    const navigate = useNavigate();
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [subscriptionStatus] = useState('Premium');

    // STATE FOR ADDRESS MANAGEMENT
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressFetchMessage, setAddressFetchMessage] = useState('Fetching addresses...');

    // 🚀 NEW STATE: Assigned Orders
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        // Clock timer for the header
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // EFFECT 1: Fetch addresses
    useEffect(() => {
        const fetchAddresses = async () => {
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

    // 🚀 EFFECT 2: Fetch Assigned Orders for this Phone Number
    useEffect(() => {
        const fetchAssignedOrders = async () => {
            if (!phoneNumber) return;
            
            setOrdersLoading(true);
            try {
                // We will create this endpoint in the backend next
                const response = await fetch(`${BACKEND_URL}/call/orders/assigned?phoneNumber=${phoneNumber}`);
                
                if (response.ok) {
                    const data = await response.json();
                    setAssignedOrders(data.orders || []);
                } else {
                    console.error("Failed to fetch assigned orders");
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchAssignedOrders();
    }, [phoneNumber]);

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
                // Remove the cancelled order from the UI list immediately
                setAssignedOrders(prev => prev.filter(order => order.order_id !== orderId));
                alert("Order cancelled successfully.");
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
const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#e6e9ee',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        color: '#0a0f1c',
    },

    /* ===== CALL BAR ===== */
    header: {
        height: '52px',
        backgroundColor: '#0a0f1c',
        color: '#e5e7eb',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        padding: '0 20px',
        letterSpacing: '0.04em',
    },
    brand: {
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    headerRight: {
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        fontSize: '0.7rem',
    },
    clock: {
        fontFamily: 'monospace',
        opacity: 0.8,
    },
    avatar: {
        padding: '4px 10px',
        backgroundColor: '#1f2937',
        fontSize: '0.7rem',
        fontWeight: '700',
        border: '1px solid #374151',
    },

    /* ===== CORE GRID ===== */
    main: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gridTemplateRows: '1fr auto',
        gap: '1px',
        backgroundColor: '#cbd5e1',
    },

    /* ===== LEFT: CONTEXT ===== */
    sidebar: {
        backgroundColor: '#f8fafc',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        overflowY: 'auto',
    },

    /* ===== CENTER: NOTES CONSOLE ===== */
    contentArea: {
        backgroundColor: '#ffffff',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
    },

    /* ===== RIGHT: TASKS ===== */
    card: {
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        padding: '14px',
    },

    title: {
        fontSize: '0.8rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '12px 16px',
        borderBottom: '1px solid #cbd5e1',
    },

    /* ===== NOTES = TERMINAL ===== */
    notesTextarea: {
        flex: 1,
        border: 'none',
        outline: 'none',
        padding: '18px',
        fontSize: '0.85rem',
        lineHeight: '1.7',
        fontFamily: '"IBM Plex Mono", monospace',
        backgroundColor: '#ffffff',
    },

    /* ===== INFO ===== */
    userInfoTitle: {
        fontSize: '0.65rem',
        fontWeight: '700',
        letterSpacing: '0.1em',
        color: '#475569',
        textTransform: 'uppercase',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        padding: '6px 0',
    },
    infoKey: {
        color: '#64748b',
    },
    infoVal: {
        fontWeight: '600',
    },
    subscriptionBadge: {
        border: '1px solid #64748b',
        padding: '1px 6px',
        fontSize: '0.6rem',
        fontWeight: '700',
    },

    phoneNumberDisplay: {
        fontFamily: 'monospace',
        backgroundColor: '#e2e8f0',
        padding: '2px 6px',
    },

    /* ===== ADDRESS ===== */
    addressItem: {
        padding: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '0.75rem',
        cursor: 'pointer',
    },
    addressSelected: {
        backgroundColor: '#e2e8f0',
        fontWeight: '700',
    },

    /* ===== ORDERS ===== */
    orderCard: {
        backgroundColor: '#fff',
        border: '1px solid #fecaca',
        padding: '10px',
        marginBottom: '8px',
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.7rem',
        fontWeight: '700',
        color: '#7f1d1d',
    },
    cancelBtn: {
        width: '100%',
        backgroundColor: '#7f1d1d',
        color: '#fff',
        border: 'none',
        padding: '6px',
        fontSize: '0.65rem',
        cursor: 'pointer',
    },

    /* ===== ACTION STRIP ===== */
    saveButton: {
        backgroundColor: '#0a0f1c',
        color: '#ffffff',
        border: 'none',
        padding: '10px 24px',
        fontSize: '0.75rem',
        fontWeight: '700',
        cursor: 'pointer',
    },
    message: {
        fontSize: '0.7rem',
        marginRight: '12px',
        fontWeight: '600',
    },
    emptyState: {
        textAlign: 'center',
        fontSize: '0.7rem',
        color: '#64748b',
        padding: '12px',
    },
};


    // --------------------------------------------------------

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <header style={styles.header}>
                <div style={styles.brand}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>CC Agent Console: Active Call</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>{currentTime}</span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            <div style={styles.main}>
                {/* SIDEBAR - Used to display User/Call Info */}
                <aside style={styles.sidebar}>
                    <div style={{ ...styles.card, ...styles.userInfoBlock }}>
                        <div style={styles.userInfoTitle}>☎️ Customer Details</div>

                        <div style={styles.infoRow}>
                            <span style={styles.infoKey}>Calling Phone No.</span>
                            <span style={styles.phoneNumberDisplay}>
                                {phoneNumber || 'N/A'}
                            </span>
                        </div>
                        
                        <div style={styles.infoRow}>
                            <span style={styles.infoKey}>User ID</span>
                            <span style={styles.infoVal}>{userId}</span>
                        </div>

                        <div style={styles.infoRow}>
                            <span style={styles.infoKey}>Subscription</span>
                            <span style={styles.subscriptionBadge}>{subscriptionStatus}</span>
                        </div>
                    </div>

                    {/* ADDRESS SELECTION CARD */}
                    <div style={styles.card}>
                        <div style={styles.userInfoTitle}>🏠 Select Address</div>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '10px' }}>
                            {addressFetchMessage}
                        </p>
                        {userAddresses.length > 0 ? (
                            <div>
                                {userAddresses.map((address) => (
                                    <div
                                        key={address.address_id}
                                        style={{
                                            ...styles.addressItem,
                                            ...(selectedAddressId === address.address_id ? styles.addressSelected : {})
                                        }}
                                        onClick={() => setSelectedAddressId(address.address_id)}
                                    >
                                        {address.address_line}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                                No addresses to select.
                            </p>
                        )}
                    </div>

                    {/* 🚀 NEW SECTION: ACTIVE ASSIGNED ORDERS */}
                    <div style={styles.card}>
                        <div style={styles.userInfoTitle}>🚀 Active Orders</div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '10px' }}>
                            Orders currently "Assigned" to this caller.
                        </p>

                        {ordersLoading ? (
                            <p style={styles.emptyState}>Loading orders...</p>
                        ) : assignedOrders.length > 0 ? (
                            <div>
                                {assignedOrders.map((order) => (
                                    <div key={order.order_id} style={styles.orderCard}>
                                        <div style={styles.orderHeader}>
                                            <span>#{order.order_id}</span>
                                            <span>{order.order_status}</span>
                                        </div>
                                        {/* Display specific details from your DB here, e.g., Ticket Title */}
                                        <div style={{fontSize: '0.8rem', marginBottom: '6px', color: '#4b5563'}}>
                                            {order.request_details || "Service Request"}
                                        </div>
                                        <button 
                                            style={styles.cancelBtn}
                                            onClick={() => handleCancelOrder(order.order_id)}
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={styles.emptyState}>No active "Assigned" orders found.</p>
                        )}
                    </div>
                </aside>

                {/* CONTENT AREA - Used for Note Taking */}
                <main style={styles.contentArea}>
                    <h2 style={styles.title}>📝 Active Call Notes</h2>

                    <div style={styles.card}>
                        <textarea
                            style={styles.notesTextarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Start taking notes on the user's request, issues, or actions taken..."
                        />
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {saveMessage && (
                            <span style={styles.message}>{saveMessage}</span>
                        )}
                        <button
                            onClick={saveNotesAsTicket}
                            disabled={isSaving || !phoneNumber || (userAddresses.length > 0 && !selectedAddressId)}
                            style={styles.saveButton}
                        >
                            {isSaving ? 'Saving...' : 'Save Notes & Select Service'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}









