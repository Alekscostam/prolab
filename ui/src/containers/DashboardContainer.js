import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import DivContainer from '../components/DivContainer';
import BlockUi from '../components/waitPanel/BlockUi';
import {Toast} from "primereact/toast";
import DashboardService from "../services/DashboardService";
import ViewService from "../services/ViewService";
import DataGridStore from "./dao/DataGridStore";
import {GridViewContainer} from "./GridViewContainer";
import CardViewComponent from "./cardView/CardViewComponent";
import {Breadcrumb} from "../utils/BreadcrumbUtils";

class DashboardContainer extends BaseContainer {

    constructor(props) {
        super(props);
        this.viewService = new ViewService();
        this.dashboardService = new DashboardService();
        this.dataGridStore = new DataGridStore();
        this.state = {
            loading: true
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.dashboardService
            .getDashboard()
            .then((dashboardResponse) => {
                this.setState({
                    dashboard: dashboardResponse,
                    loading: false
                });
                this.unblockUi();
            }).catch((err) => {
            if (!!err.error) {
                this.showResponseErrorMessage(err);
            } else {
                this.showErrorMessages(err);
            }
        });
    }

    render() {
        const {labels} = this.props;
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => this.messages = el}/>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <DivContainer colClass='col-12 dashboard-link-container'>
                        {Breadcrumb.render(labels)}
                        <DivContainer colClass='dashboard'>
                            {this.state.loading === false ? (this.renderContent()) : null}
                        </DivContainer>
                    </DivContainer>
                </BlockUi>
            </React.Fragment>
        );
    }

    renderContent() {
        let cardView = {
            viewInfo: this.state.dashboard.viewInfo,
            cardOptions: this.state.dashboard.headerOptions,
            cardHeader: this.state.dashboard.headerFields.cardHeader,
            cardImage: this.state.dashboard.headerFields.cardImage,
            cardBody: this.state.dashboard.headerFields.cardBody,
            cardFooter: this.state.dashboard.headerFields.cardFooter,
            operations: this.state.dashboard.headerOperations,
            shortcutButtons: [], documentsList: [], pluginsList: [], batchesList: [], filtersList: []
        }
        let cardWidth = cardView.cardOptions?.width - 10;
        let cardHeight = cardView.cardOptions?.height + 30;
        return <React.Fragment>
            <div className="rows">
                <div className="column left" style={{width: cardWidth, height: cardHeight}}>
                    <CardViewComponent
                        mode='dashboard'
                        handleOnInitialized={(ref) => this.cardGrid = ref}
                        parsedGridView={cardView}
                        parsedCardViewData={this.state.dashboard.headerData}
                        handleShowEditPanel={() => this.setState({visibleEditPanel: true})}/>
                    {this.state.dashboard.views.filter(item => item.position == 'left').map((item) => {
                        return (
                            <React.Fragment>
                                <div className='panel-dashboard'>
                                    <div className='title-dashboard'> {item.label}</div>
                                    <GridViewContainer id={item.id}
                                                       key={item.id}
                                                       subViewId={undefined}
                                                       recordId={undefined}
                                                       filterId={undefined}
                                                       viewType={'dashboard'}
                                                       showColumnLines={false}
                                                       showRowLines={true}
                                                       showBorders={false}
                                                       showColumnHeaders={false}
                                                       showFilterRow={false}
                                                       showSelection={false}
                                    >
                                    </GridViewContainer>
                                </div>
                            </React.Fragment>
                        )
                    })}
                </div>
                <div className="column right">
                    {this.state.dashboard.views.filter(item => item.position == 'right').map((item) => {
                        return (
                            <React.Fragment>
                                <div className='panel-dashboard'>
                                    <div className='title-dashboard'> {item.label}</div>
                                    <GridViewContainer id={item.id}
                                                       key={item.id}
                                                       subViewId={undefined}
                                                       recordId={undefined}
                                                       filterId={undefined}
                                                       viewType={'dashboard'}
                                                       showColumnLines={false}
                                                       showRowLines={true}
                                                       showBorders={false}
                                                       showColumnHeaders={false}
                                                       showFilterRow={false}
                                                       showSelection={false}>
                                    </GridViewContainer>
                                    </div>
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
        </React.Fragment>;
    }

    renderDetails() {
        return (
            <React.Fragment>
            </React.Fragment>
        );
    }
}

export default DashboardContainer;
