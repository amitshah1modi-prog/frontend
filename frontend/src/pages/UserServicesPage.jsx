import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- Icon Components for a professional look (using simple SVG for no external library) ---
const PhoneIcon = (props) => (
    <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);
const ClockIcon = (props) => (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
const TicketIcon = (props) => (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 15l-6 6"></path>
        <path d="M9 15l6 6"></path>
        <path d="M12 2v20"></path>
        <path d="M19 5h-2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"></path>
        <path d="M5 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"></path>
    </svg>
);
// --------------------------------------------------------------------------------------


// Subcategory data (All data blocks are kept the same)
const PLUMBER_SUBCATEGORIES = [
    { name: 'Shower Head Repair', icon: '🚿' }, { name: 'Diverter Repair', icon: '🔧' },
    { name: 'Waste Pipe Repair', icon: '💧' }, { name: 'Sink Drainage Repair', icon: '🍽️' },
    { name: 'Angle Valve Repair', icon: '⚙️' }, { name: 'Sink Blockage', icon: '⏳' },
    { name: 'Floor Trap Cleaning', icon: '🏠' }, { name: 'Flush Tank Repair', icon: '🚽' },
    { name: 'Toilet Repair', icon: '🚾' }, { name: 'Toilet Pot Blockage', icon: '🚫' },
    { name: 'Flush Valve Repair', icon: '🚰' }, { name: 'Tap Repair', icon: '🚰' },
    { name: 'Water Mixer Tap Repair', icon: '🌡️' }, { name: 'Water Tank Repair', icon: '💧' },
    { name: 'Motor Repair', icon: '⚡' }, { name: 'Pipeline Repair', icon: '🔗' },
    { name: 'Bathroom Accessories', icon: '🧼' }, { name: 'Shower Installation', icon: '🚿' },
    { name: 'Shower Diverter Install', icon: '🔧' }, { name: 'Wash Basin Install', icon: '🧴' },
    { name: 'Basin Waste Pipe', icon: '🗑️' }, { name: 'Waste Pipe & Bottle Trap', icon: '📦' },
    { name: 'Shower Filter Install', icon: '🧽' }, { name: 'Washing Machine Filter', icon: '🧺' },
    { name: 'Drainage Cover/Floor Trap', icon: '🪜' }, { name: 'Jet Spray Installation', icon: '💦' },
    { name: 'Toilet Installation', icon: '🚻' }, { name: 'Flush Tank Installation', icon: '🚽' },
    { name: 'Tap Installation', icon: '🚰' }, { name: 'Water Mixer Installation', icon: '🌡️' },
    { name: 'Water Nozzle Install', icon: '🔫' }, { name: 'Overhead Water Tank', icon: '🌊' },
    { name: 'Water Meter Install', icon: '📊' }, { name: 'Water Level Controller', icon: '📡' },
    { name: 'Washing Machine Inlet', icon: '🔌' }, { name: 'Connection Hose', icon: '➰' },
    { name: 'PVC / CPVC Pipe Install', icon: '🏗️' }, { name: 'Toilet Seat Cover', icon: '🪑' },
    { name: 'Flush Button Install', icon: '🔘' }, { name: 'Motor Installation', icon: '🔋' },
];

const CARPENTER_SUBCATEGORIES = [
    { name: 'Shelf Installation', icon: '🖼️' }, { name: 'Drawer Installation', icon: '🗄️' },
    { name: 'Curtain Rod Installation', icon: '🪟' }, { name: 'Blinds Installation', icon: '🪟' },
    { name: 'Door Lock Installation', icon: '🔒' }, { name: 'Door Stopper Installation', icon: '🚪' },
    { name: 'Door Peephole Installation', icon: '👁️' }, { name: 'Photo Frame / Wall Art Installation', icon: '🖼️' },
    { name: 'Mirror Installation', icon: '🪞' }, { name: 'Kitchen Rack Installation', icon: '🔪' },
    { name: 'Mesh Installation', icon: '🕸️' }, { name: 'Door Installation', icon: '🚪' },
    { name: 'Door Closer Installation', icon: '⚙️' }, { name: 'Foot Caps / Glide Installation', icon: '👣' },
    { name: 'Bed Repair', icon: '🛏️' }, { name: 'Table Repair', icon: '🪑' },
    { name: 'Chair Repair', icon: '🪑' }, { name: 'Drawer Channel Repair', icon: '🔧' },
    { name: 'Drawer Handle Repair', icon: '🤚' }, { name: 'Door Repair', icon: '🚪' },
    { name: 'Window Repair', icon: '🪟' }, { name: 'Lock Repair', icon: '🔑' },
    { name: 'Latch / Magnet Catch Repair', icon: '🧲' }, { name: 'Hinges Repair', icon: '🔩' },
    { name: 'Door Closer Repair', icon: '🛠️' }, { name: 'Door Stopper Repair', icon: '🛑' },
    { name: 'Door Peephole Repair', icon: '🧐' }, { name: 'Sliding Track / Rollers Repair', icon: '🚄' },
];

const CLEANING_SUBCATEGORIES = [
    { name: 'Bathroom Cleaning', icon: '🛁' }, { name: 'Kitchen Cleaning', icon: '🔪' },
    { name: 'Full House Cleaning', icon: '🏠' }, { name: 'Room Cleaning', icon: '🛌' },
    { name: 'Sofa Cleaning', icon: '🛋️' }, { name: 'Carpet Cleaning', icon: '🧶' },
    { name: 'Mattress', icon: '🛏️' }, { name: 'Fridge Cleaning', icon: '🧊' },
    { name: 'Chimney Cleaning', icon: '🔥' }, { name: 'Exhaust Fan', icon: '💨' },
    { name: 'Water Tank', icon: '💧' }, { name: 'Kitchen Sink', icon: '🍽️' },
    { name: 'Dining Chair', icon: '🪑' }, { name: 'Windows/Gates', icon: '🖼️' },
    { name: 'Fan Cleaning', icon: '🌀' }, { name: 'Wardrobe Cleaning', icon: '👚' },
];

const SERVICES = [
    { name: 'Cleaning', icon: '🧼', color: '#a78bfa', darkColor: '#5b21b6', description: 'Deep cleaning, sanitization, and domestic help.' },
    { name: 'Carpenter', icon: '🔨', color: '#f97316', darkColor: '#7c2d12', description: 'Woodworking, furniture repair, and structural framing.' },
    { name: 'Gardener', icon: '🌳', color: '#86efac', darkColor: '#15803d', description: 'Lawn care, planting, and landscape maintenance.' },
    { name: 'Painter', icon: '🎨', color: '#f0abfc', darkColor: '#a21caf', description: 'Interior, exterior painting, and touch-ups.' },
    { name: 'Plumber', icon: '💧', color: '#60a5fa', darkColor: '#1d4ed8', description: 'Leaky pipes, drain cleaning, and water system fixes.' },
    { name: 'Travel Partner', icon: '✈️', color: '#fca5a5', darkColor: '#b91c1c', description: 'Booking, guide services, or driver assistance.' },
    { name: 'Salon', icon: '💇', color: '#d946ef', darkColor: '#86198f', description: 'Hair, beauty, and personal grooming services.' },
    { name: 'Electrician', icon: '⚡', color: '#fcd34d', darkColor: '#b45309', description: 'Wiring, circuit repairs, and fixture installation.' },
    { name: 'Home Security', icon: '🔒', color: '#374151', darkColor: '#111827', description: 'CCTV, alarm system installation, and monitoring.' },
    { name: 'Pest Control', icon: '🐜', color: '#34d399', darkColor: '#065f46', description: 'Extermination and prevention services for common pests.' },
    { name: 'House Help', icon: '🧺', color: '#ef4444', darkColor: '#b91c1c', description: 'Maid services, laundry, and daily domestic assistance.' },
    { name: 'Appliances Servicing', icon: '⚙️', color: '#fcd34d', darkColor: '#b45309', description: 'Repair and maintenance for major household appliances.' },
    { name: 'Car Services', icon: '🚗', color: '#818cf8', darkColor: '#3730a3', description: 'Routine maintenance, washing, and breakdown support.' },
    { name: 'Mason Services', icon: '🧱', color: '#f97316', darkColor: '#7c2d12', description: 'Tiling, brickwork, and civil construction jobs.' },
    { name: 'S2S', icon: '🤝', color: '#2dd4bf', darkColor: '#0f766e', description: 'Specialized Service-to-Service coordination.' },
    { name: 'Medical Wing', icon: '🏥', color: '#fb7185', darkColor: '#be123c', description: 'Doctor, nurse, or medical support scheduling.' },
];

// --- UPDATED STYLES FOR PROFESSIONAL UI ---
const styles = {
    // **General Layout**
    container: {
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#eef2f6', // Lighter, professional background
        color: '#1f2937',
    },
    // **Header (Consistent with Dashboard)**
    header: {
        height: '64px', backgroundColor: '#1c2e4a', color: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)', zIndex: 1000,
    },
    brand: { fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '12px', color: '#34d399' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '30px' },
    clock: { fontFamily: 'monospace', color: '#9ca3af', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '600', border: '2px solid #60a5fa' },
    mainLayout: {
        maxWidth: '1300px', margin: '0 auto', padding: '32px 24px', flex: 1, width: '100%',
        display: 'flex', flexDirection: 'column', gap: '32px',
    },
    // **Service Card Grid**
    serviceGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', // Slightly wider columns
        gap: '24px', // Increased gap
        marginBottom: '100px', width: '100%',
    },
    // **Context Box**
    contextBox: {
        width: '100%', maxWidth: '700px', margin: '0 auto', zIndex: 10, padding: '20px',
        borderRadius: '12px', backgroundColor: 'white', border: '1px solid #a5b4fc', // Blue border
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    },
    contextHighlight: {
        fontFamily: 'monospace', backgroundColor: '#eef2ff', padding: '3px 8px',
        borderRadius: '6px', color: '#4f46e5', fontWeight: '700'
    },
    // **Action Bar (Footer)**
    actionBar: {
        position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white',
        borderTop: '1px solid #d1d5db', padding: '16px 30px', display: 'flex',
        justifyContent: 'flex-end', gap: '16px', boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)', zIndex: 50,
    },
    buttonPrimary: {
        backgroundColor: '#34d399', // Professional Green
        color: 'white', padding: '14px 28px', borderRadius: '8px',
        fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '1rem',
        boxShadow: '0 4px 6px -1px rgba(52, 211, 153, 0.4)', transition: 'background-color 0.2s',
    },
    buttonSecondary: {
        backgroundColor: '#f3f4f6', color: '#4f46e5', padding: '14px 28px', borderRadius: '8px',
        fontWeight: '700', border: '1px solid #a5b4fc', cursor: 'pointer', fontSize: '1rem',
        transition: 'background-color 0.2s',
    },
    buttonDisabled: {
        opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#e5e7eb', boxShadow: 'none', color: '#6b7280',
    },
    // **Modal Styling**
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(28, 46, 74, 0.7)', // Darker overlay
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
        backdropFilter: 'blur(3px)',
    },
    modalContent: {
        backgroundColor: 'white', borderRadius: '14px', width: '90%', maxWidth: '900px',
        maxHeight: '90vh', overflowY: 'auto', padding: '30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    },
    subcategoryGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '15px', marginTop: '20px', paddingBottom: '20px',
    },
    subcategoryCard: {
        padding: '15px', borderRadius: '10px', border: '2px solid #e5e7eb', display: 'flex',
        flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer',
        transition: 'all 0.2s',
    },
};

// --- Custom Components with Updated Styles ---

const ServiceCard = ({ service, onClick, isSelected, hasSubcategories }) => {
    const [isHovered, setIsHovered] = useState(false);

    const iconContainerStyle = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        borderRadius: '50%', backgroundColor: service.color, marginBottom: '16px',
        boxShadow: `0 8px 15px -5px ${service.darkColor}60`, // More pronounced shadow
    };

    const cardStyle = {
        backgroundColor: isSelected ? '#eef2ff' : 'white',
        padding: '30px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
        transform: isHovered || isSelected ? 'translateY(-6px)' : 'translateY(0)', // Lift on hover/select
        border: isSelected ? '3px solid #4f46e5' : isHovered ? '1px solid #a5b4fc' : '1px solid #e5e7eb',
        boxShadow: (isHovered || isSelected) ? '0 15px 25px -5px rgba(0, 0, 0, 0.15)' : '0 5px 10px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    };

    return (
        <div style={cardStyle} onClick={() => onClick(service)}
            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                <div style={iconContainerStyle}>
                    <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{service.icon}</span>
                </div>
                {isSelected && (
                    <span style={{
                        fontSize: '1.0rem',
                        color: '#4f46e5',
                        fontWeight: '700',
                        backgroundColor: '#e0f2fe',
                        padding: '4px 10px',
                        borderRadius: '6px'
                    }}>
                        {hasSubcategories ? '🔗 Sub-Services' : '✅ Selected'}
                    </span>
                )}
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1f2937', marginBottom: '8px', marginTop: '10px' }}>{service.name}</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', flex: 1, lineHeight: '1.5' }}>{service.description}</p>
        </div>
    );
};

const SubcategoryCard = ({ subcategory, isSelected, onClick }) => {
    const cardStyle = {
        ...styles.subcategoryCard,
        backgroundColor: isSelected ? '#4f46e5' : '#f9fafb', // Lighter background when not selected
        color: isSelected ? 'white' : '#1f2937',
        borderColor: isSelected ? '#4f46e5' : '#d1d5db',
        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
        boxShadow: isSelected ? '0 8px 15px -3px rgba(79, 70, 229, 0.4)' : '0 1px 3px rgba(0,0,0,0.05)',
    };

    const iconStyle = {
        fontSize: '1.8rem', marginBottom: '6px',
        filter: isSelected ? 'grayscale(100%) brightness(10)' : 'none',
    };

    return (
        <div style={cardStyle} onClick={() => onClick(subcategory.name)}>
            <span style={iconStyle}>{subcategory.icon}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{subcategory.name}</span>
        </div>
    );
};

const SubcategoryModal = ({ service, subcategories, initialSelection, onSave, onClose }) => {
    const [tempSelection, setTempSelection] = useState(initialSelection || []);

    const toggleSelection = (name) => {
        setTempSelection(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const handleSave = () => {
        onSave(tempSelection);
        // onClose is called by the parent after saving
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1c2e4a', borderBottom: '2px solid #34d399', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{fontSize: '2.5rem'}}>{service.icon}</span> Select Sub-Services for {service.name}
                </h2>
                <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '1rem' }}>
                    **Crucial Step:** Accurately select the specific tasks. This data is used for Service Provider assignment and pricing.
                </p>
                <div style={styles.subcategoryGrid}>
                    {subcategories.map(sub => (
                        <SubcategoryCard key={sub.name} subcategory={sub}
                            isSelected={tempSelection.includes(sub.name)} onClick={toggleSelection} />
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                    <button style={{ ...styles.buttonSecondary, padding: '10px 20px' }} onClick={onClose}>
                        <span style={{fontWeight: '500'}}>Go Back / Cancel</span>
                    </button>
                    <button
                        style={tempSelection.length === 0 ? { ...styles.buttonPrimary, ...styles.buttonDisabled, padding: '10px 20px' } : { ...styles.buttonPrimary, padding: '10px 20px', backgroundColor: '#4f46e5' }}
                        disabled={tempSelection.length === 0} onClick={handleSave}>
                        Confirm Selection ({tempSelection.length} Items)
                    </button>
                </div>
            </div>
        </div>
    );
};

const CallContext = ({ ticketId, phoneNumber, requestDetails }) => {
    return (
        <div style={styles.contextBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1c2e4a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <TicketIcon style={{color: '#4f46e5'}}/> Call Context: Ticket **{ticketId}**
                </h2>
                <span style={styles.contextHighlight}>{phoneNumber}</span>
            </div>
            
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', minHeight: '60px' }}>
                <p style={{ color: '#374151', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Customer Request Note:</p>
                <p style={{ color: '#4b5563', fontSize: '0.8rem', marginTop: '2px', fontStyle: 'italic', maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {requestDetails}
                </p>
            </div>
        </div>
    );
};

export default function UserServicesPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const ticketId = location.state?.ticketId;
    const requestDetails = location.state?.requestDetails;
    const selectedAddressId = location.state?.selectedAddressId;
    const phoneNumber = location.state?.phoneNumber;

    const [selectedServices, setSelectedServices] = useState({}); // { serviceName: [subcategories] }
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [activeModalService, setActiveModalService] = useState(null);
    const [activeSubcategoryList, setActiveSubcategoryList] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getSubcategoryList = (serviceName) => {
        if (serviceName === 'Cleaning') return CLEANING_SUBCATEGORIES;
        if (serviceName === 'Plumber') return PLUMBER_SUBCATEGORIES;
        if (serviceName === 'Carpenter') return CARPENTER_SUBCATEGORIES;
        return null;
    };

    const handleSelectService = (service) => {
        const serviceName = service.name;
        const subcategoryList = getSubcategoryList(serviceName);

        if (subcategoryList) {
            // Service with subcategories - open modal
            setActiveModalService(service);
            setActiveSubcategoryList(subcategoryList);
            setShowSubcategoryModal(true);
        } else {
            // Service without subcategories - toggle selection
            setSelectedServices(prev => {
                const newSelection = { ...prev };
                if (newSelection[serviceName]) {
                    delete newSelection[serviceName];
                } else {
                    newSelection[serviceName] = [];
                }
                return newSelection;
            });
        }
    };

    const handleSubcategorySave = (subcategories) => {
        if (activeModalService) { 
            if (subcategories.length > 0) {
                 setSelectedServices(prev => ({
                    ...prev,
                    [activeModalService.name]: subcategories
                }));
            } else {
                // Remove the service if the agent clears all subcategories in the modal
                 setSelectedServices(prev => {
                    const newSelection = { ...prev };
                    delete newSelection[activeModalService.name];
                    return newSelection;
                 });
            }
        }
        setShowSubcategoryModal(false);
    };

    const handleConfirmAndContinue = () => {
        if (Object.keys(selectedServices).length === 0) {
            alert('Please select at least one service before continuing.');
            return;
        }

        // Validate subcategories for services that require them
        for (const [serviceName, subcategories] of Object.entries(selectedServices)) {
            const requiresSubcategories = ['Cleaning', 'Plumber', 'Carpenter'].includes(serviceName);
            if (requiresSubcategories && (!subcategories || subcategories.length === 0)) {
                alert(`Please select at least one sub-service for ${serviceName} before continuing.`);
                const service = SERVICES.find(s => s.name === serviceName);
                // Re-open modal for required subcategories
                setActiveModalService(service);
                setActiveSubcategoryList(getSubcategoryList(serviceName));
                setShowSubcategoryModal(true);
                return;
            }
        }

        navigate('/user/servicemen', {
            state: {
                ticketId,
                requestDetails,
                selectedAddressId,
                phoneNumber,
                selectedServices, // Pass entire object: { serviceName: [subcategories] }
            }
        });
    };

    const handleScheduleRedirect = () => {
        if (Object.keys(selectedServices).length === 0) {
            alert('Please select at least one service before scheduling.');
            return;
        }
        // Same validation as above
        for (const [serviceName, subcategories] of Object.entries(selectedServices)) {
            const requiresSubcategories = ['Cleaning', 'Plumber', 'Carpenter'].includes(serviceName);
            if (requiresSubcategories && (!subcategories || subcategories.length === 0)) {
                alert(`Please select at least one sub-service for ${serviceName} before scheduling.`);
                const service = SERVICES.find(s => s.name === serviceName);
                setActiveModalService(service);
                setActiveSubcategoryList(getSubcategoryList(serviceName));
                setShowSubcategoryModal(true);
                return;
            }
        }

        navigate('/user/scheduling', {
            state: {
                ticketId,
                requestDetails,
                selectedAddressId,
                phoneNumber,
                selectedServices,
            }
        });
    };

    if (!ticketId || !requestDetails || !selectedAddressId || !phoneNumber) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>Error: Missing Call Context</h1>
            </div>
        );
    }

    const selectedCount = Object.keys(selectedServices).length;

    return (
        <div style={styles.container}>
            {/* HEADER (Consistent with Dashboard) */}
            <header style={styles.header}>
                <div style={styles.brand}>
                    <PhoneIcon style={{color: '#34d399'}}/>
                    <span>CC Agent Console: Service Assignment</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>
                         <ClockIcon style={{color: '#9ca3af'}} /> {currentTime}
                    </span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            <div style={styles.mainLayout}>
                <CallContext ticketId={ticketId} phoneNumber={phoneNumber} requestDetails={requestDetails} />

                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1c2e4a', marginBottom: '10px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
                    Select Service Categories
                </h1>
                <p style={{fontSize: '1rem', color: '#4b5563'}}>
                    Click on the card to select a service. Services that require specific tasks (🔗) will prompt a sub-service selection window.
                </p>

                {/* SERVICE GRID */}
                <div style={styles.serviceGrid}>
                    {SERVICES.map((service) => {
                        const hasSubcategories = ['Cleaning', 'Plumber', 'Carpenter'].includes(service.name);
                        const isSelected = selectedServices.hasOwnProperty(service.name);
                        return (
                            <ServiceCard
                                key={service.name}
                                service={service}
                                isSelected={isSelected}
                                hasSubcategories={hasSubcategories}
                                onClick={handleSelectService}
                            />
                        );
                    })}
                </div>
            </div>

            {/* SUBCATEGORY MODAL */}
            {showSubcategoryModal && activeModalService && activeSubcategoryList.length > 0 && (
                <SubcategoryModal
                    service={activeModalService}
                    subcategories={activeSubcategoryList}
                    initialSelection={selectedServices[activeModalService.name] || []}
                    onSave={handleSubcategorySave}
                    onClose={() => setShowSubcategoryModal(false)}
                />
            )}

            {/* ACTION BAR (Sticky Footer) */}
            <div style={styles.actionBar}>
                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {selectedCount > 0 ? (
                        <>
                            <span style={{color: '#1c2e4a', fontWeight: '700', fontSize: '1.1rem'}}>
                                Total Services Selected: <strong style={{color: '#4f46e5'}}>{selectedCount}</strong>
                            </span>
                            <span style={{ color: '#065f46', fontWeight: '600', fontSize: '0.9rem', backgroundColor: '#d1fae5', padding: '5px 10px', borderRadius: '6px' }}>
                                Details: {Object.entries(selectedServices).map(([name, subs]) => 
                                    `${name}${subs.length > 0 ? ` (${subs.length})` : ''}`
                                ).join(', ')}
                            </span>
                        </>
                    ) : (
                        <span style={{color: '#9ca3af', fontStyle: 'italic', fontSize: '1rem'}}>Awaiting service selection...</span>
                    )}
                </div>

                <button
                    style={selectedCount === 0 ? { ...styles.buttonSecondary, ...styles.buttonDisabled } : styles.buttonSecondary}
                    disabled={selectedCount === 0}
                    onClick={handleScheduleRedirect}>
                    📅 Schedule Service (Time/Date)
                </button>

                <button
                    style={selectedCount === 0 ? { ...styles.buttonPrimary, ...styles.buttonDisabled } : styles.buttonPrimary}
                    disabled={selectedCount === 0}
                    onClick={handleConfirmAndContinue}>
                    Assign Serviceman & Continue →
                </button>
            </div>
        </div>
    );
}
