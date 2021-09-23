import axios from "axios";
import {GRAPHQL_ENDPOINT} from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const OrderList = ()=>{
    const [orders, setorders] = useState([])

    const loadOrders = async()=>{
        const token = localStorage.getItem('token');

        // one index at data has this
        // price_per_unit: 156
        // product_id: 1
        // product_name: "Biriyani"
        // product_picture: "sfdfsdf.jpg"
        // quantity: 1
        // total_price: 156

        var data = JSON.stringify({
            query: `query{
            orders{
              edges{
                node{
                  objId
                  isPreorder
                  preorderScheduledTime
                  orderStatus
                  price
                  data

                  shop{
                    objId
                    name
                    phoneNo
                  }
                }
              }
            }
          }`,
            variables: {}
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
            alert("Failed due to network issue")
            return {};
        };
        console.log(response.data.data.orders.edges)
        setorders(response.data.data.orders.edges)
    }

    useEffect(()=>{
        loadOrders();
    },[])

    return (<>
        <div>
            <h1>All orders</h1>
            {
                orders.length == 0 ?  <h1>No orders found</h1> : orders.map((order)=>{
                    return (
                        <div>
                            <p>Status : {order["node"]["orderStatus"]}</p>
                            <p>Total : {order["node"]["price"]}</p>
                            <p>From shop : <Link to={"/shop/"+order["node"]["shop"]["objId"]} >{order["node"]["shop"]["name"]}</Link></p>
                            {order["node"]["isPreorder"] ? (<>Scheduled Time : {order["node"]["preorderScheduledTime"]}</>) : (<></>) }
                            <p>Order details</p>
                            {order["node"]["data"].map((product)=>{
                                return (
                                    <>
                                    <div>
                                        <p>{product.product_name}  {product.quantity}x{product.price_per_unit}  = {product.total_price}</p>
                                    </div>
                                    </>
                                )
                            })}
                            <hr></hr>
                        </div>
                    )
                })
            }
        </div>
    </>);

}

export default OrderList;