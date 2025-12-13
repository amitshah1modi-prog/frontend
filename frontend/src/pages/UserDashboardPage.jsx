import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BACKEND_URL } from '../config';

export default function UserDashboardPage() {

    // hooks
    const location = useLocation();
    const navigate = useNavigate();
    const { userId: routeUserId } = useParams();

    const passedUserId = location.state?.userId;
    const userId = passedUserId || routeUserId;

    const queryParams = new URLSearchParams(location.search);
    const phoneNumber = queryParams.get('phoneNumber');

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

    /* ================= RESTORE LOGIC ================= */
    useEffect(() => {
        const state = location.state;
        console.log('RESTORE — location.state =', state);

        if (state?.fromServicePage && state?.ticketId) {
            const tid = state.ticketId;

            const savedNotes = localStorage.getItem(`notes_${tid}`);
            const savedAddress = localStorage.getItem(`address_${tid}`);
            const savedOrders = localStorage.getItem(`orders_${tid}`);

            if (savedNotes) setNotes(savedNotes);
            if (savedAddress) setSelectedAddressId(Number(savedAddress));
            if (savedOrders) setAssignedOrders(JSON.parse(savedOrders));
            return;
        }

        if (!state?.ticketId) {
            console.log('NEW CALL → clearing UI');
            setNotes('');
            setSelectedAddressId(null);
            setAssignedOrders([]);
        }
    }, [location.state]);

    /* ================= CLOCK ================= */
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    /* ================= FETCH ADDRESSES ================= */
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!userId) return;

            try {
                const response = await fetch(`${BACKEND_URL}/call/address/${userId}`);
                const result = await response.json();
                const addresses = result.addresses || [];

                setUserAddresses(addresses);

                if (!location.state?.fromServicePage && addresses.length > 0) {
                    setSelectedAddressId(addresses[0].address_id);
                }
            } catch (err) {
                setAddressFetchMessage('Failed to load addresses');
            }
        };

        fetchAddresses();
    }, [userId, location.state]);

    /* ================= CANCEL ORDER ================= */
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Cancel this order?')) return;

        try {
            await fetch(`${BACKEND_URL}/call/orders/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    status: 'Cust_Cancelled',
                }),
            });

            setAssignedOrders(prev =>
                prev.filter(order => order.order_id !== orderId)
            );
        } catch (err) {
            alert('Error cancelling order');
        }
    };

    /* ================= SAVE NOTES ================= */
    const saveNotesAsTicket = async () => {
        if (!notes.trim()) {
            setSaveMessage('Error: Notes cannot be empty');
            return;
        }

        if (!phoneNumber) {
            setSaveMessage('Error: Phone number missing');
            return;
        }

        try {
            setIsSaving(true);
            setSaveMessage('Saving...');

            const response = await fetch(`${BACKEND_URL}/call/ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber,
                    requestDetails: notes.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error('Ticket creation failed');
            }

            const result = await response.json();
            const ticketId = result.ticket_id;

            localStorage.setItem(`notes_${ticketId}`, notes.trim());
            if (selectedAddressId) {
                localStorage.setItem(`address_${ticketId}`, selectedAddressId);
            }
            localStorage.setItem(`orders_${ticketId}`, JSON.stringify(assignedOrders));

            navigate('/services', {
                state: {
                    fromDashboard: true,
                    ticketId,
                    userId,
                },
            });

        } catch (err) {
            console.error(err);
            setSaveMessage('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    /* ================= STYLES (UNCHANGED) ================= */
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            fontFamily: '"Inter", sans-serif',
            backgroundColor: '#f3f4f6',
        },
        header: {
            height: '64px',
            backgroundColor: '#1f2937',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 24px',
            alignItems: 'center',
        },
        main: { display: 'flex', flex: 1 },
        sidebar: { width: 320, background: '#fff', padding: 24, overflowY: 'auto' },
        contentArea: { flex: 1, padding: 32 },
        card: { background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 },
        notesTextarea: { width: '100%', minHeight: 300 },
        saveButton: { padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none' },
    };

    /* ================= JSX ================= */
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <span>CC Agent Console</span>
                <span>{currentTime}</span>
            </header>

            <div style={styles.main}>
                <aside style={styles.sidebar}>
                    <div style={styles.card}>
                        <b>Calling Number:</b> {phoneNumber || 'N/A'}
                    </div>

                    <div style={styles.card}>
                        <b>Addresses</b>
                        {userAddresses.map(address => (
                            <div
                                key={address.address_id}
                                onClick={() => setSelectedAddressId(address.address_id)}
                                style={{
                                    cursor: 'pointer',
                                    fontWeight:
                                        selectedAddressId === address.address_id ? 'bold' : 'normal',
                                }}
                            >
                                {address.address_line}
                            </div>
                        ))}
                    </div>

                    <div style={styles.card}>
                        <b>Active Orders</b>
                        {assignedOrders.map(order => (
                            <div key={order.order_id}>
                                #{order.order_id}
                                <button onClick={() => handleCancelOrder(order.order_id)}>
                                    Cancel
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>

                <main style={styles.contentArea}>
                    <textarea
                        style={styles.notesTextarea}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Start taking notes..."
                    />

                    <div style={{ marginTop: 16 }}>
                        {saveMessage && <span>{saveMessage}</span>}
                        <button
                            style={styles.saveButton}
                            onClick={saveNotesAsTicket}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Notes & Select Service'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
