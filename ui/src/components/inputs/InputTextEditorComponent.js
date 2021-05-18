/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/no-danger */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from 'sanitize-html-react';
import DomHandler from 'primereact/components/utils/DomHandler';
import { Editor } from 'primereact/editor';
import $ from 'jquery';

export const FORMATS = ['header', 'font', 'background', 'color', 'code', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'script', 'align', 'direction', 'link', 'image', 'code-block', 'formula', 'video'];

class InputTextEditorComponent extends Component {
	constructor(props) {
		super(props);
		this.editorRef = React.createRef();
		this.state = {};
		this.sanitizeOptions = {
			allowedTags: [
				'br',
				'p',
				'ol',
				'li',
				'ul',
				'em',
				'strong',
				'span',
				'a',
				// 'pre',
				'h1',
				'h2',
				// 'sub',
				// 'sup',
				'img',
				'blockquote',
			],
			allowedAttributes: {
				p: ['class', 'style'],
				ol: ['class', 'style'],
				li: ['class', 'style'],
				ul: ['class', 'style'],
				em: ['class', 'style'],
				strong: ['class', 'style'],
				span: ['class', 'style'],
				a: ['class', 'style', 'href', 'target'],
				// pre: ['class', 'style'],
				h1: ['class', 'style'],
				h2: ['class', 'style'],
				// sub: ['class', 'style'],
				// sup: ['class', 'style'],
				img: ['class', 'style', 'src'],
				blockquote: ['class', 'style'],
			},
		};
	}

	componentDidMount() {
		this.updateTextValue();
		const { editorRef, id, label, showLabel } = this.props;
		// eslint-disable-next-line no-undef
		$(`div#${id} div.ql-editor`).attr('aria-label', `${label}`);
		// eslint-disable-next-line no-undef
		$(`div#${id} div.ql-editor`).attr('aria-labelledby', `${label === undefined && showLabel ? `${id}-label-id` : undefined}`);
		// eslint-disable-next-line no-undef
		$(`div#${id} div.ql-editor`).attr('aria-describedby', `${id}-error`);
		const ref = editorRef ? editorRef : this.editorRef;
		if (ref !== undefined && ref !== null && ref.current !== undefined && ref.current !== null && ref.current.quill !== undefined) {
			ref.current.quill.keyboard.bindings[9] = [
				{
					key: 9,
					handler() {
						return true;
					},
				},
			];
			this.applyAccessibilityHacks(ref.current.quill);
		}
	}

	renderView() {
		const { colClass, disabled, editorRef, formats, id, label, name, publicMode, showLabel, value, validateViewMode, validator, validators } = this.props;
		let valueString = '';
		if (value !== undefined && value !== null) {
			valueString = value;
		}
		const ref = editorRef ? editorRef : this.editorRef;
		const header = this.prepareEmptyHeaderTemplate();
		const sanitizedValue = sanitizeHtml(valueString, this.sanitizeOptions);
		return publicMode ? (
			<div className='input_easy_label row pl-0'>
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className='easy_label col-lg-2 col-md-3' htmlFor={id}>
						{label}
					</label>
				) : null}
				<div className='col-md-5'>
					<Editor
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						className='no-toolbar'
						key={id}
						id={id}
						ref={ref}
						name={name}
						style={{ width: '100%' }}
						value={sanitizedValue}
						onTextChange={null}
						onSelectionChange={null}
						formats={formats}
						headerTemplate={header}
						disabled={disabled}
						readOnly
					/>
					{validateViewMode && validator ? validator.message(id, label, sanitizedValue, validators) : null}
				</div>
			</div>
		) : (
			<div className={colClass}>
				<div className='row'>
					<div className='col-md-12 form-group'>
						{label !== undefined && showLabel ? (
							<label id={`${id}-label-id`} className='p-label' htmlFor={id} style={{ width: '100%' }}>
								{label}
							</label>
						) : null}
						<Editor
							ariaLabel={label}
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							className='no-toolbar'
							key={id}
							id={id}
							ref={ref}
							name={name}
							style={{ width: '100%' }}
							value={sanitizedValue}
							onTextChange={null}
							onSelectionChange={null}
							formats={formats}
							headerTemplate={header}
							disabled={disabled}
							readOnly
						/>
						{validateViewMode && validator ? validator.message(id, label, sanitizedValue, validators) : null}
					</div>
				</div>
			</div>
		);
	}

	prepareEmptyHeaderTemplate() {
		return <div className='ql-toolbar ql-snow' />;
	}

	prepareDefaultHeaderTemplate() {
		const header = (
			<div className='ql-toolbar ql-snow'>
				<span className='ql-formats'>
					<button className='ql-bold' aria-label='Pogrubienie' />
					<button className='ql-italic' aria-label='Kursywa' />
					<button className='ql-underline' aria-label='Podkreślenie' />
					<button className='ql-strike' aria-label='Przekreślenie' />
				</span>

				<span className='ql-formats'>
					<button type='button' className='ql-blockquote' aria-label='Cytowanie' />
				</span>

				<span className='ql-formats'>
					<button type='button' className='ql-header' value='1' aria-label='Nagłówek poziom 1' />
					<button type='button' className='ql-header' value='2' aria-label='Nagłówek poziom 2' />
				</span>

				<span className='ql-formats'>
					<button type='button' className='ql-list' value='ordered' aria-label='Lista numerowana' />
					<button type='button' className='ql-list' value='bullet' aria-label='Wypunktowanie' />
				</span>

				{/* <span className="ql-formats">
					<button type="button" className="ql-script" value="sub" aria-label="" />
					<button type="button" className="ql-script" value="super" aria-label="" />
				</span> */}

				<span className='ql-formats'>
					<button type='button' className='ql-indent' value='-1' aria-label='Zmniejsz wcięcie' />
					<button type='button' className='ql-indent' value='+1' aria-label='Zwiększ wcięcie' />
				</span>
				<span className='ql-formats'>
					<select className='ql-size'>
						<option value='10px' aria-label='Rozmiar czcionki mały'>
							Mały
						</option>
						<option selected aria-label='Rozmiar czcionki normalny'>
							Normalny
						</option>
						<option value='18px' aria-label='Rozmiar czcionki duży'>
							Duży
						</option>
						<option value='32px' aria-label='Rozmiar czcionki ogromny'>
							Ogromny
						</option>
					</select>
				</span>

				<span className='ql-formats'>
					<select className='ql-color' aria-label='Kolor tekstu'>
						<option value='#000000' selected='selected' />
						<option value='#e60000' />
						<option value='#ff9900' />
						<option value='#ffff00' />
						<option value='#008a00' />
						<option value='#0066cc' />
						<option value='#9933ff' />
						<option value='#ffffff' />
						<option value='#facccc' />
						<option value='#ffebcc' />
						<option value='#ffffcc' />
						<option value='#cce8cc' />
						<option value='#cce0f5' />
						<option value='#ebd6ff' />
						<option value='#bbbbbb' />
						<option value='#f06666' />
						<option value='#ffc266' />
						<option value='#ffff66' />
						<option value='#66b966' />
						<option value='#66a3e0' />
						<option value='#c285ff' />
						<option value='#888888' />
						<option value='#a10000' />
						<option value='#b26b00' />
						<option value='#b2b200' />
						<option value='#006100' />
						<option value='#0047b2' />
						<option value='#6b24b2' />
						<option value='#444444' />
						<option value='#5c0000' />
						<option value='#663d00' />
						<option value='#666600' />
						<option value='#003700' />
						<option value='#002966' />
						<option value='#3d1466' />
					</select>
					<select className='ql-background' aria-label='Kolor tła'>
						<option value='#000000' />
						<option value='#e60000' />
						<option value='#ff9900' />
						<option value='#ffff00' />
						<option value='#008a00' />
						<option value='#0066cc' />
						<option value='#9933ff' />
						<option value='#ffffff' selected='selected' />
						<option value='#facccc' />
						<option value='#ffebcc' />
						<option value='#ffffcc' />
						<option value='#cce8cc' />
						<option value='#cce0f5' />
						<option value='#ebd6ff' />
						<option value='#bbbbbb' />
						<option value='#f06666' />
						<option value='#ffc266' />
						<option value='#ffff66' />
						<option value='#66b966' />
						<option value='#66a3e0' />
						<option value='#c285ff' />
						<option value='#888888' />
						<option value='#a10000' />
						<option value='#b26b00' />
						<option value='#b2b200' />
						<option value='#006100' />
						<option value='#0047b2' />
						<option value='#6b24b2' />
						<option value='#444444' />
						<option value='#5c0000' />
						<option value='#663d00' />
						<option value='#666600' />
						<option value='#003700' />
						<option value='#002966' />
						<option value='#3d1466' />
					</select>
				</span>
				<span className='ql-formats'>
					<select className='ql-font' aria-label='Czcionka tekstu'>
						<option selected='selected' aria-label='Czcionka tekstu Sans Serif' />
						<option value='serif' aria-label='Czcionka tekstu Serif' />
						<option value='monospace' aria-label='Czcionka tekstu Monospace' />
					</select>
				</span>
				<span className='ql-formats'>
					<select className='ql-align' aria-label='Wyrównanie tekstu'>
						<option selected='selected' aria-label='Wyrównanie tekstu do lewej' />
						<option value='center' aria-label='Wyrównanie tekstu wyśrodkowane' />
						<option value='right' aria-label='Wyrównanie tekstu do prawej' />
						<option value='justify' aria-label='Wyrównanie tekstu wyjustowane' />
					</select>
				</span>
				<span className='ql-formats'>
					<button type='button' className='ql-link' aria-label='Adres url' />
				</span>
			</div>
		);
		return header;
	}

	applyAccessibilityHacks(reference) {
		// Get ref to the toolbar, its not available through the quill api ughh
		const query = reference.container.parentElement.getElementsByClassName('ql-toolbar');
		// if (query.length !== 1) {
		// 	// No toolbars found OR multiple which is not what we expect either
		// 	return;
		// }

		const toolBar = query[1];
		// Make pickers work with keyboard and apply aria labels
		// FIXME: When you open a submenu with the keyboard and close it with the mouse by click somewhere else,
		// the menu aria-hidden value is incorrectly left to `false`
		const pickers = toolBar.getElementsByClassName('ql-picker');
		for (let i = 0; i < pickers.length; i++) {
			const picker = pickers[i];

			const label = picker.getElementsByClassName('ql-picker-label')[0];
			const optionsContainer = picker.getElementsByClassName('ql-picker-options')[0];
			const options = optionsContainer.getElementsByClassName('ql-picker-item');

			label.setAttribute('role', 'button');
			label.setAttribute('aria-haspopup', 'true');
			label.setAttribute('tabIndex', '0');

			if (DomHandler.hasClass(picker, 'ql-size')) {
				label.setAttribute('aria-label', 'Rozmiar czcionki');
			} else if (DomHandler.hasClass(picker, 'ql-font')) {
				label.setAttribute('aria-label', 'Czcionka tekstu');
			} else if (DomHandler.hasClass(picker, 'ql-color')) {
				label.setAttribute('aria-label', 'Kolor czcionki');
			} else if (DomHandler.hasClass(picker, 'ql-background')) {
				label.setAttribute('aria-label', 'Kolor tła');
			} else if (DomHandler.hasClass(picker, 'ql-align')) {
				label.setAttribute('aria-label', 'Wyrównanie tekstu');
			}

			optionsContainer.setAttribute('aria-hidden', 'true');
			optionsContainer.setAttribute('aria-label', 'submenu');
			for (let x = 0; x < options.length; x++) {
				const item = options[x];
				item.setAttribute('tabIndex', '0');
				item.setAttribute('role', 'button');
				let pickerLabel = '';
				if (DomHandler.hasClass(picker, 'ql-size')) {
					pickerLabel = 'Rozmiar czcionki';
				} else if (DomHandler.hasClass(picker, 'ql-font')) {
					pickerLabel = 'Czcionka tekstu';
				} else if (DomHandler.hasClass(picker, 'ql-color')) {
					pickerLabel = 'Kolor czcionki';
				} else if (DomHandler.hasClass(picker, 'ql-background')) {
					pickerLabel = 'Kolor tła';
				} else if (DomHandler.hasClass(picker, 'ql-align')) {
					pickerLabel = 'Wyrównanie tekstu';
				}
				// Read the css 'content' values and generate aria labels
				const size = window.getComputedStyle(item, ':before').content.replace(/"/g, '');
				if (DomHandler.hasClass(picker, 'ql-align')) {
					let align = '';
					switch (x) {
						case 0:
							align = 'Wyrównanie tekstu do lewej';
							break;
						case 1:
							align = 'Wyrównanie tekstu wyśrodkowane';
							break;
						case 2:
							align = 'Wyrównanie tekstu do prawej';
							break;
						case 3:
							align = 'Wyrównanie tekstu wyjustowane';
							break;
						default:
							break;
					}
					item.setAttribute('aria-label', `${pickerLabel} ${align}`);
				} else if (DomHandler.hasClass(picker, 'ql-color') || DomHandler.hasClass(picker, 'ql-background')) {
					item.setAttribute('aria-label', `${pickerLabel} ${item.getAttribute('data-value')}`);
				} else {
					item.setAttribute('aria-label', `${pickerLabel} ${size}`);
				}
				item.addEventListener('keyup', (e) => {
					if (e.keyCode === 13) {
						item.click();
						optionsContainer.setAttribute('aria-hidden', 'true');
					}
				});
			}

			label.addEventListener('keyup', (e) => {
				if (e.keyCode === 13) {
					label.click();
					optionsContainer.setAttribute('aria-hidden', 'false');
				}
			});
		}
	}

	renderEdit() {
		return this.renderNew();
	}

	renderNew() {
		const { colClass, disabled, formats, headerTemplate, id, label, name, onAfterStateChange, onChange, onSelectionChange, placeholder, publicMode, showLabel, stateField, validator, validators, value, editorRef } = this.props;
		const { textValue } = this.state;
		let valueString = '';
		if (value !== undefined && value !== null) {
			valueString = value;
		}
		const sanitizedValue = sanitizeHtml(valueString, this.sanitizeOptions);
		const ref = editorRef ? editorRef : this.editorRef;
		const header = headerTemplate ? headerTemplate : this.prepareDefaultHeaderTemplate();
		const required = validators !== undefined && validators.includes('required') && !validators.includes('not_required');
		return publicMode ? (
			<div className='input_easy_label row pl-0'>
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className='easy_label col-lg-2 col-md-3' htmlFor={id}>
						{label}
					</label>
				) : null}
				<div className='col-md-5'>
					<Editor
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						ref={ref}
						name={name}
						placeholder={placeholder}
						style={{ width: '100%', height: '320px' }}
						value={sanitizedValue}
						onTextChange={(e) => {
							if (onChange !== undefined) {
								onChange('TEXT_EDITOR', [name], sanitizeHtml(sanitizeHtml(e.htmlValue, this.sanitizeOptions), this.sanitizeOptions), onAfterStateChange, stateField);
							}
							this.updateTextValue();
						}}
						onSelectionChange={onSelectionChange ? onSelectionChange : null}
						formats={formats}
						headerTemplate={header}
						disabled={disabled}
						readOnly={disabled}
						required={required}
					/>

					<div aria-live='assertive'>{validator ? validator.message(id, label, textValue, validators) : null}</div>
				</div>
			</div>
		) : (
			<div className={colClass}>
				<div className={'row'}>
					<div className={'col-md-12 form-group'}>
						{label !== undefined && showLabel ? (
							<label id={`${id}-label-id`} className='p-label' htmlFor={id} style={{ width: '100%' }}>
								{label}
							</label>
						) : null}
						<Editor
							ariaLabel={label}
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							key={id}
							id={id}
							ref={ref}
							name={name}
							placeholder={placeholder}
							style={{ width: '100%', height: '320px' }}
							value={sanitizedValue}
							onTextChange={(e) => {
								if (onChange !== undefined) {
									onChange('TEXT_EDITOR', [name], sanitizeHtml(sanitizeHtml(e.htmlValue, this.sanitizeOptions), this.sanitizeOptions), onAfterStateChange, stateField);
								}
								this.updateTextValue();
							}}
							onSelectionChange={onSelectionChange ? onSelectionChange : null}
							formats={formats}
							headerTemplate={header}
							disabled={disabled}
							readOnly={disabled}
							required={required}
						/>

						<div aria-live='assertive'>{validator ? validator.message(id, label, textValue, validators) : null}</div>
					</div>
				</div>
			</div>
		);
	}

	updateTextValue() {
		const { editorRef } = this.props;
		const ref = editorRef ? editorRef : this.editorRef;
		let textValue = '';
		if (ref && ref.current) {
			const q = ref.current.quill;
			if (q && q.editor && q.editor.delta && q.editor.delta.ops) {
				for (let i = 0; i < q.editor.delta.ops.length; i++) {
					const line = q.editor.delta.ops[i];
					if (line && line.insert) {
						textValue += line.insert;
					}
				}
			}
		}
		if (textValue) {
			textValue = textValue.replace(/(?:\r\n|\r|\n)/g, '');
			textValue = sanitizeHtml(textValue, this.sanitizeOptions);
		}
		this.setState({ textValue });
		return textValue;
	}

	render() {
		const { rendered, viewMode } = this.props;
		if (rendered) {
			switch (viewMode) {
				case 'NEW':
					return this.renderNew();
				case 'EDIT':
					return this.renderEdit();
				case 'VIEW':
				default:
					return this.renderView();
			}
		} else {
			return null;
		}
	}
}

InputTextEditorComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	placeholder: '',
	publicMode: false,
	rendered: true,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'required',
	viewMode: 'VIEW',
	formats: FORMATS,
};

InputTextEditorComponent.propTypes = {
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	editorRef: PropTypes.object,
	formats: PropTypes.array,
	headerTemplate: PropTypes.any,
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	onSelectionChange: PropTypes.func,
	placeholder: PropTypes.string,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.string,
	viewMode: PropTypes.string,
};

export default InputTextEditorComponent;
