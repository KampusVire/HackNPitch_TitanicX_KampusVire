import json

import graphene

from datacontrol.models import ShopProfile


class ShopProfileUpdateNode(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=False)
        longitude_coordinate = graphene.Float(required=False)
        latitude_coordinate = graphene.Float(required=False)
        picture = graphene.String(required=False)
        operating_days = graphene.String(required=False)
        open_at = graphene.Time(required=False)
        close_at = graphene.Time(required=False)

    success = graphene.Boolean()
    message = graphene.String()
    error = graphene.String()

    @classmethod
    def mutate(cls, self, info, name=None, longitude_coordinate=None, latitude_coordinate=None, picture=None,
               operating_days=None, open_at=None, close_at=None):
        if not info.context.user.is_shop:
            return ShopProfileUpdateNode(success=False, message="", error="You are not a shop owner")

        # profile = info.context.user.shop_profile
        profile = ShopProfile.objects.get()
        if name is not None and str(name).strip() != "":
            profile.name = name

        if picture is not None and str(picture).strip() != "":
            profile.picture = picture

        if operating_days is not None and str(operating_days).strip() != "":
            try:
                jsonData = json.loads(operating_days)
                profile.operating_days = json.dumps(jsonData)
            except:
                return ShopProfileUpdateNode(success=False, message="", error="Not valid json in operating_days")

        if longitude_coordinate is not None:
            profile.longitude_coordinate = longitude_coordinate

        if latitude_coordinate is not None:
            profile.latitude_coordinate = latitude_coordinate

        if open_at is not None:
            profile.open_at = open_at

        if close_at is not  Mutation:
            profile.close_at = close_at

        profile.save()
        return ShopProfileUpdateNode(success=True, message="Profile updated successfully", error="")


class Mutation(graphene.ObjectType):
    shop_profile_update = ShopProfileUpdateNode.Field()
