import * as cartActions from "../Constants/cartConstants";

export const cartReducer = (state=[],action)=>{




    switch(action.type){


        case cartActions.ADD_TO_CART_SUCCESS:
            const item = action.payload;
            const exist = state.find(product => product.id===item.id);
            if(exist){
                return (state.map(product=> product.id==exist.id ? item : product))

            }else{
                return [...state,item]
            }


        case cartActions.REMOVE_FROM_CART:  
            return (state.filter(product=> product.id != action.payload))


        case "remove":
            return [];
        
        default:
            return state;

       

    }




}