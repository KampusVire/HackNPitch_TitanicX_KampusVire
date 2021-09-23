import React, { useState } from "react";
import QrReader from 'react-qr-reader'
import {
  decryptMnemonicWithPasscode,
  retrieveAccountDetailsFromMnemonic,
  sendINR,
} from "./celo_functions";
import axios from "axios";
import { GRAPHQL_ENDPOINT } from "./config";
import moneyIcon from "./components/img/money.png";
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";
import { useHistory } from "react-router";


const QRScanPay = () => {
  const [details, setDetails] = useState("-1");
  let amount = 0;
  const history = useHistory()

  const sendCrypto = async () => {
    // sendINR
    var passcode = prompt("Enter your passcode to proceed : ");
    if (!passcode){
      toast.error("Passcode is required to proceed");
      return;
    };

    let decryptedMnemonic ;
    try {
      decryptedMnemonic =  await decryptMnemonicWithPasscode(
        localStorage.getItem("celoEncryptedMnemonic"),
        passcode
      );
    } catch (error) {
      toast.error("Wrong passcode");
      return;
    }
    console.log(decryptedMnemonic);
    const accountDetails = await retrieveAccountDetailsFromMnemonic(
      decryptedMnemonic
    );
    console.log(accountDetails);

    try {
      toast.success("Initiate transaction")
      var transactionReceipt = await sendINR(
        accountDetails.address,
        accountDetails.privateKey,
        details["celoAddress"],
        amount
      );
  
  
      if (transactionReceipt.status) {
        toast.success("Transaction Successful");
        history.push("/successtask")

        // alert("Transaction Successful");
      } else {
        toast.error("Transaction Failed");
        // alert("Transaction Failed");
      }
    } catch (error) {
      toast(
        "Check the address & also make sure you have sufficient balance in wallet",
        {
          duration: 6000,
        }
      );
      toast.error("Transaction Failed");
    }


  };

  const sendMoney = async () => {
    const token = localStorage.getItem("token");

    var data = JSON.stringify({
      query: `mutation($amount : Float!, $paymentType : String!, $toUserId : String!){
            transferMoney(amount : $amount, paymentType : $paymentType, toUserId : $toUserId){
              success
              message
              paymentType
              transactionId
              redirectPaymentPage
            }
          }`,
      variables: {
        amount: amount,
        paymentType: "virtualwallet",
        toUserId: details["id"],
      },
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
    if (response.data == undefined) {
      alert("Failed due to network issue");
      toast.error("Failed due to network issue");
      return;
    }

    var trxId = response.data.data.transferMoney.transactionId;
    console.log(trxId);

    var data = JSON.stringify({
      query: `mutation($transactionIds : [String]!, $transactionHash : [String]){
            processTransaction(transactionIds : $transactionIds, transactionHash : $transactionHash){
              totalTransactions
              successfulTransactions
              details
            }
          }`,
      variables: { transactionIds: [trxId] },
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
    // console.log(response)
    if (response.data == undefined) {
      return {};
    }

    if (
      response.data.data.processTransaction.totalTransactions !=
      response.data.data.processTransaction.successfulTransactions
    ) {
      // alert("Not sufficient balance in wallet. Please recharge");
      toast.error("Not sufficient balance in wallet. Please recharge")
      return;
    }

    toast.success("Transfer Successful")
    history.push("/successtask")
    // alert("Transaction successful");
  };

  return (
    <>
    <Navbar/>
      <Toaster
          position="top-right"
          reverseOrder={false}
      />
      {details == "-1" ? (
        <>
        <h3 className="text-center">Scan QR To Pay</h3>
        <QrReader
        facingMode="environment"
          delay={200}
          style={{ width: "100%", height: "100%" }}
          onError={() => {}}
          onScan={(data) => {
            
            if (data) {
              setDetails(JSON.parse(data));
            }
          }}
        />
        </>
      ) : (
        <div>
          <div className="container bg-green p-3 d-flex justify-content-around align-items-center">
            {/* <div className="bg-green profilePic mb-3" style="width: 6rem;">
                <img src="/img/user.jpg" className="img-fluid" />
            </div> */}
            <div className="txt-green open_sans fw-bold mx-1 fs-6 rounded bg-light p-2">
              <div className="border-bottom py-1">{details.name}</div>
              <div className="border-bottom py-1">{details.department} </div>
              <div className="border-bottom py-1">{details.year}</div>
            </div>
          </div>
          <div className="container mt-3">
            <img
              src={moneyIcon}
              className="w-50 img-fluid d-block mx-auto my-3"
              alt="..."
            />
            <label for="phoneNumber" className="form-label m-0 nunito_sans fs-5">
              Amount
            </label>
            <br />
            <small className="text-muted open_sans">
              Carefully Enter The Amount{" "}
            </small>
            <input
              type="number"
              className="form-control mt-2 fst-italic"
              id="phoneNumber"
              onChange={(e) => (amount = e.target.value)}
            />
          </div>

          <div className="d-grid gap-3 d-md-block container button2">
            <button
              className="btn bg-transparent text-uppercase txt-green"
              type="button"
              onClick={()=>{amount == 0 ? toast.error("Amount cannot be zero") : sendMoney()}}
            >
              virtual wallet
            </button>
            <button
              className="btn btn-success bg-green text-uppercase"
              type="button"
              onClick={()=>{amount == 0 ? toast.error("Amount cannot be zero") : sendCrypto()}}
            >
              crypto
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default QRScanPay;
