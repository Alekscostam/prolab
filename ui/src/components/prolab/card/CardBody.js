import {StringUtils} from '../../../utils/StringUtils';
import CardImage from '../../CardImage';
import PropTypes from 'prop-types';

export const CardBody = ({image, body, imageClick, rowData}) => {
    const isImageVisible = image?.visible && image?.fieldName && rowData[image?.fieldName];
    const isBodyVisible = body?.visible && body?.fieldName && rowData[body?.fieldName];
    const getAlt = (fieldDefinition) => {
        return rowData[fieldDefinition?.title] ? rowData[fieldDefinition?.title] : '';
    };
    const getBgColor = (fieldDefinition) => {
        const bgColor = rowData[`_BGCOLOR_${fieldDefinition.fieldName.toUpperCase()}`];
        return bgColor === undefined ? rowData._BGCOLOR : bgColor;
    };
    const getFontColor = (fieldDefinition) => {
        const fontColor = rowData[`_FONTCOLOR_${fieldDefinition.fieldName.toUpperCase()}`];
        return fontColor === undefined ? rowData._FONTCOLOR : fontColor;
    };
    return (
        <div className='row no-margin-left-right card-body-component'>
            {isImageVisible && (
                <div className='col-4 px-0'>
                    <CardImage
                        alt={getAlt(image)}
                        onClick={(e) => {
                            if (imageClick) {
                                e.preventDefault();
                                e.stopPropagation();
                                imageClick(rowData[image.fieldName], image.label);
                            }
                        }}
                        className={'image-component'}
                        style={{
                            cursor: 'pointer',
                            width: '100%',
                            backgroundColor: !StringUtils.isBlank(rowData[image?.fieldName]) ? getBgColor(image) : '',
                            color: getFontColor(image),
                        }}
                        base64={rowData[image.fieldName]}
                    />
                </div>
            )}
            {isBodyVisible && (
                <div
                    className={`${isImageVisible ? 'col-8 px-0' : 'col-12 px-0'}`}
                    style={{padding: `${isImageVisible ? '3px' : ''}`}}
                >
                    <span
                        style={{
                            backgroundColor: !StringUtils.isBlank(rowData[body?.fieldName]) ? getBgColor(body) : '',
                            color: getFontColor(body),
                            marginLeft: isImageVisible ? '3px' : '',
                        }}
                        className='body-component'
                        title={StringUtils.textFromHtmlString(rowData[body?.fieldName])}
                        dangerouslySetInnerHTML={{
                            __html: StringUtils.truncateText(
                                StringUtils.textFromHtmlString(rowData[body.fieldName]),
                                300
                            ),
                        }}
                    ></span>
                </div>
            )}
        </div>
    );
};
CardBody.defaultProps = {};
CardBody.propTypes = {
    body: PropTypes.object.isRequired,
    image: PropTypes.object.isRequired,
    rowData: PropTypes.object,
    imageClick: PropTypes.func,
};
export default CardBody;
