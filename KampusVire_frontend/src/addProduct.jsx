import axios from "axios";
import {ENDPOINT, GRAPHQL_ENDPOINT} from "./config";
import React from "react";
import toast, { Toaster } from 'react-hot-toast';
import FormData from "form-data";

const AddProduct = ()=>{
    let productName = "";
    let perPlateCost = 0;
    let imageOfProduct ;
    const token = localStorage.getItem('token');

    const addProductFunc = async()=>{
        let filenamefromserver = "";

        if(productName=="" || !productName){
            toast.error("Enter Product Name")
            return;
        }

        if(perPlateCost==0 || !perPlateCost){
            toast.error("Enter Per Plate Cost")
            return;
        }

        if(!imageOfProduct){
            toast.error("Choose a image please")
            return;
        }


        toast('Uploading image !',
        {
          icon: '🖼️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }
      );

      var data = new FormData();
        data.append('file', imageOfProduct, imageOfProduct.name);

        var config = {
            method: 'post',
            url: ENDPOINT+'/api/upload/',
            headers: { },
            data : data
        };

        var responseUpload = await  axios(config) 
        if(!responseUpload){
            toast.error("Failed to upload")
            return;
        }

        if(responseUpload.data["success"]){
            toast.success("Uploaded successfully")
            filenamefromserver = responseUpload.data["file"]

        }
        else{
            toast.error("Upload failed")
            return;
        }

        console.log(filenamefromserver)
        var data = JSON.stringify({
            query: `mutation($name : String!, $picture : String!, $price : Float!, $isAvailable : Boolean!){
            addProduct(name : $name, picture : $picture, price : $price, isAvailable : $isAvailable){
              success
              message
              error
              product{
                id
                objId
                name
                picture
                price
                isAvailable
              }
            }
          }`,
            variables: {"name":productName,"picture": filenamefromserver,"price": perPlateCost,"isAvailable":true}
          });
          
          toast.success("Submitting...")
        

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
            return;
        };

        toast.success("Successfully Registered")
    }


 return (<>
     <Toaster
        position="top-right"
        reverseOrder={false}
    />
    <h1 className="text-center header my-5 py-3">Kampus Vire</h1>

    <div className="my-5 container">
        <div className="fs-3 nunito_sans px-3 text-uppercase mb-5 fw-bold text-center">Add Menu</div>
        <form>
            <div className="mb-3 px-3">
                <label for="menu" className="form-label m-0 mb-2 nunito_sans fs-5">Product Name</label><br />
                <input type="text" className="form-control text-muted open_sans fst-italic fs-6 py-2" placeholder="Name of Your Menu" id="menu" onInput={(e)=>productName=e.target.value} />
            </div>
            <div className="mb-4 px-3">
                <label for="cost" className="form-label m-0 mb-2 nunito_sans fs-5">Per Plate Cost(in &#8377;)</label><br />
                <input type="number" className="form-control text-muted open_sans fst-italic fs-6 py-2" placeholder="Enter the per plate cost" id="cost" onInput={(e)=>perPlateCost=e.target.value}/>
            </div>
            {/* <div className="container bg-light d-flex align-items-center justify-content-center" style={{height: "15rem" , width: "90%"}}>
                <h1 className="nunito_sans text-uppercase w-75 text-center">Click to add photo</h1>
            </div>     */}
            <div className="mb-4 px-3">
                <label for="formFileLg" className="form-label m-0 mb-2 nunito_sans fs-5">Upload Image</label>
                <input className="form-control " id="formFileLg" type="file" onChange={(e)=>imageOfProduct=e.target.files[0]} accept="image/png, image/jpeg, image/jpg" multiple={false} />
            </div>
            
        </form>
    </div>
    <div className="d-grid gap-2 d-md-block container ">
        <button className="btn btn-success bg-green text-uppercase" type="button" onClick={addProductFunc} >Submit</button>
    </div>
 </>)   
}

export default AddProduct;