import React from 'react';
import LocUtils from './utils/LocUtils';
import AppPrefixUtils from './utils/AppPrefixUtils';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            stack: null,
            errorInfo: null,
            reloadPage: false,
        };
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error};
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary:', error, errorInfo);
        const stack = error.stack;
        this.setState({errorInfo, stack});
    }

    handleReset = () => {
        if (this.state.reloadPage) {
            window.location.reload();
        }
        this.setState({hasError: false, error: null, errorInfo: null, reloadPage: !this.state.reloadPage});
    };

    getLabel = () => {
        return this.state.reloadPage
            ? LocUtils.locFromStoreWithDefault('reload_page', 'Przeładuj stronę')
            : LocUtils.locFromStoreWithDefault('try_again', 'Spróbuj ponownie');
    };

    goHome = () => {
        window.location.href = AppPrefixUtils.locationHrefUrl('/#/start');
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <h2 style={styles.title}>
                        {LocUtils.locFromStoreWithDefault('Something_went_wrong', 'Ups! Coś poszło nie tak.')}
                    </h2>
                    <details style={styles.details}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.stack}
                    </details>
                    {/* <i style={styles.home} className='mdi mdi-home' onClick={this.goHome} /> */}
                    <button style={styles.button} onClick={this.handleReset}>
                        {this.getLabel()}
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const styles = {
    container: {
        position: 'relative',
        padding: 20,
        margin: '40px auto',
        maxWidth: 600,
        backgroundColor: '#ffeeee',
        border: '1px solid #cc4444',
        borderRadius: 8,
        textAlign: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    title: {
        fontWeight: 600,
        color: '#cc0000',
    },
    details: {
        marginTop: 15,
        whiteSpace: 'pre-wrap',
        textAlign: 'left',
        backgroundColor: '#fff0f0',
        padding: 10,
        borderRadius: 4,
        fontSize: 12,
        color: '#660000',
        cursor: 'pointer',
    },
    home: {
        position: 'absolute',
        left: 10,
        bottom: '20px',
        fontSize: '30px',
        color: '#cc0000',
        cursor: 'pointer',
    },
    button: {
        marginTop: 20,
        padding: '10px 20px',
        fontSize: 16,
        backgroundColor: '#cc4444',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
    },
};

export default ErrorBoundary;
