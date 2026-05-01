import React, {useState, useRef, useEffect} from 'react';
import ChatAi from '../ai/chat/ChatAi';

const Widget = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // 🔥 zamykanie po kliknięciu poza (menu + button)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            {/* 💬 CHAT WINDOW */}
            {chatOpen && (
                <div style={styles.chatWindow}>
                    <div style={styles.header}>
                        <span>Chat AI</span>
                        <button onClick={() => setChatOpen(false)} style={styles.closeBtn}>
                            ✕
                        </button>
                    </div>

                    <div style={styles.body}>
                        <ChatAi />
                    </div>
                </div>
            )}

            {/* 📱 MINI MENU */}
            {menuOpen && (
                <div ref={menuRef} style={styles.menu}>
                    <div
                        style={styles.menuItem}
                        onClick={() => {
                            setChatOpen(true);
                            setMenuOpen(false);
                        }}
                    >
                        💬 ChatAi
                    </div>

                    {/* <div style={styles.menuItem}>⚙️ Ustawienia</div>
                    <div style={styles.menuItem}>📄 Pomoc</div> */}
                </div>
            )}

            {/* 🔘 FLOAT BUTTON */}
            <div
                ref={buttonRef}
                onClick={() => setMenuOpen((prev) => !prev)}
                style={styles.button}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                <i
                    className={
                        menuOpen
                            ? 'mdi mdi-chevron-down' // collapse
                            : 'mdi mdi-dots-horizontal' // menu
                    }
                    style={{
                        fontSize: 28,
                        transition: 'all 0.2s ease',
                    }}
                />
            </div>
        </>
    );
};

const styles = {
    chatWindow: {
        position: 'fixed',
        bottom: 90,
        right: 20,
        width: 400,
        height: 'auto',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        padding: '10px 15px',
        background: '#0e49eb',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: 18,
    },
    body: {
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
    },
    button: {
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: '#0e49eb',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 999999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
    },
    menu: {
        position: 'fixed',
        bottom: 90,
        right: 20,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 8,
        minWidth: 180,
    },
    menuItem: {
        padding: '10px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
};

export default Widget;
