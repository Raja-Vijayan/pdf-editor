# user_panel/api_views.py

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import  Payment, DesignAsset, School
from .serializers import  DesignAssetSerializer
from login.constants import SUCCESS
from login.constants import UNABLE_TO_UPLOAD_FILE
from login.constants import UNABLE_TO_FETCH_IMAGES
from login.models import CustomUser
from login.constants import IMAGE_UPLOAD_SUCCESS
from django.shortcuts import render


@api_view(['POST'])
@permission_classes([AllowAny])
def upload_image(request):
    """
    Function used to upload the images in local system to database table.
    @param request: The WSGIRequest from the client.
    @return: Return the success and error response.
    """

    try:
        files = request.FILES.getlist('upload_files')
        user_id = request.data.get('user_id')
        asset_type = request.data.get('asset_type')
        fileName = request.data.get('fileName', '')
        size = request.data.get('size', '')
        tags = request.data.get('tags', []) 

        # Retrieve the user instance based on user_id
        user = None
        if user_id:
            user = CustomUser.objects.filter(id=user_id).first()
        for upload_file in files:
            new_upload_document = DesignAsset(
                name=fileName if fileName else upload_file.name,
                asset_type=asset_type,
                file=upload_file,
                user_id=user if user else None,
                size=size,
                tags=tags
            )
            new_upload_document.save()

        return Response({'message': IMAGE_UPLOAD_SUCCESS}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'message': UNABLE_TO_UPLOAD_FILE}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def get_images(request):
    """
    Function used to get the images from database table.
    @param request: The WSGIRequest from the client.
    @return: Return the success and error response.
    """

    try:
        asset_type = request.data.get('asset_type')
        user_id = request.data.get('user_id')
        design_assets = DesignAsset.objects.filter(asset_type=asset_type)
        if user_id:
            design_assets = design_assets.filter(user_id=user_id)

        all_design_assets = design_assets.all()
        serializer = DesignAssetSerializer(all_design_assets, many=True, context={'request': request})
        return Response({'design_assets': serializer.data, 'message': SUCCESS }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f'Error: {str(e)}')
        return Response({'message': UNABLE_TO_FETCH_IMAGES}, status=status.HTTP_400_BAD_REQUEST)

