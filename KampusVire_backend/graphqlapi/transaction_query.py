import graphene
from django.db.models import Q

from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from datacontrol.models import TransactionLog as TransactionLogModel
from graphqlapi.user_query import BaseUserNode


class TransactionLogNode(DjangoObjectType):
    class Meta:
        model = TransactionLogModel
        filter_fields = ["id", "payment_type", "category", "status"]
        fields = ["id", "amount", "description", "payment_type", "category", "payment_id", "status", "transaction_time"]
        interfaces = (graphene.relay.Node,)

    obj_id = graphene.ID(source='pk', required=True)
    sender = graphene.Field(BaseUserNode)
    receiver = graphene.Field(BaseUserNode)

    def resolve_sender(self, info):
        return self.receiver_user

    def resolve_receiver(self, info):
        return self.sender_user


class Query(graphene.ObjectType):
    transaction_logs = DjangoFilterConnectionField(TransactionLogNode, query_type=graphene.String(required=True))

    def resolve_transaction_logs(self, info, payment_type=None, category=None, status=None, query_type="all"):
        logged_in_base_user_id = info.context.user.id

        if query_type == "all":
            return TransactionLogModel.objects.filter(Q(receiver_user__id=logged_in_base_user_id)|Q(sender_user__id=logged_in_base_user_id))
        elif query_type == "sent":
            return TransactionLogModel.objects.filter(sender_user__id=logged_in_base_user_id)
        elif query_type == "received":
            return TransactionLogModel.objects.filter(receiver_user__id=logged_in_base_user_id)
        else:
            return []
