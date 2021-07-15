import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DivContainer from "../components/DivContainer";
//
//    https://material-table.com/#/docs
//
import {ViewParserUtils} from "../utils/parser/ViewParserUtils";
import {exampleView1, exampleViewData1} from "../utils/mock-data/StaticData";
import {ViewDataParserUtils} from "../utils/parser/ViewDataParserUtils";
import DataGrid, {
    Scrolling,
    RemoteOperations,
    Column,
    Grouping,
    GroupPanel,
    Summary,
    GroupItem
} from 'devextreme-react/data-grid';


export class GridContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parsedView: {},
            parsedViewData: {},
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
                        <DataGrid
                            elementAttr={{
                                id: 'gridContainer'
                            }}

                            showBorders={true}
                            wordWrapEnabled={true}
                        >
                            <RemoteOperations groupPaging={true}/>
                            <Scrolling mode="standard"/>
                            <Grouping autoExpandAll={false}/>
                            <GroupPanel visible={true}/>

                            <Column dataField="Id" dataType="number" width={75}/>
                            <Column dataField="ProductSubcategoryName" caption="Subcategory" width={150}/>
                            <Column dataField="StoreName" caption="Store" width={150} groupIndex={0}/>
                            <Column dataField="ProductCategoryName" caption="Category" width={120} groupIndex={1}/>
                            <Column dataField="ProductName" caption="Product"/>
                            <Column dataField="DateKey" caption="Date" dataType="date" format="yyyy-MM-dd" width={100}/>
                            <Column dataField="SalesAmount" caption="Amount" format="currency" width={100}/>

                            <Summary>
                                <GroupItem
                                    column="Id"
                                    summaryType="count"/>
                            </Summary>
                        </DataGrid>
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