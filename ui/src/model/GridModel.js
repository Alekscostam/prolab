// eslint-disable-next-line no-undef
import {ObjectModel} from "objectmodel"

export const Order = new ObjectModel({
    product: {
        name: String,
        quantity: Number,
    },
    orderDate: Date
});



