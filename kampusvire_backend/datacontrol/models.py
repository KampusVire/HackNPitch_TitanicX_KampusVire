from django.db.models.fields.json import JSONField
from datacontrol.types import ORDER_STATUS, SHOP_TYPE, TRANSACTION_CATEGORY, TRANSACTION_MODE, TRANSACTION_STATUS
import uuid, string, random, requests

from django.db import models

from datacontrol.utils import otpgen


class BaseUser(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False)
    phone_no = models.FloatField(null=True)
    passcode = models.TextField(null=True)
    is_shop = models.BooleanField(null=True, default=False)


# Profile related models
class StudentProfile(models.Model):
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name="student_profile")
    name = models.TextField(null=True)
    college_name = models.TextField(null=True)
    department = models.TextField(null=True)
    year = models.TextField(null=True)
    roll_no = models.TextField(null=True)
    email_id = models.TextField(null=True, default="")

    def __str__(self):
        return "Student : " + self.name


class ShopProfile(models.Model):
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name="shop_profile")
    name = models.TextField(null=True)
    type = models.CharField(choices=SHOP_TYPE, max_length=30, null=True, default="canteen")
    longitude_coordinate = models.FloatField(null=True, default=0.0)
    latitude_coordinate = models.FloatField(null=True, default=0.0)
    picture = models.FileField(null=True, default="default.jpg")
    operating_days = models.TextField(null=True, default="[]")
    open_at = models.TimeField(null=True)
    close_at = models.TimeField(null=True)

    def __str__(self):
        return "Shop : " + self.name


# Wallets
class CryptoWallet(models.Model):
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name="crypto_wallet")
    celo_encrypted_mnemonic = models.TextField(null=True)
    celo_address = models.TextField(null=True)


class VirtualWallet(models.Model):
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name="virtual_wallet")
    balance = models.FloatField(null=True, default=0)


# Products
class Product(models.Model):
    shop = models.ForeignKey(ShopProfile, on_delete=models.CASCADE, related_name="products")
    name = models.TextField(null=True)
    price = models.FloatField(null=True)
    picture = models.FileField(null=True, default="default.jpg")
    is_available = models.BooleanField(null=True, default=True)

    def __str__(self):
        return "Product : " + self.name


# Transaction Logs
class TransactionLog(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False)
    receiver_user = models.ForeignKey(BaseUser, on_delete=models.CASCADE, related_name="received_transaction_logs")
    sender_user = models.ForeignKey(BaseUser, on_delete=models.CASCADE, related_name="sent_transaction_logs")
    amount = models.FloatField(null=True)
    description = models.TextField(null=True)
    payment_type = models.CharField(max_length=30, null=True, choices=TRANSACTION_MODE)
    category = models.CharField(max_length=30, null=True, choices=TRANSACTION_CATEGORY)
    payment_id = models.TextField(null=True, default="")
    status = models.CharField(max_length=30, null=True, choices=TRANSACTION_STATUS, default="pending")
    transaction_time = models.DateTimeField(null=True)


# Orders
class OrderLog(models.Model):
    buyer = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="student_order_logs",null=True)
    shop = models.ForeignKey(ShopProfile, on_delete=models.CASCADE, related_name="shop_order_logs",null=True)
    data = JSONField(null=True)
    is_preorder = models.BooleanField(null=True, default=False)
    preorder_scheduled_time = models.DateTimeField(null=True)
    order_status = models.CharField(max_length=30, null=True, choices=ORDER_STATUS, default="pending")
    price = models.FloatField(null=True)
    transaction_log_id = models.TextField(null=True)


# Borrow Directory
class BorrowDirectory(models.Model):
    receiver_user = models.ForeignKey(BaseUser, on_delete=models.CASCADE, related_name="received_borrow_logs")
    sender_user = models.ForeignKey(BaseUser, on_delete=models.CASCADE, related_name="sent_borrow_logs")
    amount = models.FloatField(null=True)
    description = models.TextField(null=True)
    is_paid = models.BooleanField(null=True, default=False)
    borrowed_on = models.DateTimeField(null=True, auto_now_add=True)
    returned_on = models.DateTimeField(null=True)


# API Tokens
class ApiToken(models.Model):
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name="api_token")
    token = models.TextField(null=True)

    def regenerateToken(self, *args, **kwargs):
        self.token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=50))
        super(ApiToken, self).save(*args, **kwargs)

class OtpDirectory(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False)
    token = models.TextField(null=True, blank=True)
    otp = models.IntegerField(null=True, blank=True)
    phone_no = models.FloatField(null=True)
    is_used = models.BooleanField(null=True, default=False)
    created_on = models.DateTimeField(auto_now_add=True)

    def generateData(self, *args, **kwargs):
        self.token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=50))
        self.otp = otpgen()
        requests.get(f" https://www.fast2sms.com/dev/bulkV2?authorization=4ftkNj4mXl746QOrfecIpBLiQMcOdGTNINm2SfpyuBdibZ4irc4xgFr8ybQN&route=v3&sender_id=TXTIND&message={self.otp}&language=english&flash=0&numbers={self.phone_no}")
        # TODO implement otp send here
        super(OtpDirectory, self).save(*args, **kwargs)

    def verifyOTP(self, otp):
        if self.is_used == False and otp == self.otp:
            return self.token
        return "-1"

    def verifyRecordAndMakeItUsed(self, token):
        if self.is_used == False and token == self.token:
            self.is_used = True
            super(OtpDirectory, self).save()
            return self.phone_no
        else:
            return "-1"
