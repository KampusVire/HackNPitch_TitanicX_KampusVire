import json, string, random

from django.contrib.auth.hashers import make_password
from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from datacontrol.models import OtpDirectory as OtpDirectoryModel, TransactionLog
from datacontrol.models import BaseUser as BaseUserModel
from datacontrol.models import StudentProfile as StudentProfileModel
from datacontrol.models import ApiToken as ApiTokenModel
from datacontrol.models import VirtualWallet as VirtualWalletModel
from datacontrol.models import CryptoWallet as CryptoWalletModel
from django.core.files.storage import FileSystemStorage

from kampusvire.settings import SECRET_KEY
from kampusvire.settings import razorpay_client


@require_http_methods(["POST"])
@csrf_exempt
def register_api(request):
    otp_id = request.POST.get("otp_id", "")
    otp_token = request.POST.get("otp_token", "")
    celo_mnemonic_encrypted = request.POST.get("celo_mnemonic_encrypted", "")
    celo_address = request.POST.get("celo_address", "")
    passcode = request.POST.get("passcode", "")
    name = request.POST.get("name", "")
    college_name = request.POST.get("college_name", "")
    department = request.POST.get("department", "")
    year = request.POST.get("year", "")
    roll_no = request.POST.get("roll_no", "")
    email_id = request.POST.get("email_id", "")

    if otp_id == "" or otp_token == "" or passcode == "" or name == "" or college_name == "" or department == "" or year == "" or roll_no == "" or email_id == "" or celo_mnemonic_encrypted == "" or celo_address == "":
        return JsonResponse({
            "success": False,
            "message": "",
            "error": "data missing"
        }, status=400)

    otp_record = OtpDirectoryModel.objects.filter(id=otp_id)
    if len(otp_record) == 0:
        return JsonResponse({
            "success": False,
            "message": "",
            "error": "OTP Verification Failed"
        }, status=200)

    otp_record = otp_record[0]
    response_phone_no = otp_record.verifyRecordAndMakeItUsed(otp_token)
    if response_phone_no == "-1":
        return JsonResponse({
            "success": False,
            "message": "",
            "error": "OTP Verification Failed"
        }, status=200)

    base_user_record = BaseUserModel.objects.create(
        phone_no=response_phone_no,
        passcode=make_password(passcode, SECRET_KEY),
        is_shop=False
    )

    StudentProfileModel.objects.create(
        user=base_user_record,
        name=name,
        college_name=college_name,
        department=department,
        year=year,
        roll_no=roll_no,
        email_id=email_id
    )

    VirtualWalletModel.objects.create(
        user=base_user_record
    )

    CryptoWalletModel.objects.create(
        user=base_user_record,
        celo_encrypted_mnemonic=celo_mnemonic_encrypted,
        celo_address=celo_address
    )

    api_token_record = ApiTokenModel.objects.create(
        user=base_user_record,
    )
    api_token_record.regenerateToken()

    return JsonResponse({
        "success": True,
        "message": "Account created successfully",
        "token": api_token_record.token,
        "error": ""
    }, status=200)


@require_http_methods(["POST"])
@csrf_exempt
def login(request):
    otp_id = request.POST.get("otp_id", "")
    otp_token = request.POST.get("otp_token", "")

    if otp_id == "" or otp_token == "":
        return JsonResponse({
            "success": False,
            "message": "",
            "error": "data missing"
        }, status=400)

    otp_record = OtpDirectoryModel.objects.filter(id=otp_id)
    if len(otp_record) == 0:
        return JsonResponse({
            "success": False,
            "message": "",
            "error": "OTP Verification Failed"
        }, status=200)

    otp_record = otp_record[0]
    response_phone_no = otp_record.verifyRecordAndMakeItUsed(otp_token)
    if response_phone_no == "-1":
        return JsonResponse({
            "success": False,
            "message": "",
            "error": "OTP Verification Failed"
        }, status=200)

    if not BaseUserModel.objects.filter(phone_no=response_phone_no).exists():
        return JsonResponse({
            "success": False,
            "message": "",
            "error": "User not found"
        }, status=200)

    api_token_record = ApiTokenModel.objects.get(user__phone_no=response_phone_no)

    api_token_record.regenerateToken()

    return JsonResponse({
        "success": True,
        "message": "Account verified successfully",
        "token": api_token_record.token,
        "error": ""
    }, status=200)


@require_http_methods(["POST"])
@csrf_exempt
def request_otp(request):
    phoneno = request.POST.get("phoneno", "")
    otp_record = OtpDirectoryModel.objects.create(
        phone_no=phoneno,
    )
    otp_record.generateData()
    return JsonResponse({
        "success": True,
        "otp_id": otp_record.id
    })


@require_http_methods(["POST"])
@csrf_exempt
def verify_otp(request):
    otp_id = request.POST.get("otp_id", "")
    otp = request.POST.get("otp", "")
    otp_record = OtpDirectoryModel.objects.get(id=otp_id)
    otp_token = otp_record.verifyOTP(int(otp))

    return JsonResponse({
        "success": otp_token != "-1",
        "otp_id": otp_record.id,
        "otp_token": otp_token
    })


def verifyOrderTransactions(request, payment_id):
    record = razorpay_client.payment.fetch(payment_id)
    if record["status"] == "authorized":
        print(record["amount"])
        transactions = []

        for i in json.loads(record["notes"]["TRANSACTIONS"]):
            trRecord = TransactionLog.objects.get(id=i)
            transactions.append(trRecord)

        response_data = razorpay_client.payment.capture(payment_id, record["amount"], {"currency": record["currency"]})
        if response_data["status"] == "captured":
            for i in transactions:
                i.payment_id = payment_id
                i.status = "completed"
                i.save()
        else:
            for i in transactions:
                i.payment_id = payment_id
                i.status = "completed"
                i.save()
# TODO update url
        return redirect("https://main.d36sj5p5rveg32.amplifyapp.com/successtask")
        # return JsonResponse({
        #     "success": True,
        #     "message": "Payment successful",
        #     "error": ""
        # })

    return redirect("https://main.d36sj5p5rveg32.amplifyapp.com/errortask")
    # return JsonResponse({
    #     "success": False,
    #     "message": "",
    #     "error": "Already captured"
    # })


def verifyWalletRechargeTransactions(request, payment_id):
    record = razorpay_client.payment.fetch(payment_id)
    if record["status"] == "authorized":
        print(record["amount"])
        print(record["notes"]["USERID"])

        try:
            wallet = VirtualWalletModel.objects.get(user_id=record["notes"]["USERID"])
            wallet.balance = wallet.balance + record["amount"] / 100
            wallet.save()
            razorpay_client.payment.capture(payment_id, record["amount"], {"currency": record["currency"]})
        except:
            return redirect("https://main.d36sj5p5rveg32.amplifyapp.com/errortask")

            # return JsonResponse({
            #     "success": False,
            #     "message": "Payment Failed",
            #     "error": ""
            # })
        return redirect("https://main.d36sj5p5rveg32.amplifyapp.com/successtask")
        # return JsonResponse({
        #     "success": True,
        #     "message": "Payment successful",
        #     "error": ""
        # })

    return redirect("https://main.d36sj5p5rveg32.amplifyapp.com/errortask")

    # return JsonResponse({
    #     "success": False,
    #     "message": "",
    #     "error": "Already captured"
    # })


@csrf_exempt
def uploadFile(request):
    if request.FILES and "file" in request.FILES:
        file = request.FILES['file']
        fs = FileSystemStorage(location='media/')
        new_file_name = ''.join(random.choices(string.ascii_letters + string.digits, k=20)) + "." + \
                        str(file.name).split(".")[-1]
        filename = fs.save(new_file_name, file)
        filenewname = fs.generate_filename(filename)
        # print(filenewname)
        return JsonResponse({
            "success": True,
            "file": filenewname,
            "error": "",
            "message": "Uploaded successfully"
        })
    return JsonResponse({
        "success": False,
        "error": "No file found",
        "message": ""
    })
