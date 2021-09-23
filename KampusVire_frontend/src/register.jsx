import React, { useRef, useState } from 'react';
import { ENDPOINT } from './config';
import axios from "axios";
import FormData from 'form-data';
import { getNewMnemonic, retrieveAccountDetailsFromMnemonic, encryptMnemonicWithPasscode } from './celo_functions';
import toast, { Toaster } from "react-hot-toast";

const RegisterUser = (props, context)=>{
    const [step, setStep] = useState(1);
    // This is like enum
    // 1: OTP Request
    // 2: OTP Verification
    // 3. Write down the celo menmonic
    // 4. Enter passcode
    // 5. Registration information

    console.log("HI");

    const mnemonicCelo = getNewMnemonic();
    const addressCelo = retrieveAccountDetailsFromMnemonic(mnemonicCelo)["address"];
    let registerData = useRef({
        otpToken : "",
        otpId : "",
        otp : "",
        passcode : "",
        phoneno : "",
        name : "",
        email_id : "",
        college_name : "",
        department : "",
        year : "",
        roll_no : ""
    });

    const handleReset = () => {
        Array.from(document.querySelectorAll("input")).forEach(
            input => (input.value = "")
        );
    };


async function requestOTP(){
        toast.success('Requesting OTP!')

        // setIsLoading(true);
        var data = new FormData();
        data.append('phoneno', registerData.current["phoneno"]);
        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/otp/request/`,
            data : data
          };
          
        axios(config)
        .then(function (response) {
            if(response.data.success){
                toast.success('OTP Sent')
                registerData.current["otpId"] =  response.data.otp_id;
                console.log(registerData.current["otpId"]);
                handleReset();
                setStep(2);
                // setError('');
            }else{
                toast.error("Failed")
                // setError(response.data.error);
            }
        })
        .catch(function (error) {
            toast.error("Failed to request.")
            // setError("Failed to request");
        });
        // setIsLoading(false);
    }
    

 async function verifyOTP(){
        toast('Wait a bit', {
            icon: '👏',
        });
      
        // setIsLoading(true);
        var data = new FormData();
        data.append('otp_id', registerData.current["otpId"]);
        data.append('otp', registerData.current["otp"]);

        console.log(registerData.current["otpId"]);
        console.log(registerData.current["otp"]);

        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/otp/verify/`,
            data : data
        };

        axios(config)
        .then(function (response) {
            console.log(response);
            if(response.data.success){
                toast.success('OTP Verified')
                registerData.current["otpToken"] = response.data.otp_token;
                // setError('');
                handleReset();
                setStep(3);
            }else{
                toast.error("Failed")
                // setError(response.data.error);
            }
        })
        .catch(function (error) {
            // setError("Failed to request");
        });
    //    setIsLoading(false);
    }

    function registerUser(){
        toast.success('Registering...')
        var data = new FormData();

        data.append('otp_id', registerData.current["otpId"]);
        data.append('otp_token', registerData.current["otpToken"]);
        data.append('celo_mnemonic_encrypted', encryptMnemonicWithPasscode(mnemonicCelo, registerData.current["passcode"]));
        data.append('celo_address', addressCelo);
        data.append('passcode', registerData.current["passcode"]);
        data.append('name', registerData.current["name"]);
        data.append('college_name', registerData.current["college_name"]);
        data.append('department', registerData.current["department"]);
        data.append('year', registerData.current["year"]);
        data.append('roll_no', registerData.current["roll_no"]);
        data.append('email_id', registerData.current["email_id"]);

        var config = {
            method: 'post',
            url: `${ENDPOINT}/api/register/`,
            data : data
        };

        axios(config)
        .then(function (response) {
            console.log(response);
            if(response.data.success){
                toast.success('Registered')
                // setError('');
                localStorage.setItem('token', response.data.token);
                window.location.href = '/';
            }else{
                // setError(response.data.error);
            }
        })
        .catch(function (error) {
            toast.error("Failed to register.")
            // setError("Failed to request");
        });
    }

    return (
        <>
        <Toaster
        position="top-right"
        reverseOrder={false}
        />
        {step === 1 ? (
            <div>
                <h1 className="text-center header">Kampus Vire</h1>

                <div className="my-5 container">
                    <label for="phoneNumber" className="form-label m-0 nunito_sans fs-4">Your Mobile Number</label><br />
                    <small className="text-muted open_sans">We will send an otp for verification</small>
                    <input type="type" className="form-control mt-4 fst-italic" placeholder="Phone Number" id="phoneno" onChange={(e) => registerData.current["phoneno"] = e.target.value} />
                </div>
                <div className="d-grid gap-2 d-md-block container button">
                    <button className="btn bg-green text-light" type="button" onClick={() => { requestOTP() }}>Continue</button>
                </div>

                {/* This is psedu code
                <label>Enter Mobile no  </label>
                <input type="text" id="phoneno" onChange={(e) => registerData.current["phoneno"] = e.target.value} />
                <button onClick={() => { requestOTP() }}>Request OTP</button> */}
            </div>
        )
            : step === 2 ? (
                <div>

                    <h1 className="text-center header">Kampus Vire</h1>

                    <div className="my-5 container">
                        <label for="phoneNumber" className="form-label m-0 nunito_sans fs-4">Enter The OTP</label><br />
                        <small className="text-muted open_sans">Please enter the OTP sent</small>
                        <input className="form-control mt-4 fst-italic" id="otp" defaultValue="" onChange={(event) => { registerData.current["otp"] = event.target.value }} />
                        {/* <p className="fs-6 text-center my-3 rubik">
                            Didn’t recieve OTP?<b className="text-primary">Resend</b> in  <b>60s</b> <br />
                            <a href="#" className="text-decoration-none rubik">Change phone Number</a>
                        </p> */}
                    </div>
                    <div className="d-grid gap-2 d-md-block container button">
                        <button className="btn bg-green text-light" onClick={() => { verifyOTP() }}>Continue</button>
                    </div>

                    {/* this is Psudo Code 
                    <label>Enter Otp</label>
                    <input id="otp" defaultValue="" onChange={(event) => { registerData.current["otp"] = event.target.value }} /><br />
                    <button onClick={() => { verifyOTP() }}>Verify OTP</button> */}
                </div>
            ) :
                step === 3 ? (
                    <div>
                        <h1 className="text-center nunito_sans mt-5 mb-3">Wallet Id</h1>
                        <p className="text-muted fs-6 px-3 open_sans">
                            Hey this is your special wallet Id . Note it down somewhere secure .We would ask for confirmation
                        </p>
                        <div className="fs-6 px-3 open_sans border p-3 mx-3 my-4 bg-light">{mnemonicCelo}</div>

                        <div className="d-grid gap-2 d-md-block container button">
                            <button className="btn btn-success bg-green text-uppercase" onClick={() => setStep(4)}>Done</button>
                        </div>

                        {/* This is pseudo code
                        <a>Write down the below mnemonic in a safe place . So that in case you lose access to account you can get access to celo wallet</a>
                        <pre>{mnemonicCelo}</pre>
                        <button onClick={() => setStep(4)}>Next</button> */}
                    </div>
                ) :
                    step === 4 ? (
                        <div>
                            <h1 className="text-center header">Kampus Vire</h1>

                            <div className="my-5 container">
                                <label for="phoneNumber" className="form-label m-0 nunito_sans fs-4">Enter a 6 digit key for your  wallet </label><br />
                                <small className="text-muted open_sans">This is unique and can not be reset</small>
                                <input type="number" className="form-control mt-4 fst-italic" itemID="passcode" onChange={(event) => { registerData.current["passcode"] = event.target.value }} />
                            </div>
                            <div className="d-grid gap-2 d-md-block container button">
                                <button className="btn bg-green text-light" type="button" onClick={() => { setStep(5); handleReset(); }}>Continue</button>
                            </div>
                            {/* psudo Code
                            <label>Enter passcode</label>
                            <input itemID="passcode" onChange={(event) => { registerData.current["passcode"] = event.target.value }} /><br />
                            <button onClick={() => { setStep(5); handleReset(); }}>Next</button> */}

                        </div>
                    ) :
                        step === 5 ? (
                            <div>
                                <h1 className="text-center header my-5 py-3">Kampus Vire</h1>

                                <div className="my-5 container">
                                    <div className="fs-5 nunito_sans px-3">Hi there !</div>
                                    <div className="fs-6 text-muted nunito_sans px-3 mb-4">You are new here,quickly fill this up</div>
                                    <form>
                                        <div className="mb-3">
                                            <input className="form-control text-muted open_sans text-uppercase fst-italic fs-6 py-2" placeholder="Your Name" id="name" onChange={(event) => { registerData.current["name"] = event.target.value }} />
                                        </div>
                                        <div className="mb-3">
                                            <input className="form-control text-muted open_sans fst-italic fs-6 py-2" placeholder="Your EmailID" id="emailid" onChange={(event) => { registerData.current["email_id"] = event.target.value }} />
                                        </div>
                                        <div className="mb-3">
                                            <input className="form-control text-muted open_sans text-uppercase fst-italic fs-6 py-2" placeholder="Your College Name" id="college_name" onChange={(event) => { registerData.current["college_name"] = event.target.value }} />
                                        </div>
                                        <div className="mb-3">
                                            <input type="text" className="form-control text-muted open_sans fst-italic fs-6 py-2" placeholder="YOUR ROLL NUMBER" id="roll_no" onChange={(event) => { registerData.current["roll_no"] = event.target.value }} />
                                        </div>
                                        <div className="mb-3">
                                            <input type="text" className="form-control text-muted open_sans text-uppercase fst-italic fs-6 py-2" placeholder="DEPARTMENT" id="department" onChange={(event) => { registerData.current["department"] = event.target.value }} />
                                        </div>
                                        <div className="mb-3">
                                            <input type="text" className="form-control text-muted open_sans fst-italic fs-6 py-2" placeholder="YEAR" id="year" onChange={(event) => { registerData.current["year"] = event.target.value }} />
                                        </div>
                                        {/* <div className="mb-3">
                                            <label for="formFile" className="form-label open_sans fs-6">Student ID-Card</label>
                                            <input className="form-control" type="file" id="formFile" />
                                        </div> */}

                                    </form>
                                </div>
                                <div className="d-grid gap-2 d-md-block container button">
                                    <button className="btn btn-success bg-green text-uppercase" onClick={registerUser}>Done</button>
                                </div>

                                {/* Psedo code
                                <label>Enter your name</label>
                                <input id="name" onChange={(event) => { registerData.current["name"] = event.target.value }} /><br />
                                <label>Enter your email id</label>
                                <input id="emailid" onChange={(event) => { registerData.current["email_id"] = event.target.value }} /><br />
                                <label>Enter your college name</label>
                                <input id="college_name" onChange={(event) => { registerData.current["college_name"] = event.target.value }} /><br />
                                <label>Enter your department</label>
                                <input id="department" onChange={(event) => { registerData.current["department"] = event.target.value }} /><br />
                                <label>Enter your year</label>
                                <input id="year" onChange={(event) => { registerData.current["year"] = event.target.value }} /><br />
                                <label>Enter your roll no</label>
                                <input id="roll_no" onChange={(event) => { registerData.current["roll_no"] = event.target.value }} /><br />
                                <button onClick={registerUser}>Register</button> */}
                            </div>
                        ) :
                            (<div>Wait..</div>)
        }
    </>
    );
}

export default RegisterUser;