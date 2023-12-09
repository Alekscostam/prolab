import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {Toast} from 'primereact/toast';
import AuthService from '../../services/AuthService';
import DivContainer from '../DivContainer';

export default class PublishSummaryDialogComponent extends React.Component {
    constructor(props) {
        super(props);
        this.authService = new AuthService();
        this.refDataGrid = {};
        this.state = {};
        this.onHide = this.onHide.bind(this);
    }

    onHide() {
        this.props.handleUnselectAllData();
        this.props.onHide();
    }

    createViewPublishValues(publishedIds) {
        let viewValues = '';
        if (publishedIds.length) {
            if (publishedIds.length === 1) {
                viewValues += publishedIds;
            } else {
                for (let index = 0; index < publishedIds.length; index++) {
                    viewValues += ' ' + publishedIds[index];
                }
            }
        }
        return viewValues;
    }

    render() {
        const publishedIds = this.props.publishSummary.publishedIds;
        const unpublishedIds = this.props.publishSummary.unpublishedIds;

        const publishedSize = publishedIds?.length === undefined ? 0 : publishedIds?.length;
        const unpublishedSize = unpublishedIds?.length === undefined ? 0 : unpublishedIds?.length;

        let publishedViewValues = this.createViewPublishValues(publishedIds);
        let unpublishedViewValues = this.createViewPublishValues(unpublishedIds);

        const allElementsSize = publishedSize + unpublishedSize;
        const publishedElementSize = publishedIds?.length === undefined ? 0 : publishedIds?.length;

        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <Dialog
                    id='publishSummaryDialog'
                    header={LocUtils.loc(this.props.labels, 'Publish_end_header', 'Zakończono publikację dokumentów')}
                    footer={
                        <React.Fragment>
                            <div>
                                <Button
                                    type='button'
                                    onClick={() => {
                                        this.onHide();
                                    }}
                                    label={LocUtils.loc(this.props.labels, 'Publish_next', 'Dalej')}
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
                        <DivContainer className='row'>
                            <label style={{fontSize: '0.9em'}}>
                                {' '}
                                {LocUtils.loc(this.props.labels, 'Publish_published', 'Opublikowano')}{' '}
                                {publishedElementSize} / {allElementsSize}
                            </label>
                        </DivContainer>
                        <DivContainer rendered={publishedIds?.length}>
                            <label style={{fontSize: '0.9em'}}>
                                ID : {publishedViewValues}
                                <DivContainer className='row'>
                                    {LocUtils.loc(
                                        this.props.labels,
                                        'Publish_published',
                                        'Dokumenty zostały opublikowane'
                                    )}
                                </DivContainer>
                            </label>
                        </DivContainer>
                        <DivContainer rendered={unpublishedIds?.length}>
                            <label style={{fontSize: '0.9em'}}>
                                ID : {unpublishedViewValues}
                                <DivContainer className='row'>
                                    {LocUtils.loc(
                                        this.props.labels,
                                        'Publish_unpublished',
                                        'Dokumenty nie zostały opublikowane'
                                    )}
                                </DivContainer>
                            </label>
                        </DivContainer>
                    </div>
                </Dialog>
            </React.Fragment>
        );
    }
}

PublishSummaryDialogComponent.defaultProps = {
    visible: true,
};

PublishSummaryDialogComponent.defaultProps = {
    id: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};
