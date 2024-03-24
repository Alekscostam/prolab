import {ArrayModel, ObjectModel} from 'objectmodel';

export const ViewData = ObjectModel({
    id: String,
    code: String,
    name: String,
    description: String,
});

export const ViewDataResponse = ObjectModel({
    data: ArrayModel(ViewData),
});
