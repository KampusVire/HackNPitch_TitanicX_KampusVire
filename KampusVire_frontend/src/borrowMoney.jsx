import axios from "axios";
import {GRAPHQL_ENDPOINT} from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QrReader from 'react-qr-reader'
import icon from "./components/img/icon.png"
import Navbar from "./components/Navbar";
import toast, { Toaster } from 'react-hot-toast';
import { Redirect } from "react-router";
import { useHistory } from "react-router";


const BorrowMoney = ()=>{
    const [details, setDetails] = useState("-1")
    let amount = 0;
    let description = "Borrowing"
    const history = useHistory()


    const borrowMoney = async()=>{
        if(amount == 0){
            toast.error("Amount cannot be 0")
            return;
        }

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
      const token = localStorage.getItem('token');
        var data = JSON.stringify({
            query: `mutation($userIdTo : String!, $amount : Float!, $description : String!){
            borrowInitiate(userIdTo : $userIdTo, amount : $amount, description : $description){
              success
              message
              error
            }
          }`,
            variables: {"userIdTo":details["id"],"amount":amount,"description":description}
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
            toast.error("Failed due to network issue")
            return {};
        };
        toast.success("Successfully Borrowed")
        history.push("/successtask")
    }

    return (<>
    <Navbar/>
    <Toaster
        position="top-right"
        reverseOrder={false}
    />
    <div>{
          details == "-1" ? (
                <>
                <div className="container mb-5 text-center mt-5">
                    <h5 className="mb-5">Scan the QR code of the user from whom you want to borrow</h5>
                        <QrReader
                        facingMode = "environment"
                        delay={200}
                        style={{width: '100%', height: '100%'}}
                        onError={() => {}}
                        onLoad
                        onScan={(data) => {
                            console.log(data)
                            if (data){
                                setDetails(JSON.parse(data))
                            }
                        }}
                />
                </div>

                </>

            ) : (
                <div>
                <h1 className="text-center open_sans fw-bold txt-green">Borrow Money</h1>
                <div className="container w-50 mt-5">
                    <p>Name : {details["name"]}</p>
                    {details["department"] ? <p>Department : {details["department"]}</p> : <span></span>}
                    {details["year"] ? <p>Year : {details["year"]}</p> : <span></span>} 
                    {/* <img className="img-fluid p-2" src ="/img/user.jpg"></img> */}
                </div>
                <div className="container px-3 mt-3">
                    <label htmlFor="amoount" className="form-label m-0 nunito_sans fs-5">Amount</label><br />
                    <small className="text-muted open_sans">Carefully Enter The Amount </small>
                    <input  className="form-control mt-2 fst-italic"  type="number" placeholder="Enter amount" onInput={(e)=>amount=e.target.value}/>
                </div>
                <div className="container px-3 mt-3">
                    <label htmlFor="description" className="form-label m-0 nunito_sans fs-5">Description</label><br />
                    <input className="form-control mt-2 fst-italic" id="description" type="text"  defaultValue="Borrowing" onInput={(e)=>description=e.target.value} />
                </div>
                
                <div className="d-grid gap-2 d-md-block container button">
                    <button className="btn btn-success bg-green text-uppercase" type="button" onClick={borrowMoney}>Borrow</button>
                </div>


                </div>
            )}

    </div>
    </>);
}

export default BorrowMoney;