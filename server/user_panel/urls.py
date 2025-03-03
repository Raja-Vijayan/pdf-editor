from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import upload_image
from .views import get_images


urlpatterns = [
    path('upload_image', upload_image, name='upload_image'),
    path('get_images', get_images, name='get_images')
]
