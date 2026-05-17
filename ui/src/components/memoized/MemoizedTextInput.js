import React, {useRef, useState} from 'react';
import CellValidator, {ResultType} from '../../model/CellValidator';
import {TextBox, Validator} from 'devextreme-react';
import EditRowUtils from '../../utils/EditRowUtils';
import {MemoizedOperations} from './MemoizedOperations';
import OperationCell from '../../enum/OperationCell';

import {PatternRule, RequiredRule} from 'devextreme-react/validator';
import {StringUtils} from '../../utils/StringUtils';
import {getStore} from '../../utils/helper/StoreHelper';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {ListOfHintType} from '../../enum/ListOfHintType';

export const MemoizedTextInput = React.memo(
    ({
        field,
        cellInfo,
        inputValue,
        fieldIndex,
        className,
        mode,
        required,
        validate,
        selectionList,
        onOperationClick,
        downFill,
        onFillDownClick,
        afterValidatorExecute,
        refreshComponent,
    }) => {
        const revertClicked = useRef(false);
        const cellValidator = new CellValidator(cellInfo, field);
        const [isValid, setIsValid] = useState(cellValidator.isValidField(inputValue));
        let currentVal = inputValue;
        const observeRevertButton = (element, onRevert) => {
            const cellContainer = element.closest('.dx-editor-cell') ?? element.parentElement;
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList?.contains('dx-revert-button')) {
                            node.addEventListener('click', onRevert);
                        }
                    });
                });
            });
            observer.observe(cellContainer, {childList: true, subtree: true});
            return observer;
        };

        const handleValidation = (value) => {
            cellValidator.validateChain(value);
            const helpBtn = document.getElementById('helpBtn');
            const isAvailableToChangeHelpBtn = () => {
                return !!helpBtn?.style;
            };
            if (cellValidator.canShowReasonsChanges(value)) {
                if (isAvailableToChangeHelpBtn()) {
                    helpBtn.style.display = 'flex';
                }
                if (cellValidator.resultCode === ResultType.NOK) {
                    helpBtn.children[0].style.backgroundColor = 'red';
                    helpBtn.children[0].classList.add('dx-invalid');
                } else if (cellValidator.resultCode === ResultType.OK) {
                    helpBtn.children[0].style.backgroundColor = 'green';
                    helpBtn.children[0].classList.remove('dx-invalid');
                } else {
                    if (isAvailableToChangeHelpBtn()) {
                        helpBtn.style.display = 'none';
                    }
                    helpBtn.children[0].classList.remove('dx-invalid');
                }
            } else {
                if (isAvailableToChangeHelpBtn()) {
                    helpBtn.style.display = 'none';
                }
                helpBtn?.children[0]?.classList.remove('dx-invalid');
            }
        };

        return (
            <React.Fragment>
                <div className={`row`}>
                    <div className={`${className} col-12`}>
                        <TextBox
                            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            className={`${validate}`}
                            onContentReady={(e) => {
                                handleValidation(currentVal);
                                const observer = observeRevertButton(e.element, () => {
                                    revertClicked.current = true;
                                });
                                e.component.on('disposing', () => observer.disconnect());
                            }}
                            mode={mode || 'text'}
                            isValid={isValid}
                            onDisposing={(e) => {
                                setTimeout(() => {
                                    const value = revertClicked.current ? inputValue : cellInfo?.value;
                                    revertClicked.current = false;
                                    if (afterValidatorExecute) {
                                        cellValidator.validateChain(value);
                                        afterValidatorExecute(cellValidator, value);
                                        if (cellValidator.shouldRunListOfHintsIfPossible()) {
                                            onOperationClick(false, ListOfHintType.REASON, {
                                                cellValidator,
                                                value: value,
                                            });
                                        }
                                    }
                                    if (field.fieldName === 'FORMULA') {
                                        if (
                                            (StringUtils.isBlankOrEmpty(cellInfo.displayValue) &&
                                                !StringUtils.isBlankOrEmpty(value)) ||
                                            (!StringUtils.isBlankOrEmpty(cellInfo.displayValue) &&
                                                StringUtils.isBlankOrEmpty(value))
                                        ) {
                                            refreshComponent();
                                        }
                                    }
                                });
                            }}
                            validationMessagePosition='left'
                            defaultValue={inputValue}
                            stylingMode={'filled'}
                            disabled={!field.edit}
                            valueChangeEvent={'keyup'}
                            onValueChanged={(e) => {
                                const isValid = cellValidator.isValidField(e.value);
                                handleValidation(e.value);
                                setIsValid(isValid);
                                switch (required) {
                                    case true:
                                        if (e.value !== '') {
                                            currentVal = e.value;
                                            cellInfo.setValue(e.value);
                                        }
                                        break;
                                    default:
                                        currentVal = e.value;
                                        cellInfo.setValue(e.value);
                                        break;
                                }
                            }}
                        >
                            <Validator>
                                {cellValidator.expressionSatisfiesCondition() && (
                                    <PatternRule pattern={cellValidator.getRegex()} message={''} />
                                )}
                                {required && <RequiredRule />}
                            </Validator>
                        </TextBox>
                        <div id='helpBtn' style={{display: 'none'}}>
                            <Button
                                type='button'
                                style={{maxWidth: '41px'}}
                                onClick={() => {
                                    onOperationClick(false, ListOfHintType.REASON, {cellValidator, value: currentVal});
                                }}
                                icon='mdi mdi-help'
                                className='p-button-danger'
                            />
                        </div>
                        <MemoizedOperations
                            editListVisible={!!selectionList}
                            onOperationClick={(type) => {
                                onOperationClick(false, type, {cellValidator, value: currentVal});
                            }}
                            fillDownVisible={!!downFill}
                            onFillDownClick={onFillDownClick}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }
);
