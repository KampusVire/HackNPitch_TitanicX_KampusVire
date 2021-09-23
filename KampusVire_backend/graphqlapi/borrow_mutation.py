import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from datacontrol.models import BorrowDirectory as BorrowDirectoryModel
from datacontrol.models import BaseUser as BaseUserModel
from graphqlapi.borrow_query import BorrowDirectoryNode


class BorrowCreateNode(graphene.Mutation):
    class Arguments:
        user_id_to = graphene.String(required=True)
        amount = graphene.Float(required=True)
        description = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    error = graphene.String()
    borrow_details = graphene.Field(BorrowDirectoryNode)

    @classmethod
    def mutate(cls, self, info, user_id_to, amount, description):
        try:
            to_user = BaseUserModel.objects.get(id=user_id_to)
            record = BorrowDirectoryModel.objects.create(
                sender_user=info.context.user,
                receiver_user=to_user,
                amount=amount,
                description=description
            )
            return BorrowCreateNode(success=True, message="Borrow Successful", error="", borrow_details=record)
        except:
            return BorrowCreateNode(success=False, message="", error="Failed", borrow_details=None)


class BorrowPaidNode(graphene.Mutation):
    class Arguments:
        borrow_id = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    error = graphene.String()

    @classmethod
    def mutate(cls, self, info, borrow_id):
        borrow_record = BorrowDirectoryModel.objects.get(id=borrow_id)
        if borrow_record.receiver_user_id != info.context.user.id:
            return BorrowPaidNode(success=False, message= "", error="You are not permitted")
        borrow_record.is_paid = True
        borrow_record.save()
        return BorrowPaidNode(success=True, message="Paid Successfully", error="")


class Mutation(graphene.ObjectType):
    borrow_initiate = BorrowCreateNode.Field()
    borrow_paid = BorrowPaidNode.Field()
