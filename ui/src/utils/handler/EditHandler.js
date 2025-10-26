import {TreeListUtils} from '../component/TreeListUtils';
import EntryResponseHelper from '../helper/EntryResponseHelper';
import {SessionStoreUtils} from '../SessionStoreUtils';

export const handleEdit = (
    crudService,
    viewId,
    recordId,
    parentId,
    kindView,
    handleShowEditPanel,
    handleUnblockUi,
    showErrorMessages,
    readOnly,
    param
) => {
    crudService
        .editEntry(viewId, recordId, parentId, kindView, '')
        .then((entryResponse) => {
            EntryResponseHelper.run(
                entryResponse,
                () => {
                    if (!!entryResponse.next) {
                        crudService
                            .edit(viewId, recordId, parentId, param)
                            .then((editDataResponse) => {
                                SessionStoreUtils.saveClickedRowFromView(recordId);
                                editDataResponse.editInfo.readOnly = readOnly;
                                handleShowEditPanel(editDataResponse);
                            })
                            .catch((err) => {
                                showErrorMessages(err);
                            });
                    } else {
                        handleUnblockUi();
                    }
                },
                () => handleUnblockUi(),
                () => handleUnblockUi()
            );
        })
        .catch((err) => {
            showErrorMessages(err);
        });
};

export const handleEditSpec = (viewId, parentId, recordId, parsedGridView, handleUnblockUi, showErrorMessages) => {
    TreeListUtils.openEditSpec(
        viewId,
        TreeListUtils.isKindViewSpec(parsedGridView) ? parentId : recordId,
        TreeListUtils.isKindViewSpec(parsedGridView) ? [recordId] : [],
        handleUnblockUi,
        showErrorMessages
    );
};
