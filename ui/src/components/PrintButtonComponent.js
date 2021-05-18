import React, { Component } from 'react';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ActionButton } from '../components/ActionButton';
import { Menu } from 'primereact/menu';
import $ from 'jquery';
export class PrintButtonComponent extends Component {
    constructor(props) {
        super(props);
        const items = [];
        if (props.pdf === true) {
            items.push({
                label: 'PDF',
                icon: 'pi',
                command: e => this.handlePrint('pdf', e),
            });
        }
        if (props.xlsx === true) {
            items.push({
                label: 'XLSX',
                icon: 'pi',
                command: e => this.handlePrint('xlsx', e),
            });
        }
        if (props.xls === true) {
            items.push({
                label: 'XLS',
                icon: 'pi',
                command: e => this.handlePrint('xls', e),
            });
        }
        if (props.csv) {
            items.push({
                label: 'CSV',
                icon: 'pi',
                command: e => this.handlePrint('csv', e),
            });
        }
        this.state = {
            items,
        };
        this.menuRef = React.createRef();
        this.handlePrint = this.handlePrint.bind(this);
    }

    componentDidMount() {
        // eslint-disable-next-line no-undef
        $('a.p-menuitem-link').removeAttr('href');
    }

    componentDidUpdate() {
        // eslint-disable-next-line no-undef
        // if ($ !== undefined) {
        // 	$('a.p-menuitem-link').removeAttr('href');
        // }
    }

    onButtonClick(event) {
        if (event) {
            event.preventDefault();
        }
        this.menuRef.current.toggle(event);
    }

    handlePrint(format, event) {
        console.log('handlePrint, format:', format);
        if (event) {
            event.originalEvent.preventDefault();
        }
        const { reportFileNameBase, generateReport } = this.props;
        if (generateReport) {
            generateReport(format);
        }
    }

    render() {
        const { items } = this.state;
        return (
            <React.Fragment>
                <Menu model={items} popup ref={this.menuRef} appendTo={document.body} />
                <ActionButton
                    label={this.props.label ? this.props.label : 'Pobierz'}
                    iconName="mdi-download"
                    iconSide="left"
                    iconColor="white"
                    downloadFile
                    handleClick={this.onButtonClick.bind(this)}
                    rendered
                />
            </React.Fragment>
        );
    }
}

PrintButtonComponent.defaultProps = {
    csv: true,
    pdf: true,
    xlsx: true,
    xls: true,
    reportFileNameBase: 'raport',

};

PrintButtonComponent.propTypes = {
    csv: PropTypes.bool,
    className: PropTypes.string,
    generateReport: PropTypes.func.isRequired,
    label: PropTypes.string,
    pdf: PropTypes.bool,
    reportFileNameBase: PropTypes.string,
    xlsx: PropTypes.bool,
};