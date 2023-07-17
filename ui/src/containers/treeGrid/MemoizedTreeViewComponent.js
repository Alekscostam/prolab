import React from 'react';
import PropTypes from 'prop-types';

let value = 0;

const MemoizedTreeViewAddSpecComponent = React.memo(
    ({treeViewComponent}) => {
        value = 0;
        return treeViewComponent;
    },
    (prevProps, nextProps) => {
        if (value !== 0) {
            if (value !== nextProps.parameterToCompare) {
                value = value + 1;
                return true;
            }
            return false;
        }
        if (prevProps.parameterToCompare !== nextProps.parameterToCompare) {
            value = prevProps.parameterToCompare + 1;
            return true;
        }
        return false;
    }
);
MemoizedTreeViewAddSpecComponent.defaultProps = {
    treeViewComponent: undefined,
    parameterToCompare: 0,
};

MemoizedTreeViewAddSpecComponent.propTypes = {
    treeViewComponent: PropTypes.object.isRequired,
    parameterToCompare: PropTypes.number.isRequired,
};

export default MemoizedTreeViewAddSpecComponent;
