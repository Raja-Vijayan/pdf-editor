from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import authenticate, login as django_login
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import CustomUser
from .serializers import CustomUserSerializer
from .constants import (
    ENTER_ACCESS_CODE,
    INVALID_ACCESS_CODE,
    SUCCESS,
)
from datetime import datetime, timedelta
from .constants import CREATE_USER_SUCCESS
from .constants import DUPLICATE_USER
from .utils import generate_unique_access_code

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_access_code(request):
    """
    Validate the access code.
    """
    access_code = request.data.get('access_code')
    print("Access Code :",access_code)
    if not access_code:
        return Response({'message': ENTER_ACCESS_CODE}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.filter(access_code=access_code).first()
    print("User :",user)
    if user:
        return Response({'message': SUCCESS, 'access_code': user.access_code if user else ''},
                        status=status.HTTP_200_OK)

    return Response({'message': INVALID_ACCESS_CODE}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def email_number(request):
    """
    Authenticate a user using email, phone number, and access code, and set cookies.
    """
    email = request.data.get('email_number')
    access_code = request.data.get('access_code')
    print("Email :",email)
    print("Access code :",access_code)

    if not email:
        return Response({'message': 'Enter your email or phone number'}, status=status.HTTP_400_BAD_REQUEST)

    if not access_code:
        return Response({'message': 'Invalid access code'}, status=status.HTTP_400_BAD_REQUEST)

    # Authenticate the user
    user = CustomUser.objects.filter(Q(email=email) | Q(phone_number=email), access_code=access_code).first()

    print("Uesr :",user)

    if user:
        # Log in the user
        django_login(request, user)

        # Generate AccessToken
        access_token = str(AccessToken.for_user(user))

        # Set expiration time for the token (e.g., 5 minutes)
        expire_time = timedelta(days=30)
        expires = datetime.utcnow() + expire_time

        # Prepare the response with user data
        response = Response({
            'message': 'Success',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone_number': user.phone_number,
                'access_code': user.access_code,
                'role': user.role.lower(),
                'date_created': user.date_created,
                'date_updated': user.date_updated,
                'access_token': access_token
            }
        }, status=status.HTTP_200_OK)

        return response
    else:
        return Response({'message': 'Invalid email or phone number'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_token(request):
    """
    Verifies if the access token stored in the cookies is valid.
    """

    access_token = request.data.get('access_token')

    if not access_token:
        return Response({
            'message': 'User not login.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Initialize AccessToken
        access_token = AccessToken(access_token)

        # If you need to check expiration, you can do it here
        if access_token['exp'] < datetime.utcnow().timestamp():
            return Response({
                'message': 'The token has expired'
            }, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'message': 'Token is valid'
        }, status=status.HTTP_200_OK)

    except TokenError:
        return Response({
            'message': 'Token is invalid or expired'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_users(request):
    print(f'\n request: {request}')
    name = request.data.get('name')
    email = request.data.get('email')
    phone = request.data.get('phone')
    role = request.data.get('role').lower()

    access_code = generate_unique_access_code().upper()
    print(f'\n access_code: {access_code}')
    user = CustomUser.objects.filter(email=email)
    print(f'\n user: {user}')

    if not user:
        print(f'\n name: {name}, email: {email}, phone: {phone}, role: {role}')
        new_user = CustomUser(name=name, email=email, phone_number=phone, role=role, access_code=access_code)
        new_user.save()
        return Response({'message': CREATE_USER_SUCCESS}, status=status.HTTP_200_OK)

    return Response({'message': DUPLICATE_USER}, status=status.HTTP_400_BAD_REQUEST)
