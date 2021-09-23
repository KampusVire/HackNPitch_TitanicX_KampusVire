import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ENDPOINT, GRAPHQL_ENDPOINT } from "./config";
import axios from "axios";
import { addToCart } from "./shopping_function";
import "./components/canteen.css";
import canteenImage from "./components/img/Rectangle 100 (1).png";
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";


function useForceUpdate(){
    let [value, setState] = useState(true);
    return () => setState(!value);
}    

const AllProductsShop = () => {
    let forceUpdate = useForceUpdate()
    const [products, setProducts] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const token = localStorage.getItem("token");

    if (!loaded) {
        var data = JSON.stringify({
          query: `query{
                allProductsShop{
                  edges{
                    cursor
                    node{
                      objId
                      name
                      picture
                      price
                      isAvailable
                    }
                  }
                }
              }`,
          variables: { },
        });
    
        var config = {
          method: "post",
          url: GRAPHQL_ENDPOINT,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: data,
        };
    
        axios(config)
          .then(function (response) {
              console.log(response);
              setLoaded(true);
            let tmpData = [];
            response.data.data.allProductsShop.edges.forEach(function (edge) {
              tmpData.push({
                objId: edge.node.objId,
                name: edge.node.name,
                picture: edge.node.picture,
                price: edge.node.price,
                isAvailable: edge.node.isAvailable,
              });
              console.log(tmpData);
            });
            setProducts([...products, ...tmpData]);
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    
      const updateProduct = async(index)=>{
        toast('Wait a bit!',
        {
          icon: '👏',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }
      );
        var data = JSON.stringify({
            query: `mutation($productId : Int!, $name : String!, $picture : String!, $price : Float!, $isAvailable : Boolean!){
            updateProduct(productId : $productId,name : $name, picture : $picture, price : $price, isAvailable : $isAvailable){
              success
              message
              error
            }
          }`,
            variables: {"productId":products[index]["objId"],"name":products[index]["name"],"picture":products[index]["picture"],"price":products[index]["price"],"isAvailable":!products[index]["isAvailable"]}
          });
        var config = {
            method: "post",
            url: GRAPHQL_ENDPOINT,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            data: data,
          };
      
          var response = await axios(config);
          if(!response) {
              toast.error("Failed to update");
              return;
          }
          console.log(response.data)
          if(response.data.data.updateProduct.success){
              toast.success(response.data.data.updateProduct.message)
              var tmp = products;
              tmp[index]["isAvailable"] = !tmp[index]["isAvailable"];
              setProducts(tmp);
              forceUpdate();
          }else{
            toast.error(response.data.data.updateProduct.error);
          }
      } 

    return (<>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
      />
      <Navbar />
    <div className="container my-3">
    {products.map((product, index)=>{
        return (
            <div className="row border-top p-1" key={product["objId"]}>
                <div className="col-3"> 
                    <img src={ENDPOINT+"/media/"+product["picture"]} alt="" className="img-fluid rounded-circle mx-auto d-block" style={{width: "3rem", height: "3rem"}}/>
                </div>
                <div className="col-3 d-flex align-items-center justify-content-center p-1" >{product["name"]} ₹ {product["price"]}</div>
                <div className="col-6 txt-green d-flex align-items-center justify-content-center p-1">
                    {product["isAvailable"] ?
                    <button className="btn btn-success w-75" onClick={()=>updateProduct(index)}>AVAILABLE</button>
                    : <button className="btn btn-danger w-75" onClick={()=>updateProduct(index)}>UNAVAILABLE</button>}
                </div>
            </div>
        )
    })}
    </div>
    </>)
}

export default AllProductsShop;