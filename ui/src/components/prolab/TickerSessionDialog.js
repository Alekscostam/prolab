import {ProgressBar} from 'devextreme-react';
import {Dialog} from 'primereact/dialog';
import {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import {Button} from 'primereact/button';

function statusFormat() {
    return ``;
}

const elementAttr = {'aria-label': 'Progress Bar'};

export const TickerSessionDialog = (props) => {
    let intervalId = useRef();
    const {onLogout, onProlongSession, visible, secondsToPopup, authService} = props;
    let counterStart = true;
    const [seconds, setSeconds] = useState(null);
    const progressBar = useRef();

    const onCounterInit = useCallback(() => {
        if (intervalId.current === undefined) {
            intervalId.current = setInterval(() => {
                setSeconds((prevValue) => prevValue + 1);
                if (!authService.isLoggedUser()) {
                    clearInterval(intervalId.current);
                    onLogout();
                }
                if (progressBar.current?.instance?.option('value') <= 0) {
                    clearInterval(intervalId.current);
                    onLogout();
                }
            }, 1000);
        }
    }, [onLogout, authService]);

    useEffect(() => {
        if (counterStart) {
            onCounterInit();
        }
        return () => {
            clearInterval(intervalId);
        };
    }, [props, counterStart, intervalId, onCounterInit]);

    return (
        <div>
            {secondsToPopup != null && secondsToPopup !== undefined && secondsToPopup !== 0 && (
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
                                        counterStart = false;
                                        onProlongSession();
                                        clearInterval(intervalId.current);
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
                        max={secondsToPopup}
                        elementAttr={elementAttr}
                        statusFormat={statusFormat}
                        value={secondsToPopup - seconds}
                    />
                </Dialog>
            )}
        </div>
    );
};

TickerSessionDialog.defaultProps = {
    onProlongSession: undefined,
    onLogout: undefined,
    visible: true,
    value: '',
    secondsToPopup: 45,
};

TickerSessionDialog.propTypes = {
    onProlongSession: PropTypes.func,
    onLogout: PropTypes.func,
    visible: PropTypes.bool,
    value: PropTypes.string,
    secondsToPopup: PropTypes.number,
};
