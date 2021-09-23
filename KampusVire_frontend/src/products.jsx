import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ENDPOINT, GRAPHQL_ENDPOINT } from "./config";
import axios from "axios";
import { addToCart } from "./shopping_function";
import "./components/canteen.css";
import canteenImage from "./components/img/Rectangle 100 (1).png";
import toast, { Toaster } from 'react-hot-toast';
import "./components/cornerRibbon.css";
import { Link } from "react-router-dom";

const AllProducts = (props) => {
  const { shopid } = useParams();
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const canteenDetails = useRef({});
  const token = localStorage.getItem("token");

  if (!loaded) {
    var data = JSON.stringify({
      query: `query($shopId : Int!, $shopId2 : Float!){
            allShops(id : $shopId2){
              edges{
                node{
                  name
                  picture
                  openAt
                  closeAt
                  longitudeCoordinate
                  latitudeCoordinate
                }
              }
            }
            allProducts(shopId : $shopId){
              edges{
                cursor
                node{
                  id
                  objId
                  name
                  picture
                  price
                  isAvailable
                }
              }
            }
          }`,
      variables: { shopId: shopid, shopId2 : shopid },
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
        canteenDetails.current = response.data.data.allShops.edges[0].node; 
        setLoaded(true);
        let tmpData = [];
        response.data.data.allProducts.edges.forEach(function (edge) {
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
        console.log(canteenDetails.current);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <>
    <Link to="/cart" style={{"position":"fixed","width":"60px","height":"60px","bottom":"23px","right":"23px","backgroundColor":"#FFF","color":"#FFF","borderRadius":"50px","textAlign":"center","boxShadow":"2px 2px 3px #999", display:"flex", justifyContent : "center", alignItems : "center"}}><i class="fas fa-shopping-cart fa-2x" style={{"margin":"22px","color":"#00A310"}} ></i></Link>
      <div
        className="container-fluid sticky-top p-0 m-0 mb-4 w-100"
        style={{ height: "162px" }}
      >
      <Toaster
        position="bottom-center"
        reverseOrder={false}
      />
        <img src={canteenDetails.current.picture ? ENDPOINT+"/media/"+canteenDetails.current.picture : canteenImage} className="img-fluid w-100 h-100" />
        <div className="container-fluid p-0 m-0 topBg text-light nunito_sans fs-1 d-flex flex-column-reverse align-items-center">
          <div className="position-absolute top-0 d-flex w-100 justify-content-between p-2 fs-4">
            <a  onClick={()=>props.history.goBack()}><i className="fas fa-arrow-left"></i></a>
            <h3 className="fw-bold nunito_sans text-uppercase text-center d-inline pt-2">
              menu
            </h3>
            <a target="__blank" href={"https://www.google.com/maps/search/?api=1&query="+canteenDetails.current.latitudeCoordinate+","+canteenDetails.current.longitudeCoordinate}><i className="fas fa-map-marker-alt text-warning"></i></a>
          </div>
          <div
            className="d-flex justify-content-between align-items-center w-75 mt-2 mb-1"
            style={{ fontSize: "1rem" }}
          >
            <small className="open_sans">Open at {canteenDetails.current.openAt ?? ".."} | Closes at {canteenDetails.current.closeAt ?? ".."}</small>
            {/* <small className="open_sans fw-bold text-danger">Busy</small> */}
          </div>
          <div className="text-center w-75 lh-1">{canteenDetails.current.name ?? "..."}</div>
        </div>
      </div>

      <div className="container px-3 mt-3 d-flex flex-wrap justify-content-around">
        {products.map((product) => {
          return (
            <div
              className="card  m-1 p-0 bg-light  position-relative overflow-hidden"
              style={{ width: "47%"}}
              key={product.objId}
            >
              <img
                src={ENDPOINT + "/media/" + product.picture}
                className="card-img-top"
                style={{height:"120px", objectFit : "cover"}}
              />
              <div className="card-body p-1">

                <h6 className="card-title text-center open_sans fw-bold m-2 text-capitalize">
                  {product.name}
                </h6>
                {/* <small className="card-text text-muted text-center d-block">Preparation time : 25min</small><br /> */}
                <small className="card-text text-center d-block">
                  Cost: <b className="text-danger"> &#8377;{product.price}</b>
                </small>
                <br />
                <div className="d-grid">
                  <button
                    className="btn bg-green fs-6 text-light mb-2 mx-2 fw-bold rubik rounded-pill d-block food"
                    disabled={!product.isAvailable}
                    onClick={() => {
                      addToCart(shopid, product.objId);
                      toast.success('Added to cart!');
                    }}
                  >
                    Order here
                  </button>
                </div>
                {product.isAvailable ? <span></span> :  <div className="corner-ribbon top-right sticky red open_sans fw-bold" style={{fontSize:"8.5px"}}>SOLD OUT</div>}

              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AllProducts;
