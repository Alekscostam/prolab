import React, { Component } from 'react';
// import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import InputCalendarComponent from './inputs/InputCalendarComponent';
import InputTextComponent from './inputs/InputTextComponent';
import InputTextareaComponent from './inputs/InputTextareaComponent';
import InputDropdownComponent from './inputs/InputDropdownComponent';
import InputFileUploadComponent from './inputs/InputFileUploadComponent';
import ActionLink from './ActionLink';
import ActionButton from './ActionButton';
import { DataTable } from 'primereact/datatable';
import InputPasswordComponent from './inputs/InputPasswordComponent';
import InputNumberComponent from './inputs/InputNumberComponent';
import InputCheckboxComponent from './inputs/InputCheckboxComponent';
class EditableDataTableExt extends Component {
	constructor(props, context) {
		super(props, context);
		this.handlePage = this.handlePage.bind(this);
		this.refreshTable = this.refreshTable.bind(this);
		this.onAfterAddElement = this.onAfterAddElement.bind(this);
		this.onAfterEditElement = this.onAfterEditElement.bind(this);
		this.onAfterRemoveElement = this.onAfterRemoveElement.bind(this);
		this.state = {
			addDialogVisible: false,
			list: [],
			addElement: {
				value: '',
				expiryDate: undefined,
			},
			loading: true,
			size: 0,
			first: 0,
			criteria: {
				firstResult: 0,
				maxResults: 10,
				sortField: 'id',
				sortAsc: true,
			},
		};
	}

	componentDidMount() {
		this.init();
	}

	init() {
		this.setState(
			{
				loading: true,
			},
			() => this.refreshTable()
		);
	}

	onAfterAddElement(lastPage) {
		const { lazy, onAfterAddElement } = this.props;
		const { criteria } = this.state;
		if (lazy) {
			// go to last page
			this.handlePage({
				rows: criteria.maxResults,
				first: lastPage * criteria.maxResults,
				page: lastPage,
				type: 'ADD',
			});
		}
		if (onAfterAddElement !== undefined && onAfterAddElement instanceof Function) {
			onAfterAddElement();
		}
	}

	onAfterEditElement() {
		const { lazy, onAfterEditElement } = this.props;
		if (lazy) {
			// this.refreshTable();
		}
		if (onAfterEditElement !== undefined && onAfterEditElement instanceof Function) {
			onAfterEditElement();
		}
	}

	onAfterRemoveElement(refreshTable) {
		const { lazy, onAfterRemoveElement } = this.props;
		const { criteria, first, size } = this.state;
		if (lazy) {
			if (first >= size - 1 && size > 0) {
				const lastPage = Math.ceil(size - 1 / criteria.maxResults) - 1;
				this.handlePage({
					rows: criteria.maxResults,
					first: lastPage * criteria.maxResults,
					page: lastPage,
					type: 'REMOVE',
				});
			} else if (refreshTable) {
				this.refreshTable();
			}
		}
		if (onAfterRemoveElement !== undefined && onAfterRemoveElement instanceof Function) {
			onAfterRemoveElement();
		}
	}

	handleAddElement() {
		const { addedListName, createNewElement, dataKey, lazy, name, onChange, stateField } = this.props;
		const { criteria, size } = this.state;
		const value = createNewElement();
		if (value[dataKey] === undefined) {
			value[dataKey] = uuid.v4();
		}
		let computedName = name;
		if (lazy) {
			computedName = addedListName;
		}
		const page = Math.floor(size / criteria.maxResults);
		onChange('EDITABLE_DATA_TABLE', ['ADD'], { name: computedName, value }, this.onAfterAddElement(page), stateField);
	}

	handleRemoveElement(rowData, deleted, permanent) {
		const { addedList, addedListName, dataKey, lazy, modifiedListName, name, onChange, stateField } = this.props;
		const { criteria, size } = this.state;
		if (lazy) {
			let found = false;
			let indexOfRemoved = -1;
			if (addedList !== undefined && addedList.length > 0) {
				addedList.forEach((el, i) => {
					if (el[dataKey] === rowData[dataKey]) {
						found = true;
						indexOfRemoved = i;
					}
				});
			}
			if (found) {
				const fromDbSize = size - addedList.length;
				const addedElementFirstPage = (fromDbSize % criteria.maxResults) + 1;
				let firstIndex = criteria.maxResults - addedElementFirstPage + 1;
				for (let i = criteria.maxResults - addedElementFirstPage; i < indexOfRemoved; i += criteria.maxResults) {
					firstIndex = i;
				}
				for (let i = firstIndex; i < addedList.length; i += criteria.maxResults) {
					addedList[i].page -= 1;
				}
				onChange(
					'EDITABLE_DATA_TABLE',
					['REMOVE', rowData, dataKey, deleted, true],
					{ name: addedListName },
					this.onAfterRemoveElement(true),
					stateField
				);
			} else {
				onChange(
					'EDITABLE_DATA_TABLE',
					['REMOVE_DB', rowData, dataKey, deleted, false],
					{ name: modifiedListName },
					this.onAfterRemoveElement,
					stateField
				);
			}
		} else {
			onChange('EDITABLE_DATA_TABLE', ['REMOVE', rowData, dataKey, deleted, permanent], { name }, this.onAfterRemoveElement, stateField);
		}
	}

	handleChange(name, rowData, field, inputType, parameters, event, onAfterStateChange, stateField) {
		const { addedList, addedListName, dataKey, lazy, modifiedListName, onChange } = this.props;
		const { criteria } = this.state;
		if (lazy) {
			let found = false;
			if (addedList !== undefined && addedList.length > 0) {
				addedList.forEach((el) => {
					if (el[dataKey] === rowData[dataKey]) {
						found = true;
					}
				});
			}
			if (found) {
				onChange(
					'EDITABLE_DATA_TABLE',
					['EDIT', rowData, dataKey, inputType, parameters, event, criteria.page],
					{ name: addedListName },
					this.onAfterEditElement,
					stateField
				);
			} else {
				onChange(
					'EDITABLE_DATA_TABLE',
					['EDIT_DB', rowData, dataKey, inputType, parameters, event, criteria.page],
					{ name: modifiedListName },
					this.onAfterEditElement,
					stateField
				);
			}
		} else {
			onChange('EDITABLE_DATA_TABLE', ['EDIT', rowData, dataKey, inputType, parameters, event], { name }, this.onAfterEditElement, stateField);
		}
	}

	inputText(editableFunction, field, header, placeholder, validators, rowData) {
		const { crossFieldValidation, dataKey, editable, name, stateField, validator, viewMode, editOnlyNew } = this.props;
		const id = field + rowData[dataKey];
		if (crossFieldValidation) {
			const crossValidators = crossFieldValidation(field, rowData);
			if (crossValidators) {
				validators += `|${crossValidators}`;
			}
		}

		return (
			<InputTextComponent
				id={id}
				name={field}
				label={header}
				value={rowData[field]}
				placeholder={placeholder}
				showLabel={false}
				insideTable
				rendered
				validator={validator}
				validators={validators}
				onChange={this.handleChange.bind(this, name, rowData, field)}
				stateField={stateField}
				//edytowanie tylko nowych jeżeli editOnlyNew = true
				viewMode={editOnlyNew ? (rowData.id === undefined ? 'EDIT' : 'VIEW') : editableFunction(rowData, editable) ? viewMode : 'VIEW'}
			/>
		);
	}

	inputPort(editableFunction, field, header, placeholder, validators, rowData) {
		const { crossFieldValidation, dataKey, editable, name, stateField, validator, viewMode, editOnlyNew } = this.props;
		const id = field + rowData[dataKey];
		if (crossFieldValidation) {
			const crossValidators = crossFieldValidation(field, rowData);
			if (crossValidators) {
				validators += `|${crossValidators}`;
			}
		}

		return (
			<InputNumberComponent
				id={id}
				name={field}
				label={header}
				value={rowData[field]}
				placeholder={placeholder}
				showLabel={false}
				insideTable
				rendered
				validator={validator}
				validators={validators}
				onChange={this.handleChange.bind(this, name, rowData, field)}
				stateField={stateField}
				//edytowanie tylko nowych jeżeli editOnlyNew = true
				viewMode={editOnlyNew ? (rowData.id === undefined ? 'EDIT' : 'VIEW') : editableFunction(rowData, editable) ? viewMode : 'VIEW'}
				min={0}
				max={65353}
				inputStyle={{ width: '100%' }}
			/>
		);
	}

	inputCheckbox(editableFunction, field, header, placeholder, validators, rowData) {
		const { crossFieldValidation, dataKey, editable, name, stateField, validator, viewMode, editOnlyNew } = this.props;
		const id = field + rowData[dataKey];
		if (crossFieldValidation) {
			const crossValidators = crossFieldValidation(field, rowData);
			if (crossValidators) {
				validators += `|${crossValidators}`;
			}
		}

		return (
			<InputCheckboxComponent
				id={id}
				name={field}
				label={header}
				value={rowData[field]}
				insideTable
				rendered
				showLabel={false}
				validator={validator}
				validators={validators}
				onChange={this.handleChange.bind(this, name, rowData, field)}
				stateField={stateField}
				//edytowanie tylko nowych jeżeli editOnlyNew = true
				viewMode={editOnlyNew ? (rowData.id === undefined ? 'EDIT' : 'VIEW') : editableFunction(rowData, editable) ? viewMode : 'VIEW'}
			/>
		);
	}

	inputPassword(editableFunction, field, header, placeholder, validators, rowData) {
		const { crossFieldValidation, dataKey, editable, name, stateField, validator, viewMode, editOnlyNew } = this.props;
		const id = field + rowData[dataKey];
		if (crossFieldValidation) {
			const crossValidators = crossFieldValidation(field, rowData);
			if (crossValidators) {
				validators += `|${crossValidators}`;
			}
		}

		return (
			<InputPasswordComponent
				id={id}
				name={field}
				label={header}
				value={rowData[field]}
				placeholder={placeholder}
				showLabel={false}
				insideTable
				rendered
				feedback={false}
				validator={validator}
				validators={validators}
				onChange={this.handleChange.bind(this, name, rowData, field)}
				stateField={stateField}
				//edytowanie tylko nowych jeżeli editOnlyNew = true
				viewMode={editOnlyNew ? (rowData.id === undefined ? 'EDIT' : 'VIEW') : editableFunction(rowData, editable) ? viewMode : 'VIEW'}
			/>
		);
	}

	inputTextArea(editableFunction, field, header, placeholder, validators, rowData) {
		const { crossFieldValidation, dataKey, editable, name, stateField, validator, viewMode } = this.props;
		const id = field + rowData[dataKey];
		if (crossFieldValidation) {
			const crossValidators = crossFieldValidation(field, rowData);
			if (crossValidators) {
				validators += `|${crossValidators}`;
			}
		}
		return (
			<InputTextareaComponent
				id={id}
				name={field}
				label={header}
				value={rowData[field]}
				placeholder={placeholder}
				showLabel={false}
				insideTable
				rendered
				validator={validator}
				validators={validators}
				onChange={this.handleChange.bind(this, name, rowData, field)}
				stateField={stateField}
				viewMode={editableFunction(rowData, editable) ? viewMode : 'VIEW'}
				autoResize
			/>
		);
	}

	inputCalendar(editableFunction, field, header, validators, rowData) {
		const { crossFieldValidation, dataKey, editable, name, stateField, validator, viewMode } = this.props;
		const id = field + rowData[dataKey];
		if (crossFieldValidation) {
			const crossValidators = crossFieldValidation(field, rowData);
			if (crossValidators) {
				validators += `|${crossValidators}`;
			}
		}
		return (
			<InputCalendarComponent
				id={id}
				name={field}
				label={header}
				value={rowData[field]}
				showLabel={false}
				insideTable
				rendered
				validator={validator}
				validators={validators}
				onChange={this.handleChange.bind(this, name, rowData, field)}
				stateField={stateField}
				viewMode={editableFunction(rowData, editable) ? viewMode : 'VIEW'}
			/>
		);
	}

	inputDropdown(editableFunction, field, header, placeholder, optionLabel, dataKeyDropdown, options, validators, renderTextField, textField, rowData) {
		const { crossFieldValidation, dataKey, editable, name, stateField, validator, viewMode } = this.props;
		const id = field + rowData[dataKey];
		if (crossFieldValidation) {
			const crossValidators = crossFieldValidation(field, rowData);
			if (crossValidators) {
				validators += `|${crossValidators}`;
			}
		}

		const additionalTextField = renderTextField && renderTextField(rowData[field]);
		return (
			<React.Fragment>
				<div className='row'>
					<div className={additionalTextField ? 'col-md-6' : 'col-md-12'}>
						<InputDropdownComponent
							id={id}
							name={field}
							label={header}
							value={rowData[field]}
							placeholder={placeholder}
							showLabel={false}
							insideTable
							rendered
							validator={validator}
							validators={validators}
							optionLabel={optionLabel}
							dataKey={dataKeyDropdown}
							options={options}
							showClear
							onChange={this.handleChange.bind(this, name, rowData, field)}
							stateField={stateField}
							viewMode={editableFunction(rowData, editable) ? viewMode : 'VIEW'}
							colClass='col-6'
						/>
					</div>
					{additionalTextField ? (
						<div className={additionalTextField ? 'col-md-6' : 'col-md-12'}>
							<InputTextComponent
								name={textField}
								label={header}
								showLabel={false}
								textFieldName
								colClass='col-md-6'
								value={rowData[textField]}
								stateField={`${stateField}`}
								viewMode={editableFunction(rowData, editable) ? viewMode : 'VIEW'}
								onChange={this.handleChange.bind(this, name, rowData, textField)}
								validator={validator}
								validators={validators}
								insideTable
							/>
						</div>
					) : null}
				</div>
			</React.Fragment>
		);
	}

	fileUploadEditor(editableFunction, field, fileList, header, restApiUrl, itemLabel, itemName, validators, viewMode, rowData) {
		const { dataKey, editable, messages, name, stateField, validator } = this.props;
		const id = field + rowData[dataKey];
		return (
			<InputFileUploadComponent
				id={id}
				name={field}
				label={header}
				fileList={rowData[fileList]}
				showLabel={false}
				insideTable
				restApiUrl={restApiUrl}
				multiple
				maxFileSize={1000000}
				// handleUpload={this.onUpload.bind(this, rowData, fileList, onUpload)}
				// handleRemove={this.onRemove.bind(this, rowData, fileList, onRemove)}
				onChange={this.handleChange.bind(this, name, rowData, field)}
				stateField={stateField}
				itemLabel={itemLabel} // 'originalFileName'
				itemName={itemName} // 'fileName'
				rendered
				validator={validator}
				validators={validators}
				viewMode={editableFunction(rowData, editable) ? viewMode : 'VIEW'}
				messages={messages}
			/>
		);
	}

	onUpload(rowData, varName, onUpload, event) {
		const varValue = JSON.parse(event.xhr.response);
		const modifiedList = rowData[varName].concat(varValue);
		onUpload(modifiedList, rowData, varName);
	}

	onRemove(rowData, varName, onRemove, e, i) {
		const modifiedList = rowData[varName];
		modifiedList.splice(i, 1);
		onRemove(modifiedList, rowData, varName);
	}

	actionTemplate(editableFunc, object) {
		const { editable, permanentDelete, showDeleteButtonFunction, showDeleteButtonFunctionLabel, showDeleteButtonOnlyNew } = this.props;
		const rowData = object.rowData;
		if ((showDeleteButtonOnlyNew && rowData.id === undefined) || !showDeleteButtonOnlyNew) {
			if (!!showDeleteButtonFunction && showDeleteButtonFunction(editable, rowData)) {
				return <span>{showDeleteButtonFunctionLabel}</span>;
			}
			if (rowData.deleted) {
				return (
					<ActionLink
						label={'COFNIJ'}
						handleClick={(e) => {
							e.preventDefault();
							this.handleRemoveElement(rowData, false, false);
						}}
						key={'remove-cancel-button'}
					/>
				);
			} else {
				return (
					<React.Fragment>
						<ActionLink
							label={'USUŃ'}
							handleClick={(e) => {
								e.preventDefault();
								this.handleRemoveElement(rowData, true, permanentDelete);
							}}
							key={'remove-button'}
						/>
					</React.Fragment>
				);
			}
		}
	}

	isEditable(editable) {
		return editable;
	}

	refreshTable() {
		const { dataKey, getList, modifiedList, objectId, updateItemElementAfterGetList, updateItemElementAfterEdit } = this.props;
		const { criteria } = this.state;
		if (objectId !== null && objectId !== undefined) {
			getList(objectId, criteria).then((data) => {
				if (data.content !== undefined) {
					data.content.forEach((element) => {
						if (updateItemElementAfterGetList) updateItemElementAfterGetList(element);
						if (modifiedList.get(element[dataKey]) !== null && modifiedList.get(element[dataKey]) !== undefined) {
							updateItemElementAfterEdit(element, modifiedList.get(element[dataKey]));
						}
					});
				}
				this.updateList(data.content, data.totalElements);
			});
		} else {
			this.updateList([], 0);
		}
	}

	updateList(contentList, totalElements) {
		const { addedList } = this.props;
		const { criteria } = this.state;
		const page = criteria.firstResult / criteria.maxResults + 1;
		const limit = criteria.maxResults;
		if (contentList === undefined) {
			contentList = [];
		}
		if (page * limit > totalElements) {
			if (page * limit - totalElements > limit) {
				contentList = contentList.concat(addedList.slice(page * limit - totalElements - limit, limit * page - totalElements));
			} else {
				contentList = contentList.concat(addedList.slice(0, page * limit - totalElements));
			}
		}
		this.setState({
			loading: false,
			list: contentList,
			size: totalElements + addedList.length,
		});
	}

	onSort(event) {
		this.setState(
			(prevState) => ({
				loading: true,
				criteria: {
					...prevState.criteria,
					sortField: event.sortField,
					sortAsc: event.sortOrder > 0 ? true : false,
				},
			}),
			() => this.refreshTable()
		);
	}

	handlePage(event) {
		const { criteria, size } = this.state;
		let newSize = size;
		if (event.type === 'ADD') {
			newSize += 1;
		} else if (event.type === 'REMOVE') {
			newSize -= 1;
		}
		const maxPage = Math.ceil(newSize / criteria.maxResults) - 1;
		let page = event.page;
		if (maxPage < event.page) {
			page = maxPage;
		}
		this.setState(
			(prevState) => ({
				loading: true,
				first: event.first,
				criteria: {
					...prevState.criteria,
					firstResult: page * event.rows,
					maxResults: event.rows,
				},
			}),
			() => this.refreshTable()
		);
	}

	render() {
		const {
			addButtonClassName,
			addButtonIconColor,
			addButtonIconName,
			addButtonIconSize,
			addButtonLabel,
			addButtonSize,
			addButtonVariant,
			className,
			columns,
			defaultRowsCount,
			selectionDataKey,
			editable,
			handleSelectionChange,
			headerColumnGroup,
			id,
			label,
			lazy,
			paginator,
			publicMode,
			rendered,
			selectable,
			selection,
			selectionMode,
			showAddButton,
			showDeleteButton,
			showLabel,
			value,
		} = this.props;
		let columnsWithAction = columns;
		if (selectionMode === 'multiple') {
			columnsWithAction = [
				{
					selectionMode: 'multiple',
				},
				...columnsWithAction,
			];
		}
		if (showDeleteButton) {
			columnsWithAction = [
				...columnsWithAction,
				{
					key: 'actions',
					header: 'Akcje',
					body: this.actionTemplate.bind(this),
					width: '100px',
				},
			];
		}
		const dynamicColumns = columnsWithAction.map((col) => {
			let editableFunc;
			if (col.editable && col.editable instanceof Function) {
				editableFunc = col.editable.bind(this, editable);
			} else {
				editableFunc = this.isEditable.bind(this, editable);
			}
			let body;
			if (col.editor === 'TEXT') {
				body = this.inputText.bind(this, editableFunc, col.field, col.header, col.placeholder, col.validators);
			} else if (col.editor === 'PASSWORD') {
				body = this.inputPassword.bind(this, editableFunc, col.field, col.header, col.placeholder, col.validators);
			} else if (col.editor === 'PORT') {
				body = this.inputPort.bind(this, editableFunc, col.field, col.header, col.placeholder, col.validators);
			} else if (col.editor === 'CHECKBOX') {
				body = this.inputCheckbox.bind(this, editableFunc, col.field, col.header, col.placeholder, col.validators);
			} else if (col.editor === 'TEXTAREA') {
				body = this.inputTextArea.bind(this, editableFunc, col.field, col.header, col.placeholder, col.validators);
			} else if (col.editor === 'CALENDAR') {
				body = this.inputCalendar.bind(this, editableFunc, col.field, col.header, col.validators);
			} else if (col.editor === 'DROPDOWN') {
				body = this.inputDropdown.bind(
					this,
					editableFunc,
					col.field,
					col.header,
					col.placeholder,
					col.optionLabel,
					col.dataKey,
					col.options,
					col.validators,
					col.renderTextField,
					col.textFieldName
				);
			} else if (col.editor === 'FILEULOAD') {
				body = this.fileUploadEditor.bind(
					this,
					editableFunc,
					col.field,
					col.fileList,
					col.header,
					col.restApiUrl,
					col.itemLabel,
					col.itemName,
					col.validators,
					editable ? 'EDIT' : 'VIEW'
				);
				col.colClassName = 'file-upload-column';
			} else if (col.selectionMode === 'multiple') {
				return <Column key='selection-column' selectionMode='multiple' headerStyle={{ width: '3em' }}></Column>;
			} else if (col.body instanceof Function) {
				body = col.body; // .bind(this, editableFunc);
			} else {
				body = col.body;
			}
			return (
				<Column
					key={col.key ? col.key : col.field}
					field={col.field}
					header={col.header}
					body={body}
					className={`${col.className} ${col.colClassName}`}
					sortable={col.sortable}
					style={col.width !== undefined ? { width: col.width } : null}
				/>
			);
		});

		if (rendered && !lazy) {
			return (
				<div className={className}>
					{showLabel ? (
						<label className='p-label' htmlFor={id} style={{ width: '100%' }}>
							{label}
						</label>
					) : null}
					<DataTable
						id={id}
						key='data-table'
						className='ade-table'
						emptyMessage='Brak rekordów do wyświetlenia'
						responsive
						value={value}
						selection={selection}
						onSelectionChange={handleSelectionChange}
						dataKey={selectionDataKey}
						headerColumnGroup={headerColumnGroup}
						paginator={paginator}
						rows={paginator ? defaultRowsCount : undefined}
						rowsPerPageOptions={[5, 10, 20, 50, 100]}
						paginatorPosition='both'
						paginatorTemplate='RowsPerPageDropdown PageLinks'>
						{dynamicColumns}
					</DataTable>
					<ActionLink
						key='add-link'
						className={addButtonClassName}
						rendered={showAddButton && !publicMode}
						label={addButtonLabel}
						size={addButtonSize}
						variant={addButtonVariant}
						handleClick={() => {
							this.handleAddElement();
						}}
						iconColor={addButtonIconColor}
						iconName={addButtonIconName}
						iconSize={addButtonIconSize}
						iconSide='left'
					/>
					<ActionButton
						key='add-button'
						className={addButtonClassName}
						rendered={showAddButton && publicMode}
						label={addButtonLabel}
						size={addButtonSize}
						variant={addButtonVariant}
						handleClick={() => {
							this.handleAddElement();
						}}
						iconColor={addButtonIconColor}
						iconName={addButtonIconName}
						iconSize={addButtonIconSize}
						iconSide='left'
					/>
				</div>
			);
		} else if (rendered && lazy) {
			const { criteria, first, list, loading, size } = this.state;
			return (
				<div className={className}>
					{showLabel ? (
						<label className='p-label' htmlFor={id} style={{ width: '100%' }}>
							{label}
						</label>
					) : null}
					<DataTable
						id={id}
						key='data-table'
						className='ade-table'
						emptyMessage='Brak rekordów do wyświetlenia'
						responsive
						value={list}
						selectable={selectable}
						selection={selection}
						selectionMode={selectionMode}
						onSelectionChange={handleSelectionChange}
						headerColumnGroup={headerColumnGroup}
						paginator
						rows={criteria.maxResults}
						totalRecords={size}
						dataKey={selectionDataKey}
						lazy
						first={first}
						onPage={this.handlePage}
						onSort={(e) => this.onSort(e)}
						sortField={criteria.sortField}
						sortOrder={criteria.sortAsc === true ? 1 : -1}
						loading={loading}
						rowsPerPageOptions={[5, 10, 20, 50, 100]}
						paginatorPosition='both'
						paginatorTemplate='RowsPerPageDropdown PageLinks'>
						{dynamicColumns}
					</DataTable>
					<ActionLink
						key='add-link'
						className={addButtonClassName}
						rendered={showAddButton && !publicMode}
						label={addButtonLabel}
						size={addButtonSize}
						variant={addButtonVariant}
						handleClick={() => {
							this.handleAddElement();
						}}
						iconColor={addButtonIconColor}
						iconName={addButtonIconName}
						iconSize={addButtonIconSize}
						iconSide='left'
					/>
					<ActionButton
						key='add-button'
						className={addButtonClassName}
						rendered={showAddButton && publicMode}
						label={addButtonLabel}
						size={addButtonSize}
						variant={addButtonVariant}
						handleClick={() => {
							this.handleAddElement();
						}}
						iconColor={addButtonIconColor}
						iconName={addButtonIconName}
						iconSize={addButtonIconSize}
						iconSide='left'
					/>
				</div>
			);
		} else {
			return null;
		}
	}
}

EditableDataTableExt.defaultProps = {
	addButtonLabel: '+ Dodaj',
	addButtonSize: 'normal',
	addButtonVariant: 'dark',
	addedList: [],
	className: 'row',
	defaultRowsCount: 5,
	showLabel: false,
	editable: false,
	lazy: false,
	modifiedList: new Map(),
	objectId: null,
	paginator: false,
	permanentDelete: false,
	publicMode: false,
	showAddButton: false,
	showDeleteButton: false,
	showDeleteButtonOnlyNew: false,
	selectable: false,
	selectionMode: 'single',
	selection: {},
	rendered: true,
	viewMode: 'VIEW',
	editOnlyNew: false,
};

EditableDataTableExt.propTypes = {
	addButtonClassName: PropTypes.string,
	addButtonIconColor: PropTypes.string,
	addButtonIconName: PropTypes.string,
	addButtonIconSize: PropTypes.string,
	addButtonLabel: PropTypes.string,
	addButtonSize: PropTypes.string,
	addButtonVariant: PropTypes.string,
	addedList: PropTypes.array, // wymagane gdy lazy jest true
	addedListName: PropTypes.string, // wymagane gdy lazy jest true
	className: PropTypes.string,
	columns: PropTypes.array.isRequired,
	createNewElement: PropTypes.func, // wymagane gdy showAddButton jest true
	crossFieldValidation: PropTypes.func,
	dataKey: PropTypes.string, // wymagane gdy editable jest true
	defaultRowsCount: PropTypes.number,
	editable: PropTypes.bool,
	getList: PropTypes.func, // wymagane gdy lazy jest true
	handleSelectionChange: PropTypes.func, // wymagane gdy selectable jest true
	headerColumnGroup: PropTypes.any,
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	lazy: PropTypes.bool,
	messages: PropTypes.any,
	modifiedList: PropTypes.instanceOf(Map), // wymagane gdy lazy jest true
	modifiedListName: PropTypes.string, // wymagane gdy lazy jest true
	name: PropTypes.string, // wymagane gdy editable jest true
	objectId: PropTypes.any,
	onAfterAddElement: PropTypes.func,
	onAfterEditElement: PropTypes.func,
	onAfterRemoveElement: PropTypes.func,
	onChange: PropTypes.func, // wymagane gdy editable jest true
	paginator: PropTypes.bool,
	permanentDelete: PropTypes.bool, // ignorowane gdy lazy jest true
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	selectable: PropTypes.bool,
	selection: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	selectionDataKey: PropTypes.string,
	selectionMode: PropTypes.string, // wymagane gdy selectable jest true
	showAddButton: PropTypes.bool,
	showDeleteButton: PropTypes.bool,
	showDeleteButtonFunction: PropTypes.func,
	showDeleteButtonFunctionLabel: PropTypes.string,
	showDeleteButtonOnlyNew: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string, // wymagane gdy editable jest true
	updateItemElementAfterEdit: PropTypes.func, // wymagane gdy lazy jest true
	updateItemElementAfterGetList: PropTypes.func, // wymagane gdy lazy jest true
	validator: PropTypes.object,
	value: PropTypes.array, // wymagane gdy lazy jest false
	viewMode: PropTypes.string.isRequired,
	editOnlyNew: PropTypes.bool,
};

export default EditableDataTableExt;
