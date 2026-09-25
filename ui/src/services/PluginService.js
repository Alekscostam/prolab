import {ComponentViewStateUtils} from '../utils/ComponentViewStateUtils';
import {StringUtils} from '../utils/StringUtils';
import HeaderService from './HeaderService';

export default class PluginService extends HeaderService {
    constructor() {
        super();
        this.path = 'view';
    }

    static getQueryString(parentId, kindView, kindOperation, confirmSave, type = 'PLUGIN') {
        const queryString = StringUtils.objToQueryString({
            parentId: parentId,
            confirmSave: confirmSave,
            kindView: parentId && kindView ? kindView : undefined,
            kindOperation: kindOperation,
            type: type,
        });
        return queryString;
    }

    wrapWithSortAndFilter(element) {
        return ComponentViewStateUtils.bodyWithSortAndFilter(element);
    }

    editSave(viewId, pluginId, parentId, kindView, kindOperation, element, confirmSave, token, type) {
        return super.editSave(
            viewId,
            pluginId,
            parentId,
            kindView,
            kindOperation,
            this.wrapWithSortAndFilter(element),
            confirmSave,
            token,
            type,
            'plugin/edit'
        );
    }

    editList(viewId, pluginId, parentId, fieldId, kindView, element, type) {
        return super.editList(
            viewId,
            pluginId,
            parentId,
            fieldId,
            kindView,
            this.wrapWithSortAndFilter(element),
            type,
            'plugin/edit'
        );
    }

    editCancel(viewId, pluginId, parentId, kindView, kindOperation, element, type) {
        return super.editCancel(
            viewId,
            pluginId,
            parentId,
            kindView,
            kindOperation,
            this.wrapWithSortAndFilter(element),
            type,
            'plugin/edit'
        );
    }

    editAutoFill(viewId, pluginId, parentId, kindView, element, type) {
        return super.editAutoFill(
            viewId,
            pluginId,
            parentId,
            kindView,
            this.wrapWithSortAndFilter(element),
            type,
            'plugin/edit'
        );
    }

    editRefreshFieldVisibility(viewId, pluginId, parentId, kindView, element, type) {
        return super.editRefreshFieldVisibility(
            viewId,
            pluginId,
            parentId,
            kindView,
            this.wrapWithSortAndFilter(element),
            type,
            'plugin/edit'
        );
    }

    entry(viewId, pluginId, listIds) {
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/plugin/${pluginId}/entry`, {
            method: 'POST',

            body: JSON.stringify(this.wrapWithSortAndFilter(listIds)),
        }).catch((err) => {
            throw err;
        });
    }

    getColumnsDefnitions(viewId, pluginId, listIds, parentId) {
        const queryString = PluginService.getQueryString(parentId);
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/plugin/${pluginId}${queryString}`, {
            method: 'POST',
            body: JSON.stringify(this.wrapWithSortAndFilter(listIds)),
        })
            .then((pluginResponse) => {
                return Promise.resolve(pluginResponse);
            })
            .catch((err) => {
                throw err;
            });
    }

    getExecuteColumnsDefinitions(viewId, pluginId, requestBody, parentId) {
        const queryString = PluginService.getQueryString(parentId);
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/plugin/${pluginId}/execute${queryString}`, {
            method: 'POST',
            body: JSON.stringify(this.wrapWithSortAndFilter(requestBody)),
        })
            .then((pluginResponse) => {
                return Promise.resolve(pluginResponse);
            })
            .catch((err) => {
                throw err;
            });
    }
}
