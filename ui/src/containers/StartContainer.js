import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import CustomMessages from '../components/CustomMessages';
import DivContainer from '../components/DivContainer';
import BlockUi from '../components/waitPanel/BlockUi';

function DynamicCard(data, handleClick) {
    return <React.Fragment>
        {data.data?.map(data => {
            return (
                <div className="card">
                    <div className="card-header">{data.title}</div>
                    <div className="card-body">
                        <h5 className="card-title">{data.subtitle}</h5>
                        <a onClick={(e) => handleClick(e, data.id)}>
                            <p className="card-text">{data.content}</p>
                        </a>
                    </div>
                </div>
            )
        })}
    </React.Fragment>
}

class StartContainer extends BaseContainer {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            loading: false,
            list: [],
            coordinate: 0,
            dynamicData: [
                {
                    id: 1,
                    title: "Laboratorium R&D Katowice",
                    subtitle: "P1/G.C./2020",
                    content: "Badanie wpływu związków klasy X na zmniejszenie emisji substancji szkodliwych do środowiska, zawartych w ściekach zakładów produkcyjnych"
                },
                {
                    id: 2,
                    title: "Laboratorium R&D Katowice",
                    subtitle: "NESE PBS1/A1/1/2020",
                    content: "Zmiana składu chemicznego produktu X – dostosowanie do obecnie obowiązujących przepisów prawnych"
                },
                {
                    id: 3,
                    title: "Laboratorium R&D Katowice",
                    subtitle: "NESE PBS1/A1/2/2020",
                    content: "Opracowanie farby do włosów w kolorze „truskawkowy blond"
                },
            ]
        };

    }

    render() {
        return (
            <DivContainer colClass='dashboard'>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <CustomMessages ref={(el) => (this.messages = el)}/>
                    {this.state.loading ? null : (
                        <form onSubmit={this.handleFormSubmit} onClick={this.handleClick} noValidate>
                            {this.renderDetails()}
                        </form>
                    )}
                </BlockUi>
            </DivContainer>
        );
    }

    handleClick = (e, params) => {
        e.preventDefault();
        alert('cze')
    }

    renderDetails() {
        return (
            <React.Fragment>
                <DivContainer colClass='col-12 dashboard-link-container'>
                    <DivContainer colClass='row'>
                        <div className="font-medium mb-4">Twoje projekty</div>
                    </DivContainer>
                    <DivContainer colClass='card-deck'>
                        <DynamicCard data={this.state.dynamicData} handleClick={this.handleClick}/>
                    </DivContainer>
                </DivContainer>
            </React.Fragment>
        );
    }
}

export default StartContainer;
