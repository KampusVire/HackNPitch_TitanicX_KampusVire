import graphene, json
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from datacontrol.models import BaseUser as BaseUserModel
from datacontrol.models import StudentProfile as StudentProfileModel
from datacontrol.models import ShopProfile as ShopProfileModel


class ShopProfileNode(DjangoObjectType):
    class Meta:
        model = ShopProfileModel
        filter_fields = ["id"]
        fields = ["id", "name", "type", "longitude_coordinate", "latitude_coordinate", "picture",
                  "open_at", "close_at"]
        interfaces = (graphene.relay.Node,)

    obj_id = graphene.ID(source='pk', required=True)
    phone_no = graphene.Float()
    operating_days = graphene.List(graphene.String)


    def resolve_phone_no(self, info):
        return self.user.phone_no

    def resolve_operating_days(self, info):
        try:
            return json.loads(self.operating_days)
        except:
            return []


class StudentProfileNode(DjangoObjectType):
    class Meta:
        model = StudentProfileModel
        filter_fields = ["id"]
        fields = ["id", "name", "college_name", "department", "year", "roll_no", "email_id"]
        interfaces = (graphene.relay.Node,)

    obj_id = graphene.ID(source='pk', required=True)
    phone_no = graphene.Float()

    def resolve_phone_no(self, info):
        return self.user.phone_no


class BaseUserNode(DjangoObjectType):
    class Meta:
        model = BaseUserModel
        filter_fields = ["id"]
        fields = ["id", "phone_no", "is_shop"]
        interfaces = (graphene.relay.Node,)

    obj_id = graphene.ID(source='pk', required=True)
    student_profile = graphene.Field(StudentProfileNode)
    shop_profile = graphene.Field(ShopProfileNode)
    wallet_balance = graphene.Float()
    celo_encrypted_mnemonic = graphene.String()
    celo_address = graphene.String()

    def resolve_student_profile(self, info):
        try:
            return self.student_profile
        except:
            return None

    def resolve_shop_profile(self, info):
        try:
            return self.shop_profile
        except:
            return None

    def resolve_wallet_balance(self,info):
        return self.virtual_wallet.balance

    def resolve_celo_encrypted_mnemonic(self,info):
        if info.context.user.id == self.id : 
            return self.crypto_wallet.celo_encrypted_mnemonic
        else :
            return "-1"

    def resolve_celo_address(self,info):
        return self.crypto_wallet.celo_address


# {
#   "Authorization" : "Bearer 123456789"
# }
class Query(graphene.ObjectType):
    base_profile_details = graphene.Field(BaseUserNode)
    all_shops = DjangoFilterConnectionField(ShopProfileNode)

    def resolve_base_profile_details(self, info):
        try:
            return info.context.user
        except:
            return None
