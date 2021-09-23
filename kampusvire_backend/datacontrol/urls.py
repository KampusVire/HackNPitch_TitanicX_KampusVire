from django.urls import path

from datacontrol import views

urlpatterns = [
    path("register/",views.register_api),
    path("login/", views.login),
    path("otp/request/",views.request_otp),
    path("otp/verify/",views.verify_otp),
    path("verify/orderpayment/<str:payment_id>/",views.verifyOrderTransactions),
    path("verify/addtowallet/<str:payment_id>/", views.verifyWalletRechargeTransactions),
    path("upload/",views.uploadFile)
]