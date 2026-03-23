import { getProductsReducer } from "./Reducers/productReducer";
import thunkMiddleware from 'redux-thunk';
import {createStore, combineReducers, applyMiddleware} from "redux"
import { composeWithDevTools } from "redux-devtools-extension";
import {cartReducer} from "../Redux/Reducers/cartReducer"

const reducer = combineReducers({
    getProducts:getProductsReducer,
    cart: cartReducer,

})

const middleware = [thunkMiddleware ];

const normalizeCart = (cart) => {
    if (!Array.isArray(cart)) return [];
    return cart.map(item => ({
        ...item,
        id: item.id,
        url: item.url || item.image || item.detailUrl || "",
        title: {
            longTitle: item.title?.longTitle || item.name || "Product"
        },
        price: {
            mrp: item.price?.mrp || item.b2c_price || (item.price && item.price.mrp) || 0,
            cost: item.price?.cost || item.current_price || item.b2c_price || (item.price && item.price.cost) || 0,
            discount: item.price?.discount || item.b2c_discount || (item.price && item.price.discount) || "0%"
        }
    }));
};

const cartFromLocalStorage = localStorage.getItem('cart') ? normalizeCart(JSON.parse(localStorage.getItem('cart'))) : [];

const initialState = {
    cart: cartFromLocalStorage
};

const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))

)

store.subscribe(() => {
    localStorage.setItem('cart', JSON.stringify(store.getState().cart));
});


export default store;

