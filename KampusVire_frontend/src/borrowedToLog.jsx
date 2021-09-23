import axios from "axios";
import { GRAPHQL_ENDPOINT } from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import toast, { Toaster } from 'react-hot-toast';

const BorrowedToLog = () => {
  const [log, setLog] = useState([]);

  const loadLogs = async () => {
    const token = localStorage.getItem("token");
    var data = JSON.stringify({
      query: `query($borrowType : String!, $paid : Boolean!){
            borrowDetails(borrowType : $borrowType, paid : $paid){
                edges{
                node{
                    objId
                    amount
                    description
                    isPaid
                    borrowedOn
                    returnedOn
                    receiver{
                        isShop
                        studentProfile{
                            name
                            department
                            year
                            rollNo
                            phoneNo
                        }
                        shopProfile{
                            objId
                            name
                            phoneNo
                        }
                    }
                }
                }
            }
            }`,
      variables: { borrowType: "to", paid: false },
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
      return {};
    }
    console.log(response.data.data.borrowDetails.edges);
    setLog(response.data.data.borrowDetails.edges);
  };

  const makePaid = async (id) => {
    toast('Wait a bit!',
    {
      icon: '👏',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    })
    const token = localStorage.getItem("token");
    var data = JSON.stringify({
      query: `mutation($borrowId : String!){
        borrowPaid(borrowId : $borrowId){
          success
          message
          error
        }
      }`,
      variables: { borrowId: id },
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
      toast.error('Failed due to network issue');
      return;
    }

    console.log(response);
    toast.success('Successfully Changed');
  };

  useEffect(() => {
    if (log != []) {
      loadLogs();
    }
  }, []);

  return (
    <>

      <div>
        <Navbar />
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
        <h1 className="text-center open_sans fw-bold  mt-4 mb-4">
          Borrowed To
        </h1>
        <div className="container mt-3">
          {log.length == 0 ? <><img src="https://giantsmeet.s3.ap-south-1.amazonaws.com/1632408733720e849be0c2809ab71bf24a192ddea07a6.png" width="100%" className="px-1 mt-5"/><h2 className="txt-green w-100 text-center">No Transaction Yet</h2></> :  log.map((snbrw) => {
            return (
              <>
              <div className="p-3 border rounded bg-light my-2" key={snbrw["node"]["objId"]}>
              {snbrw["node"]["receiver"]["isShop"] ? (
                    <>
                      <div>
                        <div className="row py-1">
                          <div className="col">Name : </div>
                          <div className="col">{snbrw["node"]["receiver"]["shopProfile"]["name"]}</div>
                        </div>
                        <div className="row py-1">
                          <div className="col">Phoneno : </div>
                          <div className="col">{snbrw["node"]["receiver"]["shopProfile"]["phoneNo"]}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                      <div className="row py-1">
                        <div className="col">Name : </div>
                        <div className="col">{snbrw["node"]["receiver"]["studentProfile"]["name"]}</div>
                      </div>
                      <div className="row py-1">
                        <div className="col">Phoneno : </div>
                        <div className="col">{snbrw["node"]["receiver"]["studentProfile"]["phoneNo"]}</div>
                      </div>
                      <div className="row py-1">
                        <div className="col">Department : </div>
                        <div className="col">{snbrw["node"]["receiver"]["studentProfile"]["department"]}</div>
                      </div>
                      <div className="row py-1">
                        <div className="col">Year : </div>
                        <div className="col">{snbrw["node"]["receiver"]["studentProfile"]["year"]}</div>
                      </div>
                      <div className="row py-1">
                        <div className="col">Roll no : </div>
                        <div className="col">{snbrw["node"]["receiver"]["studentProfile"]["rollNo"]}</div>
                      </div>
                      </div>
                    </>
                  )}


                <div className="row py-1 text-danger border-top">
                  <div className="col fw-bold text-uppercase ">Amount : </div>
                  <div className="col ">&#8377; {snbrw["node"]["amount"]}</div>
                </div>
                <div className="row py-1 text-danger border-bottom">
                  <div className="col fw-bold text-uppercase ">Reason : </div>
                  <div className="col ">{snbrw["node"]["description"]}</div>
                </div>
                <div className="row py-1 text-danger border-bottom">
                  <div className="col fw-bold text-uppercase ">Borrowed on : </div>
                  <div className="col ">{snbrw["node"]["borrowedOn"]}</div>
                </div>
                <div className="row py-1 mt-3">
                  <div className="col">
                    <button type="button" className="btn bg-green text-light rubik w-75" onClick={()=>{makePaid(snbrw["node"]["objId"])}}>Make Paid</button>
                  </div>
                  <div className="col">
                    <a type="button" className="btn btn-outline-success rubik w-75" href={snbrw["node"]["receiver"]["isShop"] ? "tel:"+ snbrw["node"]["receiver"]["shopProfile"]["phoneNo"] : "tel:"+ snbrw["node"]["receiver"]["studentProfile"]["phoneNo"] }>Call</a>
                  </div>
                </div>
              </div>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BorrowedToLog;
