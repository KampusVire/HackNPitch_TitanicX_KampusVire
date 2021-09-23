import axios from "axios";
import { GRAPHQL_ENDPOINT } from "./config";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";

const BorrowedFromLog = () => {
  const [log, setLog] = useState([]);

  const loadLogs = async () => {
      // TODO paid toogle button 
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
                    sender{
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
      variables: { borrowType: "from", paid: false },
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

  


  useEffect(() => {
    if (log != []) {
      loadLogs();
    }
  }, []);


  return (
    <>
         <div>
        <Navbar />
        <h1 className="text-center open_sans fw-bold mt-3  mb-3">
          Borrowed From 
        </h1>
        <div className="container mt-3">
          { log.length == 0 ? <><img src="https://giantsmeet.s3.ap-south-1.amazonaws.com/1632408733720e849be0c2809ab71bf24a192ddea07a6.png" width="100%" className="px-1 mt-5"/><h2 className="txt-green w-100 text-center">No Transaction Yet</h2></> : log.map((snbrw) => {
            return (
              <>
              <div className="p-3 border rounded bg-light my-2" key={snbrw["node"]["objId"]}>
              {snbrw["node"]["sender"]["isShop"] ? (
                    <>
                      <div>
                        <div className="row py-1">
                          <div className="col">Name : </div>
                          <div className="col">{snbrw["node"]["sender"]["shopProfile"]["name"]}</div>
                        </div>
                        <div className="row py-1">
                          <div className="col">Phoneno : </div>
                          <div className="col">{snbrw["node"]["sender"]["shopProfile"]["phoneNo"]}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                      <div className="row py-1">
                        <div className="col">Name : </div>
                        <div className="col">{snbrw["node"]["sender"]["studentProfile"]["name"]}</div>
                      </div>
                      <div className="row py-1">
                        <div className="col">Phoneno : </div>
                        <div className="col">{snbrw["node"]["sender"]["studentProfile"]["phoneNo"]}</div>
                      </div>
                      <div className="row py-1">
                        <div className="col">Department : </div>
                        <div className="col">{snbrw["node"]["sender"]["studentProfile"]["department"]}</div>
                      </div>
                      <div className="row py-1">
                        <div className="col">Year : </div>
                        <div className="col">{snbrw["node"]["sender"]["studentProfile"]["year"]}</div>
                      </div>
                      <div className="row py-1">
                        <div className="col">Roll no : </div>
                        <div className="col">{snbrw["node"]["sender"]["studentProfile"]["rollNo"]}</div>
                      </div>
                      </div>
                    </>
                  )}


                <div className="row py-1 pt-2 text-danger border-top">
                  <div className="col fw-bold text-uppercase ">Amount : </div>
                  <div className="col ">&#8377; {snbrw["node"]["amount"]}</div>
                </div>
                <div className="row py-1 text-danger ">
                  <div className="col fw-bold text-uppercase ">Reason : </div>
                  <div className="col ">{snbrw["node"]["description"]}</div>
                </div>
                <div className="row py-1 pb-2 text-danger border-bottom">
                  <div className="col fw-bold text-uppercase ">Borrowed on : </div>
                  <div className="col ">{snbrw["node"]["borrowedOn"]}</div>
                </div>
                <div className="row py-1 mt-3 text-center">
                  {/* <div className="col">
                    <button type="button" className="btn bg-green text-light rubik w-75" onClick={()=>{makePaid(snbrw["node"]["objId"])}}>Make Paid</button>
                  </div> */}
                  <div className="col">
                    <a type="button" className="btn btn-outline-success rubik w-75" href={snbrw["node"]["sender"]["isShop"] ? "tel:"+ snbrw["node"]["sender"]["shopProfile"]["phoneNo"] : "tel:"+ snbrw["node"]["sender"]["studentProfile"]["phoneNo"] }>Call</a>
                  </div>
                </div>
              </div>
              </>
            );
          })}
        </div>
      </div>
      </>)
};

export default BorrowedFromLog;
