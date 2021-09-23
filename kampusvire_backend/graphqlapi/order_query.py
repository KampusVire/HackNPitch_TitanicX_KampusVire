import graphene
from graphene.types.generic import GenericScalar
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from datacontrol.models import OrderLog as OrderLogModel
from datacontrol.models import BaseUser as BaseUserModel
from datacontrol.models import TransactionLog as TransactionLogModel

from graphqlapi.transaction_query import TransactionLogNode
from graphqlapi.user_query import ShopProfileNode, StudentProfileNode


class OrderNode(DjangoObjectType):
    class Meta:
        model = OrderLogModel
        filter_fields = ["id", "order_status"]
        fields = ["id", "is_preorder", "preorder_scheduled_time", "order_status", "price"]
        interfaces = (graphene.relay.Node,)

    obj_id = graphene.ID(source='pk', required=True)
    data = GenericScalar()
    shop = graphene.Field(ShopProfileNode)
    buyer = graphene.Field(StudentProfileNode)
    transaction_details = graphene.Field(TransactionLogNode)

    def resolve_shop(self, info):
        return self.shop

    def resolve_buyer(self, info):
        return self.buyer

    def resolve_data(self, info):
        return self.data

    def resolve_transaction_details(self, info):
        try:
            return TransactionLogModel.objects.get(id=self.transaction_log_id)
        except:
            return None

class Query(graphene.ObjectType):
    orders = DjangoFilterConnectionField(OrderNode)

    def resolve_orders(self, info, order_status=None, first=None, after=None):
        base_user = info.context.user
        is_shop = base_user.is_shop
        if is_shop:
            return OrderLogModel.objects.filter(shop__user__id=base_user.id).order_by("-id")

        return OrderLogModel.objects.filter(buyer__user_id=base_user.id).order_by("-id")

