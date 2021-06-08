import React, {Component, forwardRef} from 'react';
import PropTypes from 'prop-types';
import DivContainer from "../components/DivContainer";
//
//    https://material-table.com/#/docs
//
import {
    AddBox,
    ArrowDownward,
    Check,
    ChevronLeft,
    ChevronRight,
    Clear,
    DeleteOutline,
    Edit,
    FilterList,
    FirstPage,
    LastPage,
    Remove,
    SaveAlt,
    Search,
    ViewColumn
} from "@material-ui/icons";
import {ViewParserUtils} from "../utils/parser/ViewParserUtils";
import {exampleView1, exampleViewData1} from "../utils/mock-data/StaticData";
import {ViewDataParserUtils} from "../utils/parser/ViewDataParserUtils";
import MaterialTable from "../components/prolab/material-table/material-table";

export class GridContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parsedView: {},
            parsedViewData: {},
            tableIcons: {
                Add: forwardRef((props, ref) => <AddBox {...props} ref={ref}/>),
                Check: forwardRef((props, ref) => <Check {...props} ref={ref}/>),
                Clear: forwardRef((props, ref) => <Clear {...props} ref={ref}/>),
                Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref}/>),
                DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref}/>),
                Edit: forwardRef((props, ref) => <Edit {...props} ref={ref}/>),
                Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref}/>),
                Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref}/>),
                FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref}/>),
                LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref}/>),
                NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref}/>),
                PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref}/>),
                ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref}/>),
                Search: forwardRef((props, ref) => <Search {...props} ref={ref}/>),
                SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref}/>),
                ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref}/>),
                ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref}/>)
            }
        }
    }

    componentDidMount() {
        this.setState({parsedView: ViewParserUtils.parse(exampleView1)})
        this.setState({parsedViewData: ViewDataParserUtils.parse(exampleViewData1)})
    }

    render() {
        let gridColumnsArray = ViewParserUtils.parse(exampleView1).gridColumns;
        const columns = gridColumnsArray[0].columns.map((c) => {
            return {title: c.fieldName, field: 'number'}
        })
        return (
            <React.Fragment>
                <DivContainer colClass='col-12 dashboard-link-container'>
                    <DivContainer colClass='row'>
                        <div className="font-medium mb-4">Twoje projekty</div>
                    </DivContainer>
                    <DivContainer colClass='card-deck'>
                        <MaterialTable
                            icons={this.state.tableIcons}
                            title=""
                            columnResizable={true}
                            columns={columns}
                            options={{
                                filtering: true,
                                grouping: true,
                                sorting: true,
                                selection: true,
                                rowStyle: rowData => ({
                                    fontFamily: 'Roboto',
                                    fontSize: '12px',
                                    color: '#182D67',
                                    fontWeight: 600
                                })
                            }}
                            data={this.state.parsedViewData?.data}
                        />
                    </DivContainer>
                </DivContainer>
            </React.Fragment>
        );
    }
}

GridContainer.defaultProps = {
    data: {}
};

GridContainer.propTypes = {
    data: PropTypes.object.isRequired,
};