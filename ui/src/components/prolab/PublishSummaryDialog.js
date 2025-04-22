import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {Toast} from 'primereact/toast';
import DivContainer from '../DivContainer';

const PublishSummaryDialog = (props) => {
    const [publishedIds] = useState(props.publishSummary.publishedIds);
    const [unpublishedIds] = useState(props.publishSummary.unpublishedIds);
    const [publishedSize] = useState(publishedIds?.length ?? 0);
    const [unpublishedSize] = useState(unpublishedIds?.length ?? 0);
    const messages = useRef(null);

    useEffect(() => {
        return () => {
            props.handleUnselectAllData();
        };
    }, [props]);

    const onHide = () => {
        props.handleUnselectAllData();
        props.onHide();
    };

    const createViewPublishValues = (ids) => {
        let viewValues = '';
        if (ids.length) {
            if (ids.length === 1) {
                viewValues += ids;
            } else {
                for (let index = 0; index < ids.length; index++) {
                    viewValues += ' ' + ids[index];
                }
            }
        }
        return viewValues;
    };

    const publishedViewValues = createViewPublishValues(publishedIds);
    const unpublishedViewValues = createViewPublishValues(unpublishedIds);

    const allElementsSize = publishedSize + unpublishedSize;
    const publishedElementSize = publishedSize;

    return (
        <React.Fragment>
            <Toast id='toast-messages' position='top-center' ref={messages} />
            <Dialog
                id='publishSummaryDialog'
                header={LocUtils.locFromStoreWithDefault(
                    'Document_publication_completed',
                    'Zakończono publikację dokumentów'
                )}
                footer={
                    <React.Fragment>
                        <div>
                            <Button
                                type='button'
                                onClick={onHide}
                                label={LocUtils.locFromStoreWithDefault('Next', 'Dalej')}
                            />
                        </div>
                    </React.Fragment>
                }
                visible={props.visible}
                resizable={false}
                breakpoints={{'860px': '75vw', '640px': '100vw'}}
                onHide={onHide}
            >
                <div>
                    <DivContainer className='row'>
                        <label style={{fontSize: '0.9em'}}>
                            {LocUtils.locFromStoreWithDefault('Published', 'Opublikowano')} {publishedElementSize} /{' '}
                            {allElementsSize}
                        </label>
                    </DivContainer>
                    {publishedIds?.length > 0 && (
                        <DivContainer>
                            <label style={{fontSize: '0.9em'}}>
                                ID : {publishedViewValues}
                                <DivContainer className='row'>
                                    {LocUtils.locFromStoreWithDefault(
                                        'Document_published',
                                        'Dokumenty zostały opublikowane'
                                    )}
                                </DivContainer>
                            </label>
                        </DivContainer>
                    )}
                    {unpublishedIds?.length > 0 && (
                        <DivContainer>
                            <label style={{fontSize: '0.9em'}}>
                                ID : {unpublishedViewValues}
                                <DivContainer className='row'>
                                    {LocUtils.locFromStoreWithDefault(
                                        'Document_unpublished',
                                        'Dokumenty nie zostały opublikowane'
                                    )}
                                </DivContainer>
                            </label>
                        </DivContainer>
                    )}
                </div>
            </Dialog>
        </React.Fragment>
    );
};

PublishSummaryDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    publishSummary: PropTypes.shape({
        publishedIds: PropTypes.array.isRequired,
        unpublishedIds: PropTypes.array.isRequired,
    }).isRequired,
    handleUnselectAllData: PropTypes.func.isRequired,
};

PublishSummaryDialog.defaultProps = {
    visible: true,
};

export default PublishSummaryDialog;
