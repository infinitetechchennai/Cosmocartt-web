import axios from "axios"
import * as actionType from "../Constants/cartConstants" 

export const addToCart = (id,quantity)=> async (dispatch)=>{
    try{
        const config = {
            headers: {
                "content-type":"application/json"
            }
        }
        const {data} = await axios.get(`http://127.0.0.1:8000/products/${id}?user_type=b2c`, config);
        const productDetails = data;
        
        // Normalize product data for web components consistency
        const normalizedProduct = {
            ...productDetails,
            id: productDetails.id,
            url: productDetails.image || productDetails.url || productDetails.detailUrl || "",
            title: {
                longTitle: productDetails.name || (productDetails.title && productDetails.title.longTitle) || "Product"
            },
            price: {
                mrp: productDetails.b2c_price || (productDetails.price && productDetails.price.mrp) || 0,
                cost: productDetails.current_price || productDetails.b2c_price || (productDetails.price && productDetails.price.cost) || 0,
                discount: productDetails.b2c_discount || (productDetails.price && productDetails.price.discount) || "0%"
            },
            weight: productDetails.weight || 0,
            length: productDetails.length || 0,
            breadth: productDetails.breadth || 0,
            height: productDetails.height || 0,
            hsn: productDetails.hsn || "",
            sgst: productDetails.sgst || 0,
            cgst: productDetails.cgst || 0,
            quantity
        };

        return dispatch({type:actionType.ADD_TO_CART_SUCCESS, payload:normalizedProduct})
    }catch(error){
        console.log(error);
        dispatch({type:actionType.ADD_TO_CART_ERROR, payload:error.message})
    }

}


export const deleteFromCart = (id)=>async (dispatch)=>{
 dispatch({type:actionType.REMOVE_FROM_CART,payload:id});
}

export const deleteCart = ()=>async (dispatch)=>{
    dispatch({type:"remove",payload:""});
   }




