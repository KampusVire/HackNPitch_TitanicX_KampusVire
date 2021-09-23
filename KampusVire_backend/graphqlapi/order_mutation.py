import graphene, json
from graphene.types.generic import GenericScalar

from datacontrol.models import Product as ProductModel
from datacontrol.models import TransactionLog as TransactionLogModel
from datacontrol.models import ShopProfile as ShopProfileModel
from datacontrol.models import OrderLog as OrderLogModel
from datacontrol.models import StudentProfile as StudentProfileModel
from datacontrol.models import VirtualWallet as VirtualWalletModel


# {
#     "shop_id": {
#         "product_id": <quantity>
#     }
# }

class PlaceOrderNode(graphene.Mutation):
    class Arguments:
        cartData = GenericScalar()
        is_preorder = graphene.Boolean(required=False)
        scheduled_time = graphene.DateTime(required=False)
        payment_type = graphene.String(required=True)

    success = graphene.Boolean()
    order_placed = graphene.Boolean()
    message = graphene.String()
    payment_type = graphene.String()
    transaction_ids = graphene.List(graphene.String)
    crypto_addresses = graphene.List(graphene.String)
    prices = graphene.List(graphene.Float)
    total_price = graphene.Int()
    redirect_payment_page = graphene.Boolean()

    @classmethod
    def mutate(cls, self, info, cartData, payment_type, is_preorder=False, scheduled_time=None):
        try:
            total_price = 0

            # cartData = json.loads(cartData)
            transaction_log_ids = []
            prices = []
            crypto_addresses = []
            redirect_payment_page = True
            order_placed = False

            for i in cartData.keys():
                shopTmp = ShopProfileModel.objects.get(id=i)
                crypto_addresses.append(shopTmp.user.crypto_wallet.celo_address)
                order_per_shop = []
                total_price_in_a_shop = 0
                for j in cartData[i].keys():
                    product = ProductModel.objects.get(id=j)
                    order_per_shop.append({
                        "product_id": product.id,
                        "product_name": product.name,
                        "product_picture": product.picture.name,
                        "price_per_unit": product.price,
                        "quantity": cartData[i][j],
                        "total_price": product.price * cartData[i][j]
                    })
                    total_price_in_a_shop = total_price_in_a_shop + product.price * cartData[i][j]
                prices.append(total_price_in_a_shop)
                total_price = total_price + total_price_in_a_shop
                transaction_log_record = TransactionLogModel.objects.create(
                    receiver_user=shopTmp.user,
                    sender_user=info.context.user,
                    amount=total_price_in_a_shop,
                    description="Payment for food in canteen/shop",
                    payment_type=payment_type,
                    category="orderpayment",
                )



                order_log_record = OrderLogModel.objects.create(
                    buyer=StudentProfileModel.objects.get(user_id=info.context.user.id),
                    shop=shopTmp,
                    data=order_per_shop,
                    price=total_price_in_a_shop,
                    transaction_log_id=transaction_log_record.id
                )


                if is_preorder and scheduled_time is not None:
                    order_log_record.is_preorder = True
                    order_log_record.preorder_scheduled_time = scheduled_time
                    order_log_record.save()

                transaction_log_ids.append(transaction_log_record.id)

                if payment_type == "cash":
                    redirect_payment_page = False
                    order_placed = True

            return PlaceOrderNode(success=True, order_placed=order_placed, message="Order Placed Successfully",
                                  transaction_ids=transaction_log_ids,payment_type= payment_type,
                                  total_price=total_price, redirect_payment_page=redirect_payment_page,
                                  prices=prices, crypto_addresses=crypto_addresses)
        except Exception as e:
            print(e)
            return PlaceOrderNode(success=False, message="Failed")


class OrderStatusUpdateNode(graphene.Mutation):
    class Arguments:
        order_id = graphene.String(required=True)
        status = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    error = graphene.String()

    @classmethod
    def mutate(cls, self, info, order_id, status):
        if not OrderLogModel.objects.filter(id=order_id, shop__user__id=info.context.user.id).exists():
            print(order_id)
            print(status)
            return OrderStatusUpdateNode(success=False, message="", error="Not found")
        order_record = OrderLogModel.objects.get(id=order_id, shop__user__id=info.context.user.id)
        order_record.order_status = status
        order_record.save()
        if status == "completed":
            trx_record = TransactionLogModel.objects.get(id=order_record.transaction_log_id)
            trx_record.status = "completed"
            trx_record.save()

        # TODO send sms update
        return OrderStatusUpdateNode(success=True, message="Status updated successfully", error="")


class Mutation(graphene.ObjectType):
    place_order = PlaceOrderNode.Field()
    order_status_update = OrderStatusUpdateNode.Field()
