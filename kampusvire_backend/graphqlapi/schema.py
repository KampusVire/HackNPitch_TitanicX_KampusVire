import graphene
from graphqlapi.user_query import Query as UserQuery
from graphqlapi.user_mutation import Mutation as UserMutation

from graphqlapi.order_query import Query as OrderQuery
from graphqlapi.order_mutation import Mutation as OrderMutation

from graphqlapi.transaction_query import Query as TransactionQuery
from graphqlapi.transaction_mutaion import Mutation as TransactionMutation

from graphqlapi.product_query import Query as ProductQuery
from graphqlapi.product_mutaion import Mutation as ProductMutation

from graphqlapi.borrow_query import Query as BorrowQuery
from graphqlapi.borrow_mutation import Mutation as BorrowMutation


class Query(UserQuery, OrderQuery, ProductQuery, TransactionQuery, BorrowQuery, graphene.ObjectType):
    pass


class Mutation(UserMutation, ProductMutation, OrderMutation, BorrowMutation, TransactionMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
