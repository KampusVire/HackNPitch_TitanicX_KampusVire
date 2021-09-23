import React , {useEffect, useState} from 'react';
import { removeFromCart, updateQuantityCart, getAllProductsFromCart} from './shopping_function';
import { GRAPHQL_ENDPOINT, ENDPOINT } from './config';
import axios from 'axios';
import useRazorpay from "react-razorpay";
import { sendINR, decryptMnemonicWithPasscode, retrieveAccountDetailsFromMnemonic} from './celo_functions';
import "./components/cart.css";
import "./components/payment-confirmation.css";
import Navbar from './components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { useHistory } from 'react-router';
// import bootstrap from "bootstrap/dist/js/bootstrap";



function useForceUpdate(){
  let [value, setState] = useState(true);
  return () => setState(!value);
}    


const Cart = ()=>{


    const [products, setProducts] = useState([]);
    const [isPreorder, setIsPreorder] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const Razorpay = useRazorpay();
    var paymentType = "cash";
    var scheduledTime = (new Date()).toISOString();
    const history = useHistory()
    const forceUpdate = useForceUpdate();

    // "objId"
    // "name" 
    // "picture" 
    // "price"
    // "shop" 
    // "shopObjId" 
    // "quantity" 


    useEffect(async()=>{
        console.log("Cart effect");
        const data = await getAllProductsFromCart();
        var tmpPrice = 0;
        
        data.forEach(product=>{
            tmpPrice += product.price * product.quantity;
        })

        setTotalPrice(tmpPrice);
        setProducts(data);
    },[])



    const calulateTotal = ()=>{
        let tmpPrice = 0;
        products.forEach(product=>{
            tmpPrice += product.price * product.quantity;
        })
        setTotalPrice(tmpPrice);
    }


    const removeProduct = (index)=>{
        removeFromCart(products[index].shopObjId,products[index].objId); 
        var tmp = products.filter(e => e.objId != products[index].objId)
        setProducts([...tmp]);
        calulateTotal();
    }

    const incrementProductQuantity = (index)=>{
        var tmp = products;
        tmp[index].quantity = tmp[index].quantity + 1;
        updateQuantityCart(tmp[index].shopObjId, tmp[index].objId, tmp[index].quantity);
        setProducts([...tmp]);
        calulateTotal();
    }

    const decrementProductQuantity = (index)=>{
        var tmp = products;
        if(tmp[index].quantity == 1){
            removeProduct(index);
            return;
        }
        tmp[index].quantity = tmp[index].quantity - 1;
        updateQuantityCart(tmp[index].shopObjId, tmp[index].objId, tmp[index].quantity);
        setProducts([...tmp]);
        calulateTotal();
    }


    const hideModal = ()=>{
      // var modalPaymentUI = document.getElementById("sendCelo");
      // if(modalPaymentUI){
      //   var modal = bootstrap.Modal.getInstance(modalPaymentUI)
      //   // modal
      //   modal.hide()
      //   if(document.getElementsByClassName("modal-backdrop").length > 0){
      //     document.getElementsByClassName("modal-backdrop")[0].remove()
      //   }
      // }
    }

    const checkout = async()=>{
        if(products.length == 0){
            toast.error("Please add products to cart");                         
            return;
        }

        var cartDetailsJSON = JSON.parse(localStorage.getItem("cart")) ?? {};
        if(isPreorder && scheduledTime == "") return
            const token = localStorage.getItem('token');

            const dataToBeSubmit = {
                "cartData" : cartDetailsJSON,
                "isPreorder" : isPreorder,
                "paymentType" : paymentType,
                "scheduledTime" : scheduledTime ?? "" 
            }
    
            var data = JSON.stringify({
                query: `mutation($cartData:GenericScalar!, $isPreorder:Boolean!, $paymentType:String!, $scheduledTime:DateTime!){
                placeOrder(cartData : $cartData, isPreorder : $isPreorder, paymentType : $paymentType, scheduledTime : $scheduledTime){
                  success
                  message
                  orderPlaced
                  totalPrice
                  paymentType
                  transactionIds
                  redirectPaymentPage
                  prices
                  cryptoAddresses
                }
              }`,
                variables: dataToBeSubmit
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
            console.log(response.data.data.placeOrder);
            if (response.data == undefined){
                toast.error("Something went wrong. Please try again");
                return {};
            };


            if(response.data.data.placeOrder.success){
                console.log(response.data.data.placeOrder.paymentType)
                if(response.data.data.placeOrder.paymentType === "online"){
                    const options = {
                        key: "rzp_test_YYYJHE9VNyqobl", // Enter the Key ID generated from the Dashboard
                        amount: response.data.data.placeOrder.totalPrice*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                        currency: "INR",
                        name: "",
                        description: "Test Transaction",
                        // image: "https://example.com/your_logo",
                        handler: function (response) {
                            window.location.href = `${ENDPOINT}/api/verify/orderpayment/${response.razorpay_payment_id}/`
                        },
                        prefill: {
                          name: "",
                          contact: "",
                        },
                        notes: {
                            "TYPE" : "ORDERPAYMENT",
                            "TRANSACTIONS" : JSON.stringify(response.data.data.placeOrder.transactionIds)
                        },
                        theme: {
                          color: "#3399cc",
                        },
                      };
                    
                      const rzp1 = new Razorpay(options);
                      rzp1.on("payment.failed", function (response) {
                          toast.error(response.error.description);
                      });
                      rzp1.open();
                }

                else if(response.data.data.placeOrder.paymentType === "cash"){
                    toast.success("Your order has been placed. Payment will be processed soon");
                    console.log("Successful payment")
                    hideModal()
                    history.push("/successtask")
                }

                else if(response.data.data.placeOrder.paymentType === "virtualwallet"){
                    var data = JSON.stringify({
                        query: `mutation($transactionIds : [String]!, $transactionHash : [String]){
                        processTransaction(transactionIds : $transactionIds, transactionHash : $transactionHash){
                          totalTransactions
                          successfulTransactions
                          details
                        }
                      }`,
                        variables: {"transactionIds": response.data.data.placeOrder.transactionIds}
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
                    // console.log(response)
                    if (response.data == undefined){
                        return {};
                    };
                    if(response.data.data.processTransaction.totalTransactions != response.data.data.processTransaction.successfulTransactions){
                        response.data.data.processTransaction.details.forEach((trx)=>{
                            if(!trx["success"]){
                                console.log("hit")
                                toast.error(trx["error"]);
                                // alert(trx["error"])
                            }
                        })
                    }else{
                        toast.success("Your order has been placed. Payment will be processed soon");
                        console.log("Successful payment")
                        hideModal()
                        history.push("/successtask")
                    }

                }

                else if(response.data.data.placeOrder.paymentType === "crypto"){

                    console.log(response.data.data.placeOrder.prices)
                    var passcode = "";
                    var decryptedMnemonic;
                    let trasactionHashes = [];
                    while (passcode == "" || passcode == null) {
                        passcode = prompt("Enter your passcode ")
                        try{
                            if(passcode != ""){
                                decryptedMnemonic = await decryptMnemonicWithPasscode(localStorage.getItem("celoEncryptedMnemonic"),passcode);
                                console.log(decryptedMnemonic);
                            }
                        }catch{
                            toast.error("Invalid passcode");
                            console.log("Failed");
                            console.log(passcode);
                            passcode = "";
                        }
                    } 
                    try {
                        const accountDetails = await retrieveAccountDetailsFromMnemonic(decryptedMnemonic);
                        // TODO Check total price with balance
                        for (let i = 0; i < response.data.data.placeOrder.prices.length; i++) {
                            const price = response.data.data.placeOrder.prices[i];
                            const address = response.data.data.placeOrder.cryptoAddresses[i];
                            var transactionReceipt = await sendINR(accountDetails.address,accountDetails.privateKey, address, price);
                            console.log(JSON.stringify(transactionReceipt));
                            if(!transactionReceipt.status){
                                toast.error(transactionReceipt.error);
                                alert("Transaction Failed");
                                break;
                            }
                            trasactionHashes.push(transactionReceipt.transactionHash)
                        }



                        var data = JSON.stringify({
                            query: `mutation($transactionIds : [String]!, $transactionHash : [String]!){
                            processTransaction(transactionIds : $transactionIds, transactionHash : $transactionHash){
                              totalTransactions
                              successfulTransactions
                              details
                            }
                          }`,
                            variables: {
                                "transactionIds": response.data.data.placeOrder.transactionIds,
                                "transactionHash" : trasactionHashes
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

                        // console.log(response);
                    
                        var response = await axios(config);
                        console.log(response)
                        if (response.data == undefined){
                            return {};
                        };
                        if(response.data.data.processTransaction.totalTransactions != response.data.data.processTransaction.successfulTransactions){
                            response.data.data.processTransaction.details.forEach((trx)=>{
                                if(!trx["success"]){
                                    console.log("hit")
                                    toast.error(trx["error"]);
                                    // alert(trx["error"])
                                }
                            })
                        }else{
                            console.log("Successful payment")
                            toast.success("Your order has been placed. Payment will be processed soon");
                            hideModal()
                            history.push("/successtask")
                        }

                    } catch (error) {
                        passcode = ""
                    }
                }
            }


    }




    return (
        <div>
        <Navbar></Navbar>
        <Toaster
                position="top-right"
                reverseOrder={false}
        />
        <div id="reduceOpacity" className="opacity-100">
          <header>
            <h1>Your Cart</h1>
          </header>
  
          {products.length == 0 ? (
            <h2>Please add some product first</h2>
          ) : (
            <>
              <div className="items-list">
              {products.map((product, index) => {
              return (
                  <div className="item" key={index}>
                    <h3 className="item-name">{product.name}</h3>
                    <p className="item-cost"> Price per piece: {product.price}</p>
                    <p className="item-shop">{product.shop}</p>
                    <div className="item-qnty">
                      <button
                        className="subtract-buttonnnn item-qnty-buttonnnn"
                        onClick={() => {
                          decrementProductQuantity(index);
                        }}
                      >
                        -
                      </button>
                      <p>{product.quantity}</p>
                      <button
                        className="add-buttonnnn item-qnty-buttonnnn"
                        onClick={() => {
                          incrementProductQuantity(index);
                        }}
                      >
                        +
                      </button>
                      <div className="close-buttonnnn">
                        <button
                          onClick={() => {
                            removeProduct(index);
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
  
                    {/* <div className="prep-time">Prep time: 25min</div> */}
                    <div className="total">Rs {product.price*product.quantity}</div>
                  </div>
              );
            })}
              </div>
            </>
            
          )}
          <div className="total-amount-field">
            <div className="total-amount">
              <p>Total: Rs {totalPrice}</p>
            </div>
          </div>
  
          {/* <select
            onChange={(data) => (paymentType = data.target.value)}
            defaultValue="cash"
          >
            <option value="cash">Cash</option>
            <option value="virtualwallet">Virtual Wallet</option>
            <option value="online">Online</option>
            <option value="crypto">Crypto</option>
          </select> */}
          {/* <div className="payment-modes">
            <div className="dropdown">
              <button
                className="dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onChange={(data) => (console.log(data.target.value))}
                defaultValue="cash"
              >
                Choose mode of payment
              </button>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <a className="dropdown-item" href="#" value="cash">
                    Cash
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#" value="virtualwallet">
                    Virtual Wallet
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#" value="online">
                    Online
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#" value="crypto">
                    Crypto
                  </a>
                </li>
              </ul>
            </div>
          </div>
  
          <div>
            <select
              className="isPreorder"
              value={isPreorder ? 1 : 0}
              onChange={(data) => setIsPreorder(data.target.value == 1)}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div> */}
  
  
          {/* {isPreorder ? (
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(data) => (scheduledTime = data.target.value.toString())}
            />
          ) : (
            <span></span>
          )} */}
  
          <div className="buttonnnns">
            {/* <button className="button">Add More</button> */}
            <button className="buttonnnn buttonnnn--active" data-bs-toggle="modal" data-bs-target="#sendCelo">
              checkout
            </button>
          </div>
        </div>

        <div className="modal fade" id="sendCelo" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header pb-2 bg-light">
                    <h3 className=" nunito_sans m-0 fw-bold">Choose Preferred Options </h3>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body pt-0">
                    <label className="form-label mt-3">Payment Mode</label>
                    <select onChange={(data)=>paymentType=data.target.value} className="form-select" defaultValue="cash">
                        <option value="cash" >Cash</option>
                        <option value="virtualwallet">Virtual Wallet</option>
                        <option value="online">Online</option>
                        <option value="crypto">Crypto</option>
                    </select>
                    <label className="form-label mt-3">Do you place this order in advance ?</label>

                    <select value={isPreorder ? 1 : 0} className="form-select" onChange={(data)=>setIsPreorder(data.target.value==1)}>
                        <option value={1} >Yes</option>
                        <option value={0} >No</option>
                    </select>

                    {isPreorder ? <>                    <label className="form-label mt-3">Choose date & time of order</label>
<input className="form-control" type="datetime-local"  onChange={(data)=>scheduledTime = data.target.value.toString()}/></> :  <span></span>}
                </div>
                <div className="modal-footer border-0">
                    <div className="d-grid gap-2 d-md-block container">

                        <button type="button" className="btn bg-green text-light rubik" onClick={checkout} >Pay & Place Order</button>
                        <button type="button" className="btn bg-white txt-green rubik" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
      </div>
    );
}

export default Cart;                          


// <h3>total price : {totalPrice}</h3>
// <hr></hr>
// {products.length == 0 ? <h2>Please add some product first</h2> :
// products.map((product, index) =>{
//     return <div key={index}>
//         <h3>Name : {product.name}</h3>
//         <h4>Price : {product.price}</h4>
//         <h4>Shop Name : {product.shop}</h4>
//         <h4>Quantity : {product.quantity}</h4>
//         <button onClick={()=>{incrementProductQuantity(index)}}>Increase</button>
//         <button onClick={()=>{decrementProductQuantity(index)}}>Decrease</button>
//         <button onClick={()=>{removeProduct(index)}}>Remove from Cart</button>
//     </div>
// })}

// <hr></hr>
// <select onChange={(data)=>paymentType=data.target.value} defaultValue="cash">
//     <option value="cash" >Cash</option>
//     <option value="virtualwallet">Virtual Wallet</option>
//     <option value="online">Online</option>
//     <option value="crypto">Crypto</option>
// </select><br></br>
// <select value={isPreorder ? 1 : 0} onChange={(data)=>setIsPreorder(data.target.value==1)}>
//     <option value={1} >Yes</option>
//     <option value={0} >No</option>
// </select><br></br>

// {isPreorder ? <input  type="datetime-local" value={scheduledTime} onChange={(data)=>scheduledTime = data.target.value.toString()}/> :  <span></span>}
// <br></br>
// <button onClick={checkout}>Checkout</button>