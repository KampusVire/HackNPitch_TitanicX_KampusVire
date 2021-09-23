import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from datacontrol.models import Product as ProductModel
from graphqlapi.user_query import ShopProfileNode


class ProductNode(DjangoObjectType):
    class Meta:
        model = ProductModel
        filter_fields = ["id"]
        fields = ["id", "name", "price", "picture", "is_available"]
        interfaces = (graphene.relay.Node,)

    obj_id = graphene.ID(source='pk', required=True)
    shop = graphene.Field(ShopProfileNode)

    def resolve_shop(self, info):
        return self.shop


class Query(graphene.ObjectType):
    all_products = DjangoFilterConnectionField(ProductNode, shop_id = graphene.Int(required=False), query=graphene.String(required=False))

    def resolve_all_products(self, info, first=None, after=None, query=None, shop_id=None):
        products = ProductModel.objects.all()

        if shop_id is not None and shop_id != 0 :
            products = products.filter(shop_id=shop_id)

        if query is not None and str(query).strip() != "":
            products = products.filter(name__contains=query)

        return products

    filter_by_ids =  DjangoFilterConnectionField(ProductNode, list_of_ids= graphene.List(graphene.Int, required=True))
    def resolve_filter_by_ids(self, info, list_of_ids = []):
        return ProductModel.objects.filter(id__in=list_of_ids)

    all_products_shop = DjangoFilterConnectionField(ProductNode)
    def resolve_all_products_shop(self, info, first=None, after=None):
        if not info.context.user.is_shop:
            return []

        products = ProductModel.objects.filter(shop__user__id=info.context.user.id)
        return products