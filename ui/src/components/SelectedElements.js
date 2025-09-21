import {StringUtils} from '../utils/StringUtils';

export const SelectedElements = ({selectedRowKeys, totalCounts, onlyTotalCounts = false}) => {
    if (StringUtils.isBlank(selectedRowKeys) && onlyTotalCounts === false) {
        return <div></div>;
    }
    const length = selectedRowKeys?.length;
    if (StringUtils.isBlank(totalCounts)) {
        return <div></div>;
    }
    const getLength = () => {
        if (onlyTotalCounts) {
            return `${totalCounts}`;
        } else {
            return `${length}/${totalCounts}`;
        }
    };

    return (
        <div id='selected-elements-outer'>
            <div id='selected-elements'>{getLength()}</div>
        </div>
    );
};

export default SelectedElements;
