import axios from "axios"
import {GRAPHQL_ENDPOINT} from "./config"

const getBalance = async()=>{
    const token = localStorage.getItem("token");
    var axios = require('axios');
var data = JSON.stringify({
  query: `query{
  baseProfileDetails{
        objId
        walletBalance
  }
}`,
  variables: {}
});

var config = {
    method: 'post',
    url: GRAPHQL_ENDPOINT,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    data: data
};

var response = await axios(config)
return {
    "balance" : response.data.data.baseProfileDetails.walletBalance,
    "objId" : response.data.data.baseProfileDetails.objId
};   
}

export {
    getBalance
}