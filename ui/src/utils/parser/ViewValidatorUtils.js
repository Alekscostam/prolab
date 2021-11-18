import {
    BatchesList,
    CardElement,
    CardOptions,
    Column,
    DocumentsList,
    FiltersList,
    GridColumns,
    GridOptions,
    Operations,
    PluginsList,
    ShortcutButtons,
    ViewInfo,
    ViewResponse,
} from '../../model/ViewModel';
import {parseBoolean} from './ValidationUtils';

export class ViewValidatorUtils {
    static validation(jsonDataArg) {
        let parsedViewObject = jsonDataArg;
        const viewValidObject = new ViewResponse({
            viewInfo: new ViewInfo({
                id: parsedViewObject.viewInfo.id,
                name: parsedViewObject.viewInfo.name,
                type: parsedViewObject.viewInfo.type,
            }),
            gridOptions: new GridOptions({
                showGroupPanel: parseBoolean(parsedViewObject.gridOptions?.showGroupPanel),
                groupExpandAll: parseBoolean(parsedViewObject.gridOptions?.groupExpandAll),
                columnAutoWidth: parseBoolean(parsedViewObject.gridOptions?.columnAutoWidth),
                rowAutoHeight: parseBoolean(parsedViewObject.gridOptions?.rowAutoHeight),
                headerAutoHeight: parseBoolean(parsedViewObject.gridOptions?.headerAutoHeight),
            }),
            gridColumns:
                parsedViewObject.gridColumns !== undefined && parsedViewObject.gridColumns !== null
                    ? parsedViewObject.gridColumns?.map(
                          (g) =>
                              new GridColumns({
                                  groupName: g.groupName,
                                  freeze: g.freeze,
                                  columns: g.columns?.map(
                                      (c) =>
                                          new Column({
                                              id: c.id,
                                              visible: c.visible,
                                              fieldName: c.fieldName,
                                              label: c.label,
                                              type: c.type,
                                              sortIndex: c.sortIndex,
                                              sortOrder: c.sortOrder,
                                              groupIndex: c.groupIndex,
                                              isSort: parseBoolean(c.isSort),
                                              isGroup: parseBoolean(c.isGroup),
                                              isFilter: parseBoolean(c.isFilter),
                                              width: c.width,
                                          })
                                  ),
                              })
                      )
                    : [],
            cardOptions: !!parsedViewObject.cardOptions
                ? new CardOptions({
                      width: parsedViewObject.cardOptions.width ?? 300,
                      height: parsedViewObject.cardOptions.heigh ?? 200,
                  })
                : undefined,
            cardBody: !!parsedViewObject.cardBody
                ? new CardElement({
                      id: parsedViewObject.cardBody.id,
                      visible: parsedViewObject.cardBody.visible,
                      fieldName: parsedViewObject.cardBody.fieldName,
                      label: parsedViewObject.cardBody.label,
                      type: parsedViewObject.cardBody.type,
                  })
                : undefined,
            cardHeader: !!parsedViewObject.cardHeader
                ? new CardElement({
                      id: parsedViewObject.cardHeader.id,
                      visible: parsedViewObject.cardHeader.visible,
                      fieldName: parsedViewObject.cardHeader.fieldName,
                      label: parsedViewObject.cardHeader.label,
                      type: parsedViewObject.cardHeader.type,
                  })
                : undefined,
            cardImage: !!parsedViewObject.cardImage
                ? new CardElement({
                      id: parsedViewObject.cardImage.id,
                      visible: parsedViewObject.cardImage.visible,
                      fieldName: parsedViewObject.cardImage.fieldName,
                      label: parsedViewObject.cardImage.label,
                      type: parsedViewObject.cardImage.type,
                  })
                : undefined,
            cardFooter: !!parsedViewObject.cardFooter
                ? new CardElement({
                      id: parsedViewObject.cardFooter.id,
                      visible: parsedViewObject.cardFooter.visible,
                      fieldName: parsedViewObject.cardFooter.fieldName,
                      label: parsedViewObject.cardFooter.label,
                      type: parsedViewObject.cardFooter.type,
                  })
                : undefined,
            buttons: parsedViewObject.buttons?.map(
                (b) =>
                    new Operations({
                        type: b.type,
                        visible: parseBoolean(b.visible),
                        label: b.label,
                    })
            ),
            shortcutButtons: parsedViewObject.shortcutButtons?.map(
                (s) =>
                    new ShortcutButtons({
                        type: s.type,
                        id: s.id,
                        label: s.label,
                    })
            ),
            documentsList: parsedViewObject.documentsList?.map((d) => new DocumentsList({id: d.id, label: d.label})),
            pluginsList: parsedViewObject.pluginsList?.map((p) => new PluginsList({id: p.id, label: p.label})),
            batchesList: parsedViewObject.batchesList?.map((p) => new BatchesList({id: p.id, label: p.label})),
            FiltersList: parsedViewObject.FiltersList?.map((p) => new FiltersList({id: p.id, label: p.label})),
        });

        return viewValidObject;
    }
}
