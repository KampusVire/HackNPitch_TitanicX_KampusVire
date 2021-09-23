import graphene
from django.core.exceptions import ObjectDoesNotExist
from graphene_django import DjangoObjectType
from datacontrol.models import Product as ProductModel
from graphqlapi.product_query import ProductNode


class ProductDetailsUpdateNode(graphene.Mutation):
    class Arguments:
        productId = graphene.Int(required=True)
        name = graphene.String(required=False)
        price = graphene.Float(required=False)
        picture = graphene.String(required=False)
        is_available = graphene.Boolean(required=False)

    success = graphene.Boolean()
    message = graphene.String()
    error = graphene.String()

    @classmethod
    def mutate(cls, self, info, productId, name=None, price=None, picture=None, is_available=None):
        try:
            product = ProductModel.objects.get(id=productId)
            if info.context.user.id != product.shop.user.id:
                return ProductDetailsUpdateNode(success=False, message="",
                                                error="You have no permission to edit details")

            if name is not None and str(name).strip() != "":
                product.name = name

            if price is not None:
                product.price = price

            if picture is not None and str(picture).strip() != "":
                product.picture = picture

            if is_available is not None:
                product.is_available = is_available

            product.save()
            return ProductDetailsUpdateNode(success=True, message="Product updated successfully", error="")

        except ObjectDoesNotExist:
            return ProductDetailsUpdateNode(success=False, message="", error="Product does not exist")
        except Exception as e:
            return ProductDetailsUpdateNode(success=False, message="", error=str(e))


class ProductAddNode(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        price = graphene.Float(required=True)
        picture = graphene.String(required=True)
        is_available = graphene.Boolean(required=True)

    product = graphene.Field(ProductNode)
    success = graphene.Boolean()
    message = graphene.String()
    error = graphene.String()

    @classmethod
    def mutate(cls, self, info, name=None, price=None, picture=None, is_available=None):
        if name is None or price is None or picture is None or is_available is None:
            return ProductAddNode(product=None, success=False, message="", error="Bad Request")

        if not info.context.user.is_shop:
            return ProductAddNode(product=None, success=False, message="", error="You are not a seller")

        try:
            record = ProductModel.objects.create(
                shop=info.context.user.shop_profile,
                name=name,
                price=price,
                picture=picture,
                is_available=is_available
            )

            return ProductAddNode(product=record, success=True, message="Product Added Successfully", error="")
        except:
            return ProductAddNode(product=None, success=False, message="", error="Unexpected error")


class ProductDeleteNode(graphene.Mutation):
    class Arguments:
        productId = graphene.Int(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    error = graphene.String()

    @classmethod
    def mutate(cls, self, info, productId):
        try:
            record = ProductModel.objects.get(id=productId)
            if record.shop.user.id != info.context.user.id:
                return ProductDeleteNode(success=False, message="", error="You have no permission to edit")
            record.delete()
            return ProductDeleteNode(success=True, message="Deleted Successfully", error="")
        except:
            return ProductDeleteNode(success=False, message="", error="Product not exists")


class Mutation(graphene.ObjectType):
    update_product = ProductDetailsUpdateNode.Field()
    add_product = ProductAddNode.Field()
    delete_product = ProductDeleteNode.Field()
