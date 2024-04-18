import {CheckBox} from 'devextreme-react';
import React from 'react';
import CardImage from '../components/CardImage';
import {ColumnType} from '../model/ColumnType';

export class CardViewUtils {
    static cellTemplate(fieldDefinition, rowData, className, type) {
        if (!!rowData[fieldDefinition.fieldName]) {
            const bgColor = rowData[`_BGCOLOR_${fieldDefinition.fieldName.toUpperCase()}`];
            const fontColor = rowData[`_FONTCOLOR_${fieldDefinition.fieldName.toUpperCase()}`];
            switch (fieldDefinition?.type) {
                case ColumnType.I:
                case ColumnType.IM:
                    if (
                        Array.isArray(rowData[fieldDefinition.fieldName]) &&
                        rowData[fieldDefinition.fieldName]?.length > 0
                    ) {
                        return (
                            <CardImage
                                alt={rowData[fieldDefinition.title]}
                                style={{
                                    backgroundColor: bgColor === undefined ? rowData._BGCOLOR : bgColor,
                                    color: fontColor === undefined ? rowData._FONTCOLOR : fontColor,
                                    display: 'block',
                                    maxWidth: type === 'IMG' ? '33%' : type === 'BODY_WITH_IMG' ? '67%' : '100%',
                                }}
                                className={className}
                                base64={rowData[fieldDefinition.fieldName]}
                            />
                        );
                    } else {
                        return (
                            <CardImage
                                alt={rowData[fieldDefinition.title]}
                                style={{
                                    backgroundColor: bgColor === undefined ? rowData._BGCOLOR : bgColor,
                                    color: fontColor === undefined ? rowData._FONTCOLOR : fontColor,
                                    display: 'block',
                                    maxWidth: type === 'IMG' ? '33%' : type === 'BODY_WITH_IMG' ? '67%' : '100%',
                                }}
                                className={className}
                                base64={rowData[fieldDefinition.fieldName]}
                            />
                        );
                    }
                case ColumnType.B:
                    return (
                        <div
                            style={{
                                backgroundColor: bgColor === undefined ? rowData._BGCOLOR : bgColor,
                                color: fontColor === undefined ? rowData._FONTCOLOR : fontColor,
                                maxWidth: type === 'IMG' ? '33%' : type === 'BODY_WITH_IMG' ? '67%' : '100%',
                            }}
                            className={className}
                            title={rowData[fieldDefinition.fieldName]}
                        >
                            <CheckBox readOnly={true} value={parseInt(rowData[fieldDefinition.fieldName]) === 1} />
                        </div>
                    );
                default:
                    return (
                        <span
                            style={{
                                backgroundColor: bgColor === undefined ? rowData._BGCOLOR : bgColor,
                                color: fontColor === undefined ? rowData._FONTCOLOR : fontColor,
                                maxWidth: type === 'IMG' ? '33%' : type === 'BODY_WITH_IMG' ? '67%' : '100%',
                            }}
                            className={className}
                            title={rowData[fieldDefinition.fieldName]}
                            // eslint-disable-next-line
                            dangerouslySetInnerHTML={{__html: rowData[fieldDefinition.fieldName]}}
                        ></span>
                    );
            }
        } else {
            return (
                <span
                    style={{
                        backgroundColor: rowData[`_BGCOLOR_${fieldDefinition.fieldName.toUpperCase()}`],
                        color: rowData[`_FONTCOLOR_${fieldDefinition.fieldName.toUpperCase()}`],
                        maxWidth: type === 'IMG' ? '33%' : type === 'BODY_WITH_IMG' ? '67%' : '100%',
                    }}
                    className={className}
                    title={rowData[fieldDefinition.fieldName]}
                    // eslint-disable-next-line
                    dangerouslySetInnerHTML={{__html: rowData[fieldDefinition.fieldName]}}
                ></span>
            );
        }
    }
}
