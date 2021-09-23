import {GRAPHQL_ENDPOINT} from './config';
import axios from 'axios';

async function getAllProductsFromCart (){
    var shops = JSON.parse(localStorage.getItem("cart")) ?? {}
    if (shops.length == 0) {
        return [];
    }


    const token = localStorage.getItem('token');
    let list_of_product = [];
    for (const [shop_id, shop_products] of Object.entries(shops)) {
        for (const [objId, quantity] of Object.entries(shop_products)) {
            list_of_product.push({
                "shop_id" : parseInt(shop_id),
                "objId" : parseInt(objId),
                "quantity" : parseInt(quantity)
            });
        }
    }



    var data = JSON.stringify({
        query : `query($listOfIds : [Int]!){
            filterByIds(listOfIds : $listOfIds){
              edges{
                node{
                  objId
                  name
                  picture
                  price
                  shop{
                    objId
                    name
                  }
                }
              }
            }
          }`,
          variables : {
            "listOfIds"  : list_of_product.map(product => product["objId"])
          }
    });


    var config = {
        method: 'post',
        url: GRAPHQL_ENDPOINT,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${token}`
        },
        data : data
    };

    var response = await axios(config);
    if (response.data == undefined){
        return {};
    };

    let product_details = [];
    var responseData = response.data.data.filterByIds.edges;
    responseData.forEach(function(product){
        product_details.push({
            "objId" : parseInt(product.node.objId),
            "name" : product.node.name,
            "picture" : product.node.picture,
            "price" : product.node.price,
            "shop" : product.node.shop.name,
            "shopObjId" : product.node.shop.objId,
            "quantity" : list_of_product.find(e => e.objId == parseInt(product.node.objId)).quantity
        })
    })
    return product_details;
}

async function addToCart(shop_id, product_id){
    var shops = JSON.parse(localStorage.getItem("cart")) ?? {}

    if(!shops[shop_id.toString()]){
        shops[shop_id.toString()] = {};
    }

    if(!shops[shop_id.toString()][product_id.toString()]){
        shops[shop_id.toString()][product_id.toString()] = 1;
        localStorage.setItem("cart", JSON.stringify(shops));
    }
}

async function removeFromCart(shop_id, product_id){
    var shops = JSON.parse(localStorage.getItem("cart")) ?? {}

    if(shops[shop_id.toString()]){
        if(shops[shop_id.toString()][product_id.toString()]){
            delete shops[shop_id.toString()][product_id.toString()];
        }
    }

    localStorage.setItem("cart", JSON.stringify(shops));
}

async function updateQuantityCart(shop_id, product_id, quantity){
    var shops = JSON.parse(localStorage.getItem("cart")) ?? {}

    if(!shops[shop_id.toString()]){
        return;
    }

    if(shops[shop_id.toString()][product_id.toString()]){
        shops[shop_id.toString()][product_id.toString()] = quantity;
    }

    localStorage.setItem("cart", JSON.stringify(shops));
}



export {
    getAllProductsFromCart,
    addToCart,
    removeFromCart,
    updateQuantityCart
}