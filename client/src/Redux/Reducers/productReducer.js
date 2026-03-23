import * as ActionType from "../Constants/productsConstants"



    
export const getProductsReducer = (state = {products:[]},action)=>{

        switch (action.type){
            case ActionType.PRODUCT_SUCCESS_MSG:
                return {products: action.payload}
            case ActionType.PRODUCT_ERROR_MSG:
              
                return {error: action.payload}
            default:
                return (state)
        }

    }