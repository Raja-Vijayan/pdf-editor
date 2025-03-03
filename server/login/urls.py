from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet
from .views import validate_access_code
from .views import email_number
from .views import verify_token
from .views import create_users

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('validate_access_code', validate_access_code, name='validate_access_code'),
    path('email_number', email_number, name='email_number'),
    path('verify_token', verify_token, name='verify_token'),
    path('create_users', create_users, name='create_users'),
]
