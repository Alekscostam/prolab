import {ArrayModel, ObjectModel} from "objectmodel";

export const ViewData = ObjectModel({
    id: String,//TODO lol tak wynika z dokumentacji, warto wyprostować
    code: String,
    name: String,
    description: String,
});

export const ViewDataResponse = ObjectModel({
    data: ArrayModel(ViewData),
});