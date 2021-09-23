import random


def otpgen():
    otp = 0
    for i in range(6):
        otp += random.randint(1, 9) * 10 ** i
    return otp


