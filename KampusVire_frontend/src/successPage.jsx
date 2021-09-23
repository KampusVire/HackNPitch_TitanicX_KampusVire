import React from "react";
import "./components/confirm.css";
import { Link } from "react-router-dom";

const SuccessPage = () => {

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
          <div className="balloon"></div>
          <div className="basket"></div>
          <div className="cloud"></div>
        </div>
      </div>
      <div className="container rubik txt-green">
        <div className="text-uppercase fs-1 text-center">
          <i className="far fa-check-circle" style={{fontSize : "6rem"}}></i>
          <br />
          <p className="mt-3">Your request has been processed</p>
        </div>
      </div>
      <div className="d-grid gap-2 d-md-block container button mt-5">
        <Link
        to="/"
          className="btn btn-success bg-green nunito_sans fw-bold text-uppercase"
          type="button"
        >
          Back to home
        </Link>
      </div>{" "}
    </>
  );
};

export default SuccessPage;
