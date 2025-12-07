export const StickyHeader = ({children}) => {
    return (
        <div
            className='sticky-header-container'
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 999,
                background: 'white',
                paddingBottom: '5px',
            }}
        >
            {children}
        </div>
    );
};
