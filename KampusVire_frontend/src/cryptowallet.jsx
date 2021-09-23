import React, { useEffect, useState } from "react";
import {
  getBalanceByAddress,
  sendINR,
  decryptMnemonicWithPasscode,
  retrieveAccountDetailsFromMnemonic,
} from "./celo_functions";
import BigNumber from "bignumber.js";
import { useHistory } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

const CryptoWallet = () => {
  const celoAddress = localStorage.getItem("celoAddress");
  const [balance, setBalance] = useState("...");
  const [amounToBeSent, setAmounToBeSent] = useState(0);
  const [receiverCeloAddress, setReceiverCeloAddress] = useState("");
  const history = useHistory();
  let working = false;

  useEffect(() => {
    refreshBalance();
  }, []);

  const refreshBalance = async () => {
    const oneDollar = new BigNumber("1e18");
    const tmp = await getBalanceByAddress(celoAddress);
    setBalance(tmp.dividedBy(oneDollar).toString());
  };

  const sendCrypto = async () => {
    if (working) return;
    // sendINR
    if (amounToBeSent == 0) {
      toast.error("Amount can't be 0");
      return;
    }

    if (receiverCeloAddress == "") {
      toast.error("Enter receiver's celo address");
      return;
    }

    console.log(amounToBeSent);
    console.log(receiverCeloAddress);

    var passcode = prompt("Enter your passcode to proceed : ");
    if (!passcode) toast.error("Enter passcode");
    if (!passcode) return;

    let decryptedMnemonic;

    try {
      decryptedMnemonic = await decryptMnemonicWithPasscode(
        localStorage.getItem("celoEncryptedMnemonic"),
        passcode
      );
    } catch (error) {
      toast.error("Wrong passcode");
      return;
    }

    working = true;

    console.log(decryptedMnemonic);
    const accountDetails = await retrieveAccountDetailsFromMnemonic(
      decryptedMnemonic
    );
    console.log(accountDetails);

    var transactionReceipt;

    try {
      toast("Transaction initiated", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      transactionReceipt = await sendINR(
        accountDetails.address,
        accountDetails.privateKey,
        receiverCeloAddress,
        amounToBeSent
      );
    } catch (error) {
      console.log(error);
      toast(
        "Check the address & also make sure you have sufficient balance in wallet",
        {
          duration: 6000,
        }
      );
      toast.error("Failed to send");
      working = false;
      return;
    }

    working = false;

    if (transactionReceipt.status) {
      toast.success("Transaction Successful");
      history.push("/successtask");
    } else {
      toast.error("Transaction Failed");
    }
    refreshBalance();
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      {/* <h1 className="text-center header my-3 py-3">Kampus Vire</h1> */}
      <div className="opacity-100" id="reduceOpacity">
        <h1 className="text-center rubik fw-bold mt-3  mb-2">
          Crypto Wallet
          <img
            src="https://styles.redditmedia.com/t5_i05sx/styles/communityIcon_86ltnuoxy9541.png"
            height="50px"
          />
        </h1>
        <div
          className="container bg-light d-flex flex-column align-items-center justify-content-center round border mt-5"
          style={{ height: "15rem", width: "90%" }}
        >
          <h1 className="nunito_sans text-uppercase text-center">Balance</h1>
          <h2 className="Rubik txt-green fw-bold text-uppercase text-center">
            {" "}
            <img
              src="https://styles.redditmedia.com/t5_i05sx/styles/communityIcon_86ltnuoxy9541.png"
              height="30px"
            />{" "}
            {balance}
          </h2>
        </div>
        <div className="container px-4 my-4">
          <input
            type="text"
            className="form-control bg-light text-muted open_sans text-uppercase fst-italic fs-6 py-2"
            value={celoAddress}
            readOnly={true}
          />
        </div>

        <div className="d-grid gap-2 d-md-block container  mt-5">
          <button
            className="btn btn-success bg-green nunito_sans fw-bold text-uppercase"
            data-bs-toggle="modal"
            data-bs-target="#sendCelo"
            type="button"
          >
            Send CELO
          </button>
        </div>

        <div
          className="modal fade"
          id="sendCelo"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header pb-2 bg-light">
                <h1 className="px-4 nunito_sans m-0 fw-bold">
                  Celo{" "}
                  <img
                    src="https://styles.redditmedia.com/t5_i05sx/styles/communityIcon_86ltnuoxy9541.png"
                    height="50px"
                  />
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body pt-0">
                <input
                  type="text"
                  className="form-control text-muted open_sans text-uppercase fst-italic fs-6 py-2 my-3"
                  placeholder="Celo Address"
                  value={receiverCeloAddress}
                  onInput={(e) => setReceiverCeloAddress(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control text-muted open_sans text-uppercase fst-italic fs-6 py-2 my-3"
                  placeholder="Amount in INR"
                  onInput={(e) => setAmounToBeSent(e.target.value)}
                />
              </div>
              <div className="modal-footer border-0">
                <div className="d-grid gap-2 d-md-block container">
                  <button
                    type="button"
                    className="btn bg-green text-light rubik"
                    onClick={sendCrypto}
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    className="btn bg-white txt-green rubik"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CryptoWallet;
