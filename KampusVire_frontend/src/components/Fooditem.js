import React from 'react'
import { ENDPOINT, GRAPHQL_ENDPOINT } from '../config';

export default function Fooditem(props) {
    return (
        <div className="card  m-1 p-0 bg-light" style={{width:'47%'}}>
                <img src={ENDPOINT+ "/media/" + props.Img} className="card-img-top" />
                <div className="card-body p-1">
                  <h6 className="card-title text-center open_sans fw-bold m-0 text-capitalize">{props.productName}</h6>
                  <small className="card-text text-muted text-center d-block">Preparation time : 25min</small><br />
                  <small className="card-text text-center d-block">Cost: <b className="text-danger"> &#8377;{props.productPrice}</b></small><br />
                  <div className="d-grid">
                      <button className="btn bg-green fs-6 text-light mb-2 mx-2 fw-bold rubik rounded-pill d-block food">
                          Order here
                        </button>
                    </div>
                    <div className="corner-ribbon top-right sticky red open_sans fw-bold">Busy</div>
                </div>
            </div>
    )
}

