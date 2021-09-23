const axios = require('axios');
let data = JSON.stringify({
  query: `query($shopId : Int!){
  allProducts(shopId : $shopId){
    pageInfo{
      startCursor
      endCursor
      hasPreviousPage
      hasNextPage
    }
    edges{
      cursor
      node{
        id
        objId
        name
        picture
        price
        isAvailable
      }
    }
  }
}`,
  variables: {"shopId":2}
});

let config = {
  method: 'get',
  url: 'http://ec2-13-126-181-62.ap-south-1.compute.amazonaws.com:8000/graphql',
  headers: { 
    'Authorization': 'Bearer OW7MTJIOJ8V0SCJ4O8IKWXNTFMZT7SGTCUA34LXDV3OP65B3Q8', 
    'Content-Type': 'application/json', 
    'Cookie': 'csrftoken=2GdH9SbOd0MjI8zxk6Q4LNCNkEk98bQQ0iODBDci0sZI7N1ePeyJ68lEAPUsyq2L'
  },
  data : data
};



axios(config)
.then((response) => {
    response.data["data"]["allProducts"]["edges"].forEach(element => {
      console.log(element["node"]["name"]);
  });
})

.catch((error) => {
  console.log(error);
});
