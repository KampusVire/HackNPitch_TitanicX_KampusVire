import React from 'react'
import { Link } from 'react-router-dom';
import { ENDPOINT } from '../config';

export default function Card(props) {
    return (
        <div className="card my-1 p-0 bg-light position-relative overflow-hidden" style={{ width: '48%' }}>
            <img src={ENDPOINT+"/media/"+props.picture} className="card-img-top" alt="Image Not available" style={{"height":"120px","objectFit":"cover"}} />
            <div className="card-body p-2">
                <h5 className="card-title text-center open_sans fw-bold">{props.shopName}</h5>
                {/* <small className="card-text text-muted text-center px-2 d-block">Avg. preparation time 25min</small><br /> */}
                <button className="btn bg-green mb-2 mx-auto d-block">
                    {/* Order here */}
                    <Link to={"/shop/" + props.shopID} className="text-decoration-none fs-6 text-light rubik fw-bold ">Order here</Link>
                </button>
            {/* <!-- Add this div to put busy corner ribbon --> */}
            {/* <div className="corner-ribbon top-right sticky red open_sans fw-bold">Busy</div> */}
            </div>
        </div>
    )
}
