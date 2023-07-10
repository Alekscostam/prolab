import React from 'react';
import PropTypes from 'prop-types';

const MemoizedTreeViewComponent = React.memo(
    ({treeViewComponent}) => {
        return treeViewComponent;
    },
    (prevProps, nextProps) => {
        return true; // robimy ze zawsze true
    }
);
MemoizedTreeViewComponent.defaultProps = {
    treeViewComponent: undefined,
};

MemoizedTreeViewComponent.propTypes = {
    treeViewComponent: PropTypes.object.isRequired,
};

export default MemoizedTreeViewComponent;
