## Project : KampusVire

[Check this out for more](https://raw.githubusercontent.com/KampusVire/KampusVire/main/resource_github/KampusVire.pdf)

#### This app is mobile-friendly and works best in Google Chrome

#### Project is live in [https://main.d36sj5p5rveg32.amplifyapp.com/](https://main.d36sj5p5rveg32.amplifyapp.com/)

> 🔴 🟠 🟡 The crypto transaction may take more than 5sec to execute successfully. Please don't leave the page. Wait for confirmation. 


##### Steps to use KampusVire
1.  Open [https://main.d36sj5p5rveg32.amplifyapp.com/](https://main.d36sj5p5rveg32.amplifyapp.com/)
2.  Click on **Register** button
3.  Fill valid mobile no
4.  Fill **OTP**
5.  Fillup all necessary information
6.  You will be logged in and ready to use it.

##### Fund your celo wallet
> Note that , we are working in **Alfajores Testnet** for Celo. So no real money is utilized or involved in the process.


1. Go to crypto wallet in KampusVire App
2. Copy your celo address
3. Open [https://celo.org/developers/faucet](https://celo.org/developers/faucet)
4. Paste your Celo Address
5. Click on **I'm not a robot**
6. Click on **Done**
7. Refresh crypto wallet page in KampusVire App

##### Fund your virtual wallet
> Note that, the RazorPay gateway is in Test Mode . You should see a **Test Mode** ribbon in the app. The payment will be dummy. Follow the below steps to successfully recharge your wallet

1. Go to virtual wallet in KampuVire
2. Enter the amount
3. Click on **Add Money**
4. Fill mobileno and e-mail id
5. Select NetBanking
6. Select any bank
7. Click **Pay**
8. Now in the new page click on **Success**
9. You will be redirected to confirmation page

#### Tech Stack
- ReactJS
- Django

##### Prerequisites
- Python
- Nodejs

##### Backend Installation
1. Go to **KampusVire_backend**
2. Create python virtualenv
3. Activate virtual enviroment
4. Run **pip install -r requirements.txt**
5. Go to kampusvire/settings.py . At the bottom in Line 140 , replace RAZORPAY_KEY and RAZORPAY_SECRET with your own Razorpay API details
6. Run **python manage.py makemigrations**
7. Run **python manage.py migrate**
8. Run **python manage.py runserver**

It will by default will run at **http://localhost:8000/**

#### Frontend Installation
1. Go to **KampusVire_frontend**
2. Run **npm install**
3. In **config.js**, replace **ENDPOINT** with **http://localhost:8000**
4. Run **npm start**
5. Visit **http://localhost:3000/**

> Note that, as we are running localserver on http server , so it maybe happen that the QR scan will not work due to security policy in browser 
> For information regarding this , visit this blog post from mozilla.org [https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/)
> This same is applied for Google chrome browser




