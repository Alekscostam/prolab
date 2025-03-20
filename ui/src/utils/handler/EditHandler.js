import {TreeListUtils} from '../component/TreeListUtils';
import EntryResponseHelper from '../helper/EntryResponseHelper';

export const handleEdit = (
    crudService,
    viewId,
    recordId,
    parentId,
    kindView,
    handleShowEditPanel,
    handleUnblockUi,
    showErrorMessages,
    readOnly
) => {
    crudService
        .editEntry(viewId, recordId, parentId, kindView, '')
        .then((entryResponse) => {
            EntryResponseHelper.run(
                entryResponse,
                () => {
                    if (!!entryResponse.next) {
                        crudService
                            .edit(viewId, recordId, parentId, kindView)
                            .then((editDataResponse) => {
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
