import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import CustomMessages from '../components/CustomMessages';
import DivContainer from '../components/DivContainer';
import BlockUi from '../components/waitPanel/BlockUi';
//
//    https://material-table.com/#/docs
//
import MaterialTable from "material-table";
import {
    AddBox, ArrowDownward,
    Check, ChevronLeft,
    ChevronRight,
    Clear,
    DeleteOutline,
    Edit,
    FilterList,
    FirstPage, LastPage, Remove,
    SaveAlt, Search, ViewColumn
} from "@material-ui/icons";
import {forwardRef} from 'react';

class TableContainer extends BaseContainer {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            list: [],
            coordinate: 0
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


    renderDetails() {
        const tableIcons = {
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
        };

        return (
            <React.Fragment>
                <DivContainer colClass='col-12 dashboard-link-container'>
                    <DivContainer colClass='row'>
                        <div className="font-medium mb-4">Twoje projekty</div>
                    </DivContainer>
                    <DivContainer colClass='card-deck'>
                        <MaterialTable
                            icons={tableIcons}
                            title=""
                            columnResizable={true}
                            columns={[
                                {title: 'Numer', field: 'number', width: '4', resizable: true},
                                {title: 'Nazwa', field: 'name'},
                                {title: 'Status', field: 'status'},
                                {title: 'Rodzaj', field: 'sort'},
                                {title: 'Opis', field: 'desc'},
                                {title: 'Cele', field: 'target'},
                                {title: 'Start', field: 'start'},
                                {title: 'Koniec', field: 'end'},
                            ]}
                            options={{
                                filtering: true,
                                grouping: true,
                                sorting: true,
                                selection: true,
                                rowStyle: rowData => ({
                                    fontFamily: 'Roboto',
                                    fontSize: '12px',
                                    color: '#182D67',
                                    fontWeight:600
                                })
                            }}
                            data={[
                                {
                                    number: 'P1/G.C./2020',
                                    name: 'Badanie wpływu związków klasy X na zmniejszenie emisji substancji szkodliwych do środowiska, zawartych w ściekach zakładów produkcyjnych',
                                    status: 'Roboczy',
                                    sort: 'Surowce',
                                    desc: "W skutek wejścia w życie ROZPORZĄDZENIA MINISTRA ZDROWIA z dnia X.Z r. zmieniającego rozporządzenie w sprawie list substancji niedozwolonych lub dozwolonych z ograniczeniami do stosowania w kosmetykach oraz znaków graficznych umieszczanych na opakowaniach kosmetyków, siarczan 2,2’-[ (4-aminofenylo) imino]bis(etanolu) nie może być używany z systemami 23, 34",
                                    target: "Zakres wymaganej specyfikacji poszczególnych parametrów zamieszczono w wymaganiach. Dodatkowym celem jest brak podwyżki kosztów produkcji produktów lub obniżenie tych kosztów.",
                                    start: "2017-01-01",
                                    end: "2018-01-01"
                                },
                                {
                                    number: 'NESE PBS1/A1/1/2020',
                                    name: 'Zmiana składu chemicznego produktu X – dostosowanie do obecnie obowiązujących przepisów prawnych',
                                    status: 'Roboczy',
                                    sort: 'Surowce',
                                    desc: "W skutek wejścia w życie ROZPORZĄDZENIA MINISTRA ZDROWIA z dnia X.Z r. zmieniającego rozporządzenie w sprawie list substancji niedozwolonych lub dozwolonych z ograniczeniami do stosowania w kosmetykach oraz znaków graficznych umieszczanych na opakowaniach kosmetyków, siarczan 2,2’-[ (4-aminofenylo) imino]bis(etanolu) nie może być używany z systemami 23, 34",
                                    target: "Zakres wymaganej specyfikacji poszczególnych parametrów zamieszczono w wymaganiach. Dodatkowym celem jest brak podwyżki kosztów produkcji produktów lub obniżenie tych kosztów.",
                                    start: "2017-01-01",
                                    end: "2018-01-01"
                                },
                                {
                                    number: 'NESE PBS1/A1/2/2020',
                                    name: 'Opracowanie farby do włosów w kolorze „truskawkowy blond',
                                    status: 'Roboczy',
                                    sort: 'Surowce',
                                    desc: "Analiza rynku potwierdziła potrzebę dodania nowego koloru do gamy produktów producenta. Na rynku istnieją podobne produkty innych marek (KK, BB, XX, HH) i cieszą się popularnością wśród klientów w wieku 15-38 lat. Projekt zakłada, że bazą nowego produktu będzie jeden z kolorów dostępnych w produktach firmy, o właściwościach zbliżonych do opisywanego. Modyfikacj",
                                    target: "—",
                                    start: "2017-01-01",
                                    end: "2018-01-01"
                                },
                            ]}
                        />
                    </DivContainer>
                </DivContainer>
            </React.Fragment>
        );
    }
}

export default TableContainer;
