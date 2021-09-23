import {Route,Switch,Redirect } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginUser from './login';
import RegisterUser from './register';
import AllShops from './shops';
import AllProducts from './products';
import Cart from './cart';
import Home from './home';
import VirtualWallet from './virtualwallet';
import CryptoWallet from './cryptowallet';
import QRScanPay from './qrscanpay';
// import OrderList from './orderList';
import BorrowMoney from './borrowMoney';
import BorrowedToLog from './borrowedToLog';
import BorrowedFromLog from './borrowedFromLog';
import TransactionLog from './transaction_log';
import OrderLog from './orderLog';
import AddProduct from './addProduct';
import SuccessPage from './successPage';
import ErrorPage from './errorPage';
import AllProductsShop from './allProductsShop';

function App() {
  var apiToken = localStorage.getItem('token') ?? "-1";
  var isShop = localStorage.getItem('isShop');
  console.log(isShop);
  if(apiToken == "-1"){
    return (
      <>
      <Router>
        <Switch>
          <Route path="/" exact component={LoginUser} />
          <Route path="/register" exact component={RegisterUser} />
        </Switch>
      </Router>

      </>
    );
  }

  if(isShop == "true"){
    return (
      <>
      <Router>
        <Switch>
          {/* <Route exact path="/" component={()=> <About name="Tanmoy"/>} /> */}
          <Route path="/" exact component={Home} />
          <Route path="/virtualwallet" exact component={VirtualWallet} />
          <Route path="/cryptowallet" exact component={CryptoWallet} />
          <Route path="/qrpay" exact component={QRScanPay} />
          {/* <Route path="/orders" exact component={OrderList} /> */}
          <Route path="/borrowmoney" exact component={BorrowMoney} />
          <Route path="/borrowedtolog" exact component={BorrowedToLog} /> 
          <Route path="/borrowedfromlog" exact component={BorrowedFromLog} />
          <Route path="/transactionlog" exact component={TransactionLog} />
          <Route path="/orders" exact component={OrderLog} />
          <Route path="/addproduct" exact component={AddProduct} />
          <Route path="/successtask" exact component={SuccessPage} />
          <Route path="/errortask" exact component={ErrorPage} />
          <Route path="/allproducts" exact component={AllProductsShop} />
        </Switch>
      </Router>
      </>
    );
  }else{
    return (
      <>
      <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/shops" exact component={AllShops} />
        <Route path="/shop/:shopid" exact component={AllProducts} />
        <Route path="/cart" exact component={Cart} />
        <Route path="/virtualwallet" exact component={VirtualWallet} />
        <Route path="/cryptowallet" exact component={CryptoWallet} />
        <Route path="/qrpay" exact component={QRScanPay} />
        {/* <Route path="/orders" exact component={OrderList} /> */}
        <Route path="/borrowmoney" exact component={BorrowMoney} />
        <Route path="/borrowedtolog" exact component={BorrowedToLog} /> 
        <Route path="/borrowedfromlog" exact component={BorrowedFromLog} />
        <Route path="/transactionlog" exact component={TransactionLog} />
        <Route path="/orders" exact component={OrderLog} />
        <Route path="/successtask" exact component={SuccessPage} />
        <Route path="/errortask" exact component={ErrorPage} />
      </Switch>
      </Router>
      </>
    );
  }


}

export default App;
