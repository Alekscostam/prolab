import {ViewData, ViewDataResponse} from "../../model/ViewDataModel";

export class ViewDataParserUtils {

    static parse(jsonData) {
        let parsedViewObject = JSON.parse(jsonData);
        const viewDataValidObject = new ViewDataResponse({
            data: parsedViewObject.data?.map((d) => new ViewData({
                id: d.id,
                code: d.code,
                name: d.name,
                description: d.description,
            })),
        });
        return viewDataValidObject;
    }

}