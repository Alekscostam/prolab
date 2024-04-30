import {Menu} from 'primereact/menu';
import {OperationType} from '../../model/OperationType';
import React from 'react';

export const MenuWithButtons = (props) => {
    const menuItems = props?.operationList
        ? props.operationList.map((i, index) => {
              let url = undefined;
              switch (i.type?.toUpperCase()) {
                  case OperationType.OP_EDIT_SPEC:
                      url = props.hrefSpecView;
                      break;
                  case OperationType.OP_SUBVIEWS:
                      url = props.hrefSubview;
                      break;
                  default:
                      url = undefined;
                      break;
              }
              return {
                  key: 'menu-' + index,
                  className: i.className,
                  label: i.label,
                  icon: `mdi ${i.iconCode}`,
                  url: url,
                  command: () => {
                      switch (i.type?.toUpperCase()) {
                          case OperationType.OP_EDIT:
                              return props.handleEdit();
                          case OperationType.OP_EDIT_SPEC:
                              return props.handleEditSpec();
                          case OperationType.OP_ADDSPEC_SPEC:
                              return props.handleAddSpecSpec();
                          case OperationType.OP_ADD_SPEC:
                              return props.handleAddSpec();
                          case OperationType.OP_SUBVIEWS:
                              return props.handleHrefSubview();
                          case OperationType.OP_DELETE:
                              return props.handleDelete();
                          case OperationType.OP_RESTORE:
                              return props.handleRestore();
                          case OperationType.OP_COPY:
                              return props.handleCopy();
                          case OperationType.SK_DOCUMENT:
                              return props.handleDocumentsSk(i);
                          case OperationType.OP_DOCUMENTS:
                              return props.handleDocuments();
                          case OperationType.SK_PLUGIN:
                              return props.handlePluginsSk(i);
                          case OperationType.OP_PLUGINS:
                              return props.handlePlugins();
                          case OperationType.OP_ARCHIVE:
                              return props.handleArchive();
                          case OperationType.OP_PUBLISH:
                              return props.handlePublish();
                          case OperationType.OP_FORMULA:
                              return props.handleFormula(i);
                          case OperationType.OP_DOWNLOAD:
                              return props.handleDownload();
                          case OperationType.OP_HISTORY:
                              return props.handleHistory();
                          case OperationType.OP_ATTACHMENTS:
                              return props.handleAttachments();
                          case OperationType.OP_BATCH:
                              return props.handleBatch(i);
                          case OperationType.OP_ADD_LEVEL:
                              return props.handleAddLevel();
                          case OperationType.OP_UP:
                              return props.handleUp();
                          case OperationType.OP_DOWN:
                              return props.handleDown();
                          case OperationType.OP_FILL:
                              return props.handleFill();
                          case OperationType.OP_SELECT:
                              return props.handleSelect();
                          case OperationType.OP_TREE_CHECK:
                              return props.handleCheck();
                          case OperationType.OP_TREE_UNCHECK:
                              return props.handleUncheck();
                          case OperationType.OP_ADDSPEC_ADD:
                              return props.handleExecSpec();
                          case OperationType.OP_ADD:
                              return props.handleAdd();
                          case OperationType.OP_ADDSPEC_COUNT:
                              return props.handleAddSpecCount();
                          case OperationType.OP_SAVE:
                              return props.handleSaveAction();
                          case OperationType.OP_TREE_EXPAND:
                              return props.handleExpand();
                          case OperationType.OP_TREE_COLLAPSE:
                              return props.handleCollapse();
                          default:
                              return null;
                      }
                  },
              };
          })
        : [];
    return (
        <React.Fragment>
            <span id='action-button-with-menu-contant' className='action-button-with-menu-contant'></span>
            <Menu
                id='menu-with-buttons'
                appendTo={document.body}
                style={{
                    position: 'absolute',
                }}
                onBlur={(e) => {
                    props.menu.current.hide(e);
                }}
                model={menuItems}
                popup
                ref={props.menu}
            />
        </React.Fragment>
    );
};
