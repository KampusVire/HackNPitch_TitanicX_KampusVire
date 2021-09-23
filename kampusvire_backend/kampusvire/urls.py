from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path, include
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt

from kampusvire.gateway import login_gateway

from kampusvire import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql', login_gateway(csrf_exempt(GraphQLView.as_view(graphiql=True)))),
    path('api/', include('datacontrol.urls'))
]

# Setup this for our local mode in development
# So that we can access files in media folder
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    # Setup to access static file in debug mode
    urlpatterns += staticfiles_urlpatterns()
