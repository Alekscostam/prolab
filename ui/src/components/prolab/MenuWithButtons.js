import {OperationType} from '../../enum/OperationType';
import React, {useEffect} from 'react';
import {ContextMenu} from 'devextreme-react';

export const MenuWithButtons = (props) => {
    const itemTemplate = (itemData) => (
        <div className='item-template-container'>
            {itemData.icon && <span className={`${itemData.icon} dx-icon`}></span>}
            <span className='dx-menu-item-text'>{itemData.text}</span>
            {itemData.items && <span className='dx-icon-spinright dx-icon'></span>}
        </div>
    );

    useEffect(() => {
        return () => {};
    }, [props]);

    const menuExtendedItems = (i) => {
        if (!props?.gridView) {
            return undefined;
        }
        let items = undefined;
        switch (i.type?.toUpperCase()) {
            case OperationType.OP_DOCUMENTS:
                items = props.gridView.documentsList.map((i, index) => {
                    return menuExtendedItem(i, () => props.handleDocuments(i), index + '-document');
                });
                return items;
            case OperationType.OP_PLUGINS:
                items = props.gridView.pluginsList.map((i, index) => {
                    return menuExtendedItem(i, () => props.handlePlugins(i), index + '-plugin');
                });
                return items;
            case OperationType.OP_BATCH:
                items = props.gridView.batchesList.map((i, index) => {
                    return menuExtendedItem(i, () => props.handleBatch(i), index + '-batch');
                });
                return items;
        }
    };

    const menuExtendedItem = (i, command, index) => {
        return {
            key: 'menu-' + index,
            className: i.className,
            text: i.label,
            command: command,
        };
    };

    const menuItems = () => {
        return props?.operationList
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
                  const extendedItems = menuExtendedItems(i);
                  return {
                      key: 'menu-' + index,
                      className: i.className,
                      text: i.label,
                      icon: `mdi ${i.iconCode}`,
                      url: url,
                      items: extendedItems,
                      command: (e) => {
                          switch (i.type?.toUpperCase()) {
                              case OperationType.OP_EDIT:
                                  return props.handleEdit(i);
                              case OperationType.OP_EDIT_SPEC:
                                  return props.handleEditSpec(i);
                              case OperationType.OP_ADDSPEC_SPEC:
                                  return props.handleAddSpecSpec(i);
                              case OperationType.OP_ADD_SPEC:
                                  return props.handleAddSpec(i);
                              case OperationType.OP_SUBVIEWS:
                                  return props.handleHrefSubview(i);
                              case OperationType.OP_DELETE:
                                  return props.handleDelete(i);
                              case OperationType.OP_RESTORE:
                                  return props.handleRestore(i);
                              case OperationType.OP_COPY:
                                  return props.handleCopy();
                              case OperationType.SK_DOCUMENT:
                                  return props.handleDocuments(i);
                              case OperationType.SK_PLUGIN:
                                  return props.handlePlugins(i);
                              case OperationType.OP_ARCHIVE:
                                  return props.handleArchive(i);
                              case OperationType.OP_PUBLISH:
                                  return props.handlePublish(i);
                              case OperationType.OP_FORMULA:
                                  return props.handleFormula(i);
                              case OperationType.OP_DOWNLOAD:
                                  return props.handleDownload(i);
                              case OperationType.OP_HISTORY:
                                  return props.handleHistory(i);
                              case OperationType.OP_ATTACHMENTS:
                                  return props.handleAttachments(i);
                              case OperationType.SK_BATCH:
                                  return props.handleBatch(i);
                              case OperationType.OP_ADD_LEVEL:
                                  return props.handleAddLevel(i);
                              case OperationType.OP_UP:
                                  return props.handleUp(i);
                              case OperationType.OP_DOWN:
                                  return props.handleDown(i);
                              case OperationType.OP_FILL:
                                  return props.handleFill(i);
                              case OperationType.OP_SELECT:
                                  return props.handleSelect(i);
                              case OperationType.OP_TREE_CHECK:
                                  return props.handleCheck(i);
                              case OperationType.OP_TREE_UNCHECK:
                                  return props.handleUncheck(i);
                              case OperationType.OP_ADDSPEC_ADD:
                                  return props.handleExecSpec(i);
                              case OperationType.OP_ADD:
                                  return props.handleAdd(i);
                              case OperationType.OP_ADDSPEC_COUNT:
                                  return props.handleAddSpecCount(i);
                              case OperationType.OP_SAVE:
                                  return props.handleSaveAction(i);
                              case OperationType.OP_TREE_EXPAND:
                                  return props.handleExpand(i);
                              case OperationType.OP_TREE_COLLAPSE:
                                  return props.handleCollapse(i);
                              default:
                                  console.log('error not found type: ' + i.type?.toUpperCase());
                                  return null;
                          }
                      },
                  };
              })
            : [];
    };
    return (
        <React.Fragment>
            <ContextMenu
                id='menu-with-buttons'
                ref={props.menuRef}
                style={{zIndex: props.zIndex}}
                dataSource={menuItems()}
                itemRender={itemTemplate}
                target={props.target}
                onItemClick={(e) => {
                    if (e.itemData.command) {
                        props.menuRef.current.instance.hide();
                        e.itemData.command();
                    }
                }}
            />
        </React.Fragment>
    );
};
