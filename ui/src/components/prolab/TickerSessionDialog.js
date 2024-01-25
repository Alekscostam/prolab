import {ProgressBar} from 'devextreme-react';
import {Dialog} from 'primereact/dialog';
import {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import {Button} from 'primereact/button';
import AuthService from '../../services/AuthService';

const maxValue = 30;
function statusFormat() {
    return ``;
}

const elementAttr = {'aria-label': 'Progress Bar'};

export const TickerSessionDialog = (props) => {
    let intervalId = undefined;
    const authService = new AuthService();
    const {onLogout, onProlongSession, visible} = props;

    const [seconds, setSeconds] = useState(null);
    const progressBar = useRef();

    useEffect(() => {
        onCounterInit();
        return () => {
            clearInterval(intervalId);
        };
    }, [props]);

    const onCounterInit = () => {
        if (intervalId === undefined) {
            console.log(intervalId, 'intervalId');
            intervalId = setInterval(() => {
                setSeconds((prevValue) => prevValue + 1);
                if (!authService.isLoggedUser()) {
                    clearInterval(intervalId);
                    onLogout();
                }
                if (progressBar.current?.instance?.option('value') <= 0 ) {
                    clearInterval(intervalId);
                    onLogout();
                }
            }, 1000);
        }
    };

    return (
        <div>
            <Dialog
                id='sessionTimeoutDialog'
                header={LocUtils.loc(props.labels, 'Session_expired', 'Sesja wygasa')}
                closable={false}
                footer={
                    <div>
                        <div>
                            <Button
                                type='button'
                                onClick={() => {
                                    onProlongSession();
                                    clearInterval(intervalId);
                                }}
                                label={LocUtils.loc(props.labels, 'Session_prelong', 'Przedłuż')}
                            />
                        </div>
                    </div>
                }
                minX={'1200px'}
                visible={visible}
                resizable={false}
                breakpoints={{'1260px': '75vw', '840px': '100vw'}}
                onHide={() => this.onHide()}
            >
                <ProgressBar
                    ref={progressBar}
                    id='progress-bar-status'
                    className={seconds === 0 ? 'complete' : ''}
                    width='90%'
                    min={0}
                    max={maxValue}
                    elementAttr={elementAttr}
                    statusFormat={statusFormat}
                    value={maxValue - seconds}
                />
            </Dialog>
        </div>
    );
};

TickerSessionDialog.defaultProps = {
    onProlongSession: undefined,
    onLogout: undefined,
    visible: true,
    value: '',
};

TickerSessionDialog.propTypes = {
    onProlongSession: PropTypes.func,
    onLogout: PropTypes.func,
    visible: PropTypes.bool,
    value: PropTypes.string,
};
