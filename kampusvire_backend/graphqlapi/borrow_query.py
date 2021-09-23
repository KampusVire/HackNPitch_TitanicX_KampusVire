import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from datacontrol.models import BorrowDirectory as BorrowDirectoryModel
from graphqlapi.user_query import BaseUserNode


class BorrowDirectoryNode(DjangoObjectType):
    class Meta:
        model = BorrowDirectoryModel
        filter_fields = ["id"]
        fields = ["id", "amount", "description", "is_paid", "borrowed_on", "returned_on"]
        interfaces = (graphene.relay.Node,)

    obj_id = graphene.ID(source='pk', required=True)
    sender = graphene.Field(BaseUserNode)
    receiver = graphene.Field(BaseUserNode)

    def resolve_sender(self, info):
        return self.receiver_user

    def resolve_receiver(self, info):
        return self.sender_user


class Query(graphene.ObjectType):
    borrow_details = DjangoFilterConnectionField(BorrowDirectoryNode, borrow_type=graphene.String(required=True), paid=graphene.Boolean(required=True))

    def resolve_borrow_details(self, info, borrow_type, paid, first=None, after=None):
        user_id = info.context.user.id
        if borrow_type == "to":
            return BorrowDirectoryModel.objects.filter(sender_user__id=user_id, is_paid=paid).order_by("-id")
        elif borrow_type == "from":
            return BorrowDirectoryModel.objects.filter(receiver_user__id=user_id, is_paid=paid).order_by("-id")
