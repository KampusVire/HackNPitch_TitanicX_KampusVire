from django.contrib import admin
from .models import *

admin.site.register(BaseUser)
admin.site.register(StudentProfile)
admin.site.register(ShopProfile)
admin.site.register(CryptoWallet)
admin.site.register(VirtualWallet)
admin.site.register(Product)
admin.site.register(TransactionLog)
admin.site.register(OrderLog)
admin.site.register(BorrowDirectory)
admin.site.register(ApiToken)
admin.site.register(OtpDirectory)