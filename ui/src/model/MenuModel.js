// eslint-disable-next-line no-undef
import {ArrayModel, ObjectModel} from "objectmodel"


export const MenuResponse = ObjectModel({
    menu: ArrayModel(Object)
});

export const MenuItem = ObjectModel({
    id: Number,
    type: String,
    name: String,
    icon: [String],
    sub: [ArrayModel(Object)]
});




