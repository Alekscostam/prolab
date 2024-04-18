import React from 'react';
import PropTypes from 'prop-types';
import Scheduler, {Resource, SchedulerTypes} from 'devextreme-react/scheduler';

const defaultViews = ['day', 'week', 'workWeek', 'month'];

export const SchedulerComponent = ({schedulerInfo, dataSource}) => {
    const {
        views,
        timeZone,
        defaultCurrentView,
        defaultCurrentDate,
        height,
        startDayHour,
        dateSerializationFormat,
        textExpr,
        startDateExpr,
        endDateExpr,
        allDayExpr,
        groups,
        remoteFiltering,
    } = schedulerInfo;

    return (
        <Scheduler
            id='scheduler'
            timeZone={timeZone}
            dataSource={dataSource}
            views={views === undefined ? defaultViews : views}
            defaultCurrentView={defaultCurrentView}
            defaultCurrentDate={defaultCurrentDate}
            height={height}
            groups={groups}
            startDayHour={startDayHour}
            endDayHour={endDateExpr}
            remoteFiltering={remoteFiltering}
            dateSerializationFormat={dateSerializationFormat}
            textExpr={textExpr}
            startDateExpr={startDateExpr}
            endDateExpr={endDateExpr}
            allDayExpr={allDayExpr}
        ></Scheduler>
    );
};

SchedulerComponent.defaultProps = {};

SchedulerComponent.propTypes = {
    schedulerInfo: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
};

export default SchedulerComponent;
