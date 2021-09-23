from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.shortcuts import redirect
from functools import wraps
from datacontrol.models import ApiToken
from django.core.exceptions import ObjectDoesNotExist

def login_gateway(view_func):
    @wraps(view_func)
    def wrap(request, *args, **kwargs):
        # Handle JWT and add user information -- START
        try:
            token = str(request.headers["Authorization"]).split(" ")[1]
            user = ApiToken.objects.get(token=token).user
            request.user = user

        except ObjectDoesNotExist:
            return JsonResponse({"error": "Invalid token"}, status=401)
        except KeyError as e:
            print("Key not found in dictionary")
        except Exception as e:
            print(f"Error : {e}")
        # STOP

        if str(request.user) != "AnonymousUser":
            return view_func(request, *args, **kwargs)

        return JsonResponse({"message": "invalid", "error": "User not logged in"}, status=401)

    return wrap