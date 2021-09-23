import axios from "axios";
import {GRAPHQL_ENDPOINT} from "./config";
import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import toast, { Toaster } from 'react-hot-toast';
import "./components/transaction_card.css";

const TransactionLog = ()=>{
    const [transactions, setTransactions] = useState([]);
    let loaded = false;
    const userId = localStorage.getItem("id");

    const loadTransaction = async()=>{
        const token = localStorage.getItem('token');
        var data = JSON.stringify({
            query: `query($queryType : String!, $status : String, $paymentType : String, $category : String){
           transactionLogs(queryType : $queryType,status : $status, paymentType : $paymentType,category : $category){
            edges{
              node{
                paymentId
                paymentType
                amount
                description
                status
                transactionTime
                sender{
                  isShop
                  objId
                  studentProfile{
                    name
                    collegeName
                    department
                    year
                  }
                  shopProfile{
                    objId
                    name
                  }
                }
                receiver{
                    isShop
                    objId
                    studentProfile{
                        name
                        collegeName
                        department
                        year
                    }
                    shopProfile{
                        objId
                        name
                    }
                }
              }
            }
          } 
          }`,
            variables: {"queryType":"all"}
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
        loaded = true;
        setTransactions(response.data.data.transactionLogs.edges);
        toast.success("Transaction logs loaded successfully");
        console.log(response.data.data.transactionLogs.edges);
    }

    useEffect(()=>{
        toast.success("Loading...")
        loadTransaction()
    },[])

    return (
        <>
        <Navbar/>
        <Toaster
            position="top-right"
            reverseOrder={false}
        />
        <div className="card2s">
        {transactions.map((transaction, index)=>{
            return (
                <>
                <div className={transaction.node.status == "PENDING" ? "card2 pending"  :  transaction.node.status == "FAILED" ? "card2 failed" :  transaction.node.status == "COMPLETED" ? "card2 success" : "card2" } >
                <div className="icon-div">
                 {
                     transaction.node.paymentType == "CASH" ?
                     <i className="icon far fa-money-bill-alt"></i>
                    :
                    transaction.node.paymentType == "ONLINE" || transaction.node.paymentType == "VIRTUALWALLET" ?
                    <i className="icon fas fa-wallet"></i>
                    :
                    transaction.node.paymentType == "CRYPTO" ?
                    <img src="https://avatars.githubusercontent.com/u/37552875?s=200&v=4" height="30px" />
                    :  <span></span>
                 }

                </div>
                <div className="name">
                    {transaction.node.sender.objId != userId ? (transaction.node.sender.isShop ? transaction.node.sender.shopProfile.name : transaction.node.sender.studentProfile.name) : (transaction.node.receiver.isShop ? transaction.node.receiver.shopProfile.name : transaction.node.receiver.studentProfile.name) }
                </div>
                <div className="details">
                    Details : {transaction.node.description}
                </div>
                <div className="amount">
                    Amount : Rs {transaction.node.amount} 
                    {transaction.node.sender.objId == userId ?  <span className="arrow-up"><i className="fas fa-arrow-up"></i></span> :  <span className="arrow-down"><i className="fas fa-arrow-down"></i></span>}
                </div>
                <div className="payment-id">
                    Payment ID : {transaction.node.paymentId}
                </div>
                <div className="date-time">
                Transaction time : {transaction.node.transactionTime ?? ""}
                </div>

                {/* <a>Paymenbt id : {transaction.node.paymentId}</a><br></br>
                <a>Amount : {transaction.node.amount}</a><br></br>
                <a>Description : {transaction.node.description}</a><br></br>
                <a>Status : {transaction.node.status}</a><br></br>
                <a>Transaction time : {transaction.node.transactionTime}</a><br></br>
                {transaction.node.status}
                {
                    transaction.node.sender.isShop ?
                    <>
                    <a>Sender : {transaction.node.sender.shopProfile.name}</a><br></br>
                    </>
                    :
                    <>
                    <a>Sender : {transaction.node.sender.studentProfile.name}</a><br></br>
                    </>
                } */}
                </div>
                </>
            )
        })}

        </div>

        </>
    );
}

export default TransactionLog;