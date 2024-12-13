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
    showErrorMessages
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

export const handleEditSpec = (
    viewId,
    parentId,
    recordId,
    currentBreadcrumb,
    parsedGridView,
    handleUnblockUi,
    showErrorMessages
) => {
    const prevUrl = window.location.href;
    sessionStorage.setItem('prevUrl', prevUrl);
    TreeListUtils.openEditSpec(
        viewId,
        TreeListUtils.isKindViewSpec(parsedGridView) ? parentId : recordId,
        TreeListUtils.isKindViewSpec(parsedGridView) ? [recordId] : [],
        currentBreadcrumb,
        handleUnblockUi,
        showErrorMessages
    );
};
