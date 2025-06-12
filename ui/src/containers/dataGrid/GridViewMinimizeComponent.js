import PropTypes from 'prop-types';
import {ColumnType} from '../../enum/ColumnType';
import {ColumnUtils} from '../../utils/ColumnUtils';

const GridViewMinimizeComponent = ({subView, onClick, onImageClick}) => {
    let fieldName = '';
    let fieldValue = '';
    let fieldType = '';

    try {
        const column = ColumnUtils.findFirstVisibleLeafColumn(subView?.headerColumns);
        fieldName = column?.label || '';
        fieldValue = subView?.headerData[0]?.[column.fieldName];
        fieldType = column?.type;
    } catch (e) {
        // ewentualnie można tu dodać logowanie błędu
    }

    if (fieldType === ColumnType.I || fieldType === ColumnType.IM) {
        fieldValue = (
            <div>
                <img
                    onClick={(e) => {
                        onImageClick(e.currentTarget.currentSrc, fieldName);
                    }}
                    src={`data:image/jpeg;base64,${fieldValue}`}
                    alt=''
                    style={{cursor: 'pointer', maxWidth: '50px', padding: '3px'}}
                />
            </div>
        );
    }

    return (
        <div className='minimize-sub-view'>
            <div className='d-inline-flex p-1' style={{color: '#707890'}}>
                {fieldName}
            </div>
            <div className='d-inline-flex p-1' style={{color: '#333'}}>
                {fieldValue}
            </div>
            <div className='arrow-close' onClick={onClick} />
        </div>
    );
};

GridViewMinimizeComponent.propTypes = {
    subView: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    onImageClick: PropTypes.func.isRequired,
};

export default GridViewMinimizeComponent;
