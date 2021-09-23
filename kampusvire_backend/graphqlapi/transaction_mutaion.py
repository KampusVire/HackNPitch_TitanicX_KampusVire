import graphene
from django.core.exceptions import ObjectDoesNotExist
from graphene.types.generic import GenericScalar

from datacontrol.models import TransactionLog as TransactionLogModel


class TransactionStatusUpdate(graphene.Mutation):
    class Arguments:
        transaction_id = graphene.String(required=True)
        status = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    error = graphene.String()

    @classmethod
    def mutate(cls, self, info, transaction_id, status):
        transaction_record = TransactionLogModel.objects.get(id=transaction_id)
        if transaction_record.receiver_user_id != info.context.user.id:
            return TransactionStatusUpdate(success=False, message="", error="Failed to update")
        if transaction_record.status == "pending":
            transaction_record.status = status
            transaction_record.save()

        return TransactionStatusUpdate(success=True, message="Updated Successfully", error="")


class TransferMoneyNode(graphene.Mutation):
    class Arguments:
        to_user_id = graphene.String(required=True)
        amount = graphene.Float(required=True)
        payment_type = graphene.String(required=True)
        # Crypto
        # Virtual wallet
        # Online

    success = graphene.Boolean()
    message = graphene.String()
    payment_type = graphene.String()
    redirect_payment_page = graphene.Boolean()
    transaction_id = graphene.String()

    @classmethod
    def mutate(cls, self, info, to_user_id, amount, payment_type):
        try:
            transaction_log_model = TransactionLogModel.objects.create(
                sender_user_id=info.context.user.id,
                receiver_user_id=to_user_id,
                amount=amount,
                description="Money transfer",
                payment_type=payment_type,
                category="transfer"
            )
            return TransferMoneyNode(success=True, message="Order Placed Successfully", payment_type=payment_type, transaction_id = transaction_log_model.id)
        except:
            return TransferMoneyNode(success=False, message="Failed")


# This node is fully responsible for any sort of payment except cash type
# For online payment it will handle razorpay and callback apis

class ProcessTransactionNode(graphene.Mutation):
    class Arguments:
        transaction_ids = graphene.List(graphene.String, required=True)
        transaction_hash = graphene.List(graphene.String)

    total_transactions = graphene.Int()
    successful_transactions = graphene.Int()
    details = GenericScalar()

    @classmethod
    def mutate(cls, self, info, transaction_ids, transaction_hash=[]):
        total_transactions = len(transaction_ids)
        successful_transactions = 0
        transaction_details = []

        for key , i in enumerate(transaction_ids):
            try:
                transaction_log_model = TransactionLogModel.objects.get(id=i)
                if transaction_log_model.payment_type == "virtualwallet":
                    sender_wallet = transaction_log_model.sender_user.virtual_wallet
                    receiver_wallet = transaction_log_model.receiver_user.virtual_wallet
                    if sender_wallet.balance >= transaction_log_model.amount:
                        sender_wallet.balance = sender_wallet.balance - transaction_log_model.amount
                        receiver_wallet.balance = receiver_wallet.balance + transaction_log_model.amount
                        transaction_log_model.status = "completed"
                        sender_wallet.save()
                        receiver_wallet.save()
                        transaction_log_model.save()
                        transaction_details.append({
                            "id": i,
                            "success": True,
                            "message": "Transaction Successful"
                        })
                        successful_transactions += 1
                    else:
                        transaction_details.append({
                            "id": i,
                            "success": False,
                            "error": "Not Sufficient Balance in Virtualwallet"
                        })
                elif transaction_log_model.payment_type == "crypto":
                    if transaction_hash == "" or transaction_hash is None:
                        return transaction_details.append({
                            "id": i,
                            "success": False,
                            "error": "Invalid celo transaction"
                        })
                    else:
                        # TODO crosscheck payment before release
                        transaction_log_model.status = "completed"
                        transaction_log_model.payment_id = transaction_hash[key]
                        transaction_log_model.save()
                        transaction_details.append({
                            "id": i,
                            "success": True,
                            "message": "Transaction Successful"
                        })
                        successful_transactions += 1


            except ObjectDoesNotExist:
                transaction_details.append({
                    "id": i,
                    "success": False,
                    "error": "Transaction Not Found"
                })
        return ProcessTransactionNode(total_transactions=total_transactions,
                                      successful_transactions=successful_transactions, details=transaction_details)


class Mutation(graphene.ObjectType):
    transaction_status_update = TransactionStatusUpdate.Field()
    process_transaction = ProcessTransactionNode.Field()
    transfer_money = TransferMoneyNode.Field()
    # This will only

