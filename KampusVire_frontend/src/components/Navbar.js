import React from 'react'
import './navMenu.css'
import './common.css'
import pic from './img/user.jpg'
import icon from './img/icon.png'
import { Link } from 'react-router-dom'
import {logout} from "../logout";


export default function Navbar() {


    const isShop = localStorage.getItem('isShop');


    const show = ()=> {
        let checkBox = document.getElementById(`checkBox`);
        let sideBar = document.getElementById(`sideMenu`);
        if (checkBox.checked == true) {
          sideBar.classList.remove("hide");
          sideBar.classList.add("show");
          if(document.getElementById('reduceOpacity')){
            document.getElementById('reduceOpacity').classList.add("opacity-50");
          }
          if(document.getElementById('reduceOpacity')){
            document.getElementById('reduceOpacity').classList.remove("opacity-100");
          }
        
        } else {
          sideBar.classList.remove("show");
          sideBar.classList.add("hide");
          if(document.getElementById('reduceOpacity')){
            document.getElementById('reduceOpacity').classList.add("opacity-100");
          }

          if(document.getElementById('reduceOpacity')){
            document.getElementById('reduceOpacity').classList.remove("opacity-500");
          }
    
        }
      }
    
    
    return (
        <>
            <nav className="navbar navbar-dark bg-green sticky-top">
                <input type="checkbox" className="toggler" id="checkBox" onClick={show} />
                <div className="hamburger">
                    <div></div>
                </div>
                <div className="position-absolute end-50 w-25">
                   <Link to="/"> <img src={icon}  height="30px" /></Link>
                </div>
                {isShop != "true" ? <Link to="/cart"><i className="fas fa-shopping-cart mx-3 text-light fs-3"></i></Link> : <span></span>}
                
            </nav>
            <div className="sidebar hide" id="sideMenu">
                {/* <div className="profileInfo p-4 bg-green">
                    <div className="bg-green profilePic mb-3">
                        <img src={pic} className="float-start" />
                    </div>
                    <div className="nunito_sans text-light fs-5 lh-1">
                        <b className="mb-2 d-block">Sumanshu Kumar Shaw</b>
                        <small>
                            Prince on the streets and a freak in the sheets &#127773; &#127770; &#127773;
                        </small>

                    </div>
                </div> */}

                <header className="bg-green rubik fs-1 p-3 d-flex" style={{justifyContent:"space-between", flexDirection : "row"}}><span>Your Options</span><a onClick={logout}><i className="fas fa-sign-out-alt"></i></a></header>
                {isShop != "true" ? <>
                    <Link className="text-decoration-none text-dark fs-5 rubik" to="/shops" ><li>All Shops</li></Link>
                    <Link className="text-decoration-none text-dark fs-5 rubik" to="/virtualwallet"><li>Virtual Wallet</li></Link>
                    <Link className="text-decoration-none text-dark fs-5 rubik" to="/cryptowallet"><li>Crypto Wallet</li></Link>
                    <Link className="text-decoration-none text-dark fs-5 rubik" to="/transactionlog"><li>All Transactions</li></Link>
                    <Link className="text-decoration-none text-dark fs-5 rubik" to="/orders"><li>Orders</li></Link>
                    <Link className="text-decoration-none text-dark fs-5 rubik" to="/borrowmoney"><li>Borrow Money</li></Link>
                    <Link className="text-decoration-none text-dark fs-5 rubik" to="/borrowedtolog"><li>Borrowed To Log</li></Link>
                    <Link className="text-decoration-none text-dark fs-5 rubik" to="/borrowedfromlog"><li>Borrowed From Log</li></Link>
                </> : <>
                <ul>
                    <li><Link className="text-decoration-none text-dark fs-5 rubik" to="/allproducts" ><li>All Products</li></Link></li>
                    <li><Link className="text-decoration-none text-dark fs-5 rubik" to="/addproduct"><li>Add Product</li></Link></li>
                    <li><Link className="text-decoration-none text-dark fs-5 rubik" to="/virtualwallet"><li>Virtual Wallet</li></Link></li>
                    <li><Link className="text-decoration-none text-dark fs-5 rubik" to="/cryptowallet"><li>Crypto Wallet</li></Link></li>
                    <li><Link className="text-decoration-none text-dark fs-5 rubik" to="/transactionlog"><li>All Transactions</li></Link></li>
                    <li><Link className="text-decoration-none text-dark fs-5 rubik" to="/orders"><li>Orders</li></Link></li>
                    <li><Link className="text-decoration-none text-dark fs-5 rubik" to="/borrowmoney"><li>Borrow Money</li></Link></li>
                    <li><Link className="text-decoration-none text-dark fs-5 rubik" to="/borrowedtolog"><li>Borrowed To Log</li></Link></li>
                    <li><Link className="text-decoration-none text-dark fs-5 rubik" to="/borrowedfromlog"><li>Borrowed From Log</li></Link></li>
                  </ul>
                </> }

            </div>
            {/* <!--Modal For Seach  --> */}
            <div className="modal fade" id="searchModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title rubik" id="exampleModalLabel">Search For</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <input type="text" className="form-control open_sans fst-italic text-muted" id="recipient-name" />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <div className="d-grid gap-2 d-md-block container">
                                <button className="btn btn-success bg-green nunito_sans fw-bold" type="button">Search Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
