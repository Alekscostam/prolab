import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {Toast} from 'primereact/toast';
import {Checkbox} from 'primereact/checkbox';
import {NumberBox} from 'devextreme-react';

const CopyDialog = ({visible, isSpecification, handleCopy, handleUnselectAllData, onHide}) => {
    const messages = useRef(null);

    const [copyOptions, setCopyOptions] = useState({
        headerCopy: true,
        specCopy: isSpecification ? true : undefined,
        specResultsCopy: isSpecification ? false : undefined,
        copyLastModifiedObject: false,
        numberOfCopy: 1,
    });

    const [copyCounter] = useState({
        reInitializeCounter: 1,
        counter: 1,
    });

    const handleChangeCopyOptions = (e) => {
        setCopyOptions((prev) => ({
            ...prev,
            [e.target.id]: e.checked,
        }));
    };

    const handleNumberOfCopyChange = (e) => {
        setCopyOptions((prev) => ({
            ...prev,
            numberOfCopy: e.value,
        }));
    };

    const handleDialogHide = () => {
        handleUnselectAllData();
        onHide();
    };

    const handleConfirm = () => {
        handleCopy({copyOptions, copyCounter});
        onHide();
    };

    return (
        <React.Fragment>
            <Toast id='toast-messages' position='top-center' ref={messages} />
            <Dialog
                id='copyDialog'
                header={LocUtils.locFromStoreWithDefault('Copy', 'Kopiowanie')}
                footer={
                    <div>
                        <Button
                            type='button'
                            onClick={handleConfirm}
                            label={LocUtils.locFromStoreWithDefault('Confirm', 'Zatwierdź')}
                        />
                    </div>
                }
                style={{maxWidth: '300px'}}
                blockScroll
                visible={visible}
                resizable={false}
                onHide={handleDialogHide}
            >
                <div className='row'>
                    <div className='col-12'>
                        <Checkbox
                            id='headerCopy'
                            name='headerCopy'
                            className='mr-2'
                            checked={copyOptions.headerCopy}
                            onChange={handleChangeCopyOptions}
                        />
                        <label style={{color: '#000', marginBottom: '0px'}}>
                            {LocUtils.locFromStoreWithDefault('Copy_header', 'Kopiowanie nagłówka')}
                        </label>
                    </div>

                    {isSpecification && (
                        <div className='col-12 mt-2'>
                            <div>
                                <Checkbox
                                    id='specCopy'
                                    name='specCopy'
                                    className='mr-2'
                                    checked={copyOptions.specCopy}
                                    onChange={handleChangeCopyOptions}
                                />
                                <label style={{color: '#000', marginBottom: '0px'}}>
                                    {LocUtils.locFromStoreWithDefault('Copy_spec', 'Kopiowanie specyfikacji')}
                                </label>
                            </div>
                            <div>
                                <Checkbox
                                    id='specResultsCopy'
                                    name='specResultsCopy'
                                    className='ml-5 mr-2'
                                    checked={copyOptions.specResultsCopy}
                                    onChange={handleChangeCopyOptions}
                                />
                                <label style={{color: '#000', marginBottom: '0px'}}>
                                    {LocUtils.locFromStore('Copy_spec_result')}
                                </label>
                            </div>
                        </div>
                    )}

                    <div className='col-12 mt-2'>
                        <Checkbox
                            id='copyLastModifiedObject'
                            name='copyLastModifiedObject'
                            className='mr-2'
                            checked={copyOptions.copyLastModifiedObject}
                            onChange={handleChangeCopyOptions}
                        />
                        <label style={{color: '#000', marginBottom: '0px'}}>
                            {LocUtils.locFromStore('Copy_last_modified')}
                        </label>
                    </div>

                    <div className='col-12 mt-2'>
                        <NumberBox
                            stylingMode='outlined'
                            label={LocUtils.locFromStore('Number_of_copy')}
                            defaultValue={1}
                            min={1}
                            max={1000000}
                            value={copyOptions.numberOfCopy}
                            onValueChanged={handleNumberOfCopyChange}
                            showSpinButtons={true}
                            step={1}
                            format='###0'
                        />
                    </div>
                </div>
            </Dialog>
        </React.Fragment>
    );
};

CopyDialog.propTypes = {
    id: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    isSpecification: PropTypes.bool,
    handleCopy: PropTypes.func.isRequired,
    handleUnselectAllData: PropTypes.func.isRequired,
};

CopyDialog.defaultProps = {
    visible: true,
};

export default CopyDialog;
