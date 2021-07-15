import {MenuItem, MenuResponse} from "../../model/MenuModel";

export class MenuParserUtils {

    static flatParse(jsonData) {
        const menuDataValidObject = new MenuResponse({
            menu: jsonData.menu?.map((m) => new MenuItem({
                id: m.id,
                type: m.type,
                name: m.name,
                icon: m.icon,
            }))
        });
        return menuDataValidObject;
    }

    static recurrenceValidation(jsonData) {
        for (let i = 0; i < jsonData.length; i++) {
            let sub = jsonData[i].sub;
            if (sub !== undefined && sub !== null && (Array.isArray(sub) && sub.length !== 0)) {
                sub.forEach(sub => {
                    new MenuItem({
                        id: sub.id,
                        type: sub.type,
                        name: sub.name,
                        icon: sub.icon
                    })
                })
                this.recurrenceValidation(sub);
            } else {
                new MenuItem({
                    id: jsonData[i].id,
                    type: jsonData[i].type,
                    name: jsonData[i].name,
                    icon: jsonData[i].icon
                })
                this.recurrenceValidation(jsonData[i]);
            }
        }
        return jsonData;
    }

}