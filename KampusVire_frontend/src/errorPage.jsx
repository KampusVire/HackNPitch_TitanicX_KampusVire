import React from "react";
import { Link } from "react-router-dom";
import "./components/fail.css";

const ErrorPage = () => {
  function removeElementsByClass(className){
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

removeElementsByClass("modal-backdrop")
document.body.classList.remove("modal-open");
document.body.style = null;

  return (
    <>
      <div id="orderconfirmation">
        <div id="balloon">
          <div className="failballoon"></div>
          <div className="failbasket"></div>
          <div className="cloud"></div>
        </div>
      </div>
      <div className="container rubik text-danger">
        <div className="text-uppercase fs-1 text-center">
          <i className="fas fa-times-circle"  style={{fontSize : "6rem"}}></i>
          <br />
          <p className="mt-3">Your request has been failed</p>
        </div>
      </div>
      <div className="d-grid gap-2 d-md-block container button mt-5">
        <Link
        to="/"
          className="btn btn-danger nunito_sans fw-bold text-uppercase"
          type="button"
        >
          Back to home
        </Link>
      </div>{" "}
    </>
  );
};

export default ErrorPage;
