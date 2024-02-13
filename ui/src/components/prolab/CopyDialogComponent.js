import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {Toast} from 'primereact/toast';
import {Checkbox} from 'primereact/checkbox';
import {InputNumber} from 'primereact/inputnumber';

export default class CopyDialogComponent extends React.Component {
    constructor(props) {
        super(props);
        this.refDataGrid = {};
        this.state = {
            copyOptions: {
                headerCopy: true,
                specCopy: this.props.isSpecification ? true : undefined,
                specResultsCopy: this.props.isSpecification ? false : undefined,
                copyLastModifiedObject: false,
                numberOfCopy: 1,
            },
            copyCounter: {
                reInitializeCounter: 1,
                counter: 1,
            },
        };
        this.onHide = this.onHide.bind(this);
        this.handleChangeCopyOptions = this.handleChangeCopyOptions.bind(this);
    }

    onHide() {
        this.props.handleUnselectAllData();
        this.props.onHide();
    }

    handleChangeCopyOptions(e) {
        this.setState((prevState) => ({
            copyOptions: {
                ...prevState.copyOptions,
                [e.target.id]: e.checked,
            },
        }));
    }

    render() {
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <Dialog
                    id='copyDialog'
                    header={LocUtils.loc(this.props.labels, 'Copy_header', 'Kopiowanie')}
                    footer={
                        <React.Fragment>
                            <div>
                                <Button
                                    type='button'
                                    onClick={() => {
                                        this.props.handleCopy(this.state);
                                        this.props.onHide();
                                    }}
                                    label={LocUtils.loc(this.props.labels, 'Confirm_button', 'Zatwierdź')}
                                />
                            </div>
                        </React.Fragment>
                    }
                    visible={this.props.visible}
                    resizable={false}
                    breakpoints={{'860px': '75vw', '640px': '100vw'}}
                    onHide={() => this.onHide()}
                >
                    <div>
                        <div className='row col-lg-12'>
                            <Checkbox
                                id='headerCopy'
                                name='headerCopy'
                                className='mr-2'
                                checked={this.state.copyOptions.headerCopy}
                                onChange={this.handleChangeCopyOptions}
                            />
                            <label style={{color: '#000'}}>
                                {LocUtils.loc(this.props.labels, 'copy_header', 'Kopiowanie nagłówka')}
                            </label>
                        </div>
                        {this.props.isSpecification ? (
                            <React.Fragment>
                                <div className='row mt-2 col-lg-12'>
                                    <Checkbox
                                        id='specCopy'
                                        name='specCopy'
                                        className=' mr-2'
                                        checked={this.state.copyOptions.specCopy}
                                        onChange={this.handleChangeCopyOptions}
                                    />
                                    <label style={{color: '#000'}}>
                                        {LocUtils.loc(this.props.labels, 'copy_spec', 'Kopiowanie specyfikacji')}
                                    </label>
                                </div>
                                <div className='row mt-2  col-lg-12'>
                                    <Checkbox
                                        id='specResultsCopy'
                                        name='specResultsCopy'
                                        className='ml-5 mr-2 '
                                        checked={this.state.copyOptions.specResultsCopy}
                                        onChange={this.handleChangeCopyOptions}
                                    />
                                    <label style={{color: '#000'}}>
                                        {LocUtils.loc(this.props.labels, 'copy_spec_result', 'z wynikami')}
                                    </label>
                                </div>
                            </React.Fragment>
                        ) : null}

                        <label style={{color: '#000'}} className='mt-2'>
                            {LocUtils.loc(this.props.labels, 'number_of_copy', 'Liczba kopii')}
                        </label>
                        <div className='row'>
                            <InputNumber
                                id='numberOfCopy'
                                name='numberOfCopy'
                                className='p-inputtext-sm  col-lg-6'
                                min={1}
                                value={this.state.copyOptions.numberOfCopy}
                                onValueChange={(e) => {
                                    this.setState((prevState) => ({
                                        copyOptions: {
                                            ...prevState.copyOptions,
                                            [e.target.id]: e.value,
                                        },
                                    }));
                                }}
                                showButtons
                            />
                        </div>
                        <div className='row mt-3 col-lg-12'>
                            <Checkbox
                                id='copyLastModifiedObject'
                                name='copyLastModifiedObject'
                                className='ml-3 mr-2'
                                checked={this.state.copyOptions.copyLastModifiedObject}
                                onChange={this.handleChangeCopyOptions}
                            />
                            <label style={{color: '#000'}}>
                                {LocUtils.loc(this.props.labels, 'copy_last_modified', 'Kopiuj ostatni zmodyfikowany')}
                            </label>
                        </div>
                    </div>
                </Dialog>
            </React.Fragment>
        );
    }
}

CopyDialogComponent.defaultProps = {
    visible: true,
};

CopyDialogComponent.defaultProps = {
    id: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};
