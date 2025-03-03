import os
import json
import requests
import time
import datetime
import logging
from django.conf import settings
from django.conf.urls.static import static
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import School, Order, Payment, AllYearBooks, TemporaryYearBooks, Cart
from .serializers import SchoolSerializer, DesignAssetSerializer, OrderSerializer, PaymentSerializer, AllYearBookstSerializer, TemporaryYearBooksSerializer, CartSerializer
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta, datetime
import random
from django.db.models import Q
import string
from django.shortcuts import render
from login.models import CustomUser
from user_panel.models import DesignAsset
from .constants import ORDER_STATUS, UNABLE_TO_LOAD_USER
from .constants import UNABLE_TO_LOAD_USER
from .constants import PDF_UPLOAD_SUCCESS_RESPONSE
from .constants import PDF_UPLOAD_ERROR_RESPONSE
from .constants import SESSION_TOKEN_ERROR_RESPONSE
from .constants import SUCCESS
from .constants import upload_file_category
from login.serializers import CustomUserSerializer
from .models import PdfFile
from .serializers import PdfFileSerializer
from django.http import JsonResponse
from .models import AllYearBooks
from rest_framework import generics
from .models import Cart
from .serializers import CartSerializer
from django.http import HttpResponse
from django.shortcuts import render
from .models import LoginCustomUser, Cart, Order, Payment
from .utils import generate_unique_invoice_number, send_order_confirmation_mail
import urllib3
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from .models import SessionLink
import base64
import os
from .models import PdfFile, EditedPdfTemplate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.http import JsonResponse
from dotenv import load_dotenv
from django.conf import settings
from .models import Permission
from django.db import transaction
from django.template.loader import render_to_string
load_dotenv()


"Payment Details"

account_id = os.getenv('ACCOUNT_ID')
user_id = os.getenv('USER_ID')
pin = os.getenv('PIN')
transaction_token_url = os.getenv('TRANSACTION_TOKEN_URL')


domain_name = os.getenv('DOMAIN_NAME')

# Base URL for PDF.co Web API requests
BASE_URL = "https://api.pdf.co/v1"
API_KEY = 'aravindhtech2022@gmail.com_jR5oXVja8ZXKdtOjEW8tx9JcsX4jByoKxQGt6VYT1V1wDvFbPczH9QS3Zao8MbaB'

@api_view(['POST'])
@permission_classes([AllowAny])
def send_email_api(request):
    """
    API endpoint to send an email with session link, access code, and a preview image.
    """
    recipient_email = request.data.get('email')
    session_link = request.data.get('session_link')
    user_name = request.data.get('user_name', 'User')
    pdf_id = request.data.get('pdf_id')  
    if not recipient_email or not session_link:
        return JsonResponse({'error': 'Email and session link are required'}, status=400)

    try:

        user = LoginCustomUser.objects.filter(email=recipient_email).first()
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)

        access_code = user.access_code or "No access code assigned"
        email = user.email  

        subject = "Yearbook Design Review"
        
        context = {
            'user_name': user_name,
            'session_link': session_link,
            'access_code': access_code,
            'email': email,
        }

        if pdf_id:
            pdf_record = PdfFile.objects.filter(id=pdf_id).first()
            if pdf_record:
                context['image_url'] = pdf_record.upload_image_path
            else:
                return JsonResponse({'error': 'PDF not found'}, status=404)

        html_message = render_to_string(
            'emailservice/order_confirmation.html', 
            context
        )
        send_mail(
            subject,
            '',  
            settings.EMAIL_HOST_USER,
            [recipient_email], 
            fail_silently=False,
            html_message=html_message
        )

        return JsonResponse({
            'status': 'success',
            'message': f'Email sent to {recipient_email} with access code: {access_code}',
            'email': email,
            'access_code': access_code
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


    
@api_view(['POST'])
@permission_classes([AllowAny])
def upload_pdf_pages(request):
    """
    Handle the upload of PDF page details, including HTML content as `pages`,
    along with additional metadata (name, keywords, and category).

    Creates a new entry in the PdfFile model with the provided details and
    returns a success response with the uploaded PDF's ID if successful.

    Returns:
        Response: JSON response with a success message and PDF ID on success,
                  or an error message and 400 status code on failure.
    """

    pages = request.data.get('pages')
    name = request.data.get('name')
    keywords = request.data.get('keywords').split(',')
    category = request.data.get('category')
    upload_pdf_detail = PdfFile.objects.create(pages=pages,
                                               name=name,
                                               keywords=keywords,
                                               category=category)
    if upload_pdf_detail:
        for file_key, img in request.FILES.items():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_name = f"{upload_pdf_detail.id}_{timestamp}_{img.name}"
            file_path = os.path.join(settings.MEDIA_ROOT, 'preview_images', file_name)
            with open(file_path, 'wb+') as destination:
                for chunk in img.chunks():
                    destination.write(chunk)
            upload_pdf_detail.upload_image_path = f"{domain_name}{settings.MEDIA_URL}preview_images/{file_name}"
            upload_pdf_detail.save()
        return Response({
            "message": PDF_UPLOAD_SUCCESS_RESPONSE,
            "client_status_code": status.HTTP_200_OK,
            "upload_pdf_id": upload_pdf_detail.id
        })

    return Response({
        "message": PDF_UPLOAD_ERROR_RESPONSE,
        "client_status_code": status.HTTP_400_BAD_REQUEST
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def listusers(request):
    """
    API endpoint to retrieve a list of users excluding admin users.
    """
    users = LoginCustomUser.objects.exclude(role='admin').values(
        'id', 'name', 'email','access_code'
    )
    return JsonResponse(list(users), safe=False)

@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_links_by_user(request, user_id):
    """
    API endpoint to retrieve session links for a specific user.
    """
    user = get_object_or_404(LoginCustomUser, id=user_id)

    session_links = SessionLink.objects.filter(user=user)

    links_list = [
        {
            "session_link_id": session.id,
            "user_name": user.name,  
            "session_link": session.link,
            "pdf_id": session.pdf_id,
            "created_at": session.created_at,
        }
        for session in session_links
    ]

    return Response(
        {
            "user_id": user_id,
            "links": links_list,
        },
        status=status.HTTP_200_OK
    )

    
@api_view(['POST'])
@permission_classes([AllowAny]) 
def update_permissions(request):
    """
    API endpoint to update or create user permissions for a given session link.
    
    This endpoint accepts a session link and a dictionary of user permissions 
    in the format {user_id: can_access}. It updates the `Permission` model 
    to either add new permissions or modify existing ones for the specified users.
    """
    data = request.data
    session_link = data.get('session_link')
    permissions = data.get('permissions', {})  
    print('request', data)
    if not session_link:
        return JsonResponse({"error": "Session link is missing."}, status=400)

    if not permissions:
        return JsonResponse({"error": "No permissions provided."}, status=400)

    for user_id, can_access in permissions.items():
        user = LoginCustomUser.objects.filter(id=user_id).first()
        if user:
           
            Permission.objects.update_or_create(
                user=user, 
                permission_link=session_link, 
                defaults={'can_access': can_access} 
            )

    return JsonResponse({"status": "success", "message": "Permissions updated."})


@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_users_by_permission_status(request, session_link_id, user_id):
    """
    API endpoint to retrieve users with and without permissions for a specific session link,
    excluding admin users.

    Args:
    - session_link_id (int): ID of the session link for which permissions are being checked.
    - user_id (int): ID of the user who generated the session link.

    Response:
    - Returns details about the session link and lists of users with and without permissions.
    """
    session_link = get_object_or_404(SessionLink, id=session_link_id)
    generating_user = get_object_or_404(LoginCustomUser, id=user_id)
    print(session_link_id)

    all_users = LoginCustomUser.objects.exclude(role='admin')
    permissions = Permission.objects.filter(permission_link=session_link.link)

    users_with_permission_ids = permissions.values_list('user_id', flat=True)
    print('Permission IDs:', users_with_permission_ids)

    with_permission = [
        {"id": user.id, "name": user.name, "role": user.role, "email": user.email}
        for user in all_users if user.id in users_with_permission_ids
    ]
    print('Users with permission:', with_permission)

    without_permission = [
        {"id": user.id, "name": user.name, "role": user.role, "email": user.email}
        for user in all_users if user.id not in users_with_permission_ids
    ]
    print('Users without permission:', without_permission)

    session_link_data = {
        "id": session_link.id,
        "link": session_link.link,
        "pdfId": session_link.pdf_id,
        "generated_by": {"id": generating_user.id, "name": generating_user.name},
    }

    return Response({
        "session_link": session_link_data, 
        "users_with_permission": with_permission, 
        "users_without_permission": without_permission, 
    }, status=200)



@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_session_data(request):
    """
    API endpoint to fetch session data and verify user permissions.
    """
    session_link = request.GET.get('session_link', '').strip() 
    user_id = request.GET.get('user_id')

    if not session_link:
        return JsonResponse({'error': 'Session link is required'}, status=400)
    if not user_id:
        return JsonResponse({'error': 'User ID is required'}, status=400)

    try:
        with transaction.atomic():
            user = LoginCustomUser.objects.filter(id=user_id).first()
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)

            session_data = SessionLink.objects.filter(link=session_link).select_related('user').first()
            if not session_data:
                return JsonResponse({'error': 'Session not found'}, status=404)

            original_user = session_data.user

            permission = Permission.objects.filter(user=user, permission_link=session_link).first()
            if not permission:
                send_permission_request_email(original_user.email, user, session_link)
                return JsonResponse({
                    'error': 'Access denied. An email has been sent to the original user requesting permission.'
                }, status=403)

            pdf_id = session_data.pdf_id
            edited_pdf_template = EditedPdfTemplate.objects.filter(pdf_id=pdf_id).order_by('-updated_at').first()
            if not edited_pdf_template:
                return JsonResponse({'error': 'Edited PDF template not found'}, status=404)

            return JsonResponse({
                'pdf_id': pdf_id,
                'pdfPages': edited_pdf_template.embedded_pages
            })

    except Exception as e:
        print(f"Error: {e}")  
        return JsonResponse({'error': f'Error fetching session: {e}'}, status=500)


def send_permission_request_email(recipient_email, requesting_user, session_link):
    """
    Sends an email to the original user requesting permission for another user.
    """
    try:
    
        subject = "Permission Request: Access Session Link"

        html_message = render_to_string(
            'emailservice/request_email.html',
            {
                'requesting_user_name': requesting_user.name,
                'requesting_user_email': requesting_user.email,
                'session_link': session_link,
            }
        )

        # Send the email
        send_mail(
            subject,
            '',  # Empty plain text body
            settings.EMAIL_HOST_USER,
            [recipient_email],
            fail_silently=False,
            html_message=html_message
        )

        print(f"Permission request email sent to {recipient_email}")

    except Exception as e:
        print(f"Error sending permission request email: {e}")


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_session_link(request):
    """
    Function to generate a session link for a user based on the provided session data.
    @param request: The WSGIRequest object containing the user_id, email, and session_data.
    @return: A JsonResponse containing the generated session link or an error message.
    """

    site_url = os.getenv('REACT_APP_SITE_URL', '').rstrip('/')
    user_id = request.data.get('user_id')
    email = request.data.get('email') 
    session_data = request.data.get('session_data')

    if not user_id or not email or not session_data:
        return JsonResponse({'error': 'user_id, email, and session_data are required'}, status=400)

    try:
        user = LoginCustomUser.objects.get(id=user_id, email=email)
    except LoginCustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found with the provided user_id and email'}, status=404)

    session_link = SessionLink.objects.create(
        user=user,
        pdf_id=session_data['pdf_id']
    )
    
    link = session_link.generate_link()
    
    full_link = f"{site_url}/design/edit?user_id={user.id}&email={user.email}&session_link={link}"

    session_link.link = full_link
    session_link.save()

    return JsonResponse({'link': full_link})


@api_view(['POST'])
@permission_classes([AllowAny])
def create_all_yearbook(request):
    """
    Function to create a new yearbook entry in the AllYearBooks model based on the provided temporary yearbook data.
    @param request: The WSGIRequest object containing user_id, temp_yearbook_id, and total_amount.
    @return: A Response containing the success status and the ID of the newly created yearbook, or an error message.
    """
    
    user_id = request.data.get("user") 
    temp_yearbook_id = request.data.get("temp_yearbook_id")
    total_amount = request.data.get("total_amount")

    try:
       
        temp_yearbook = TemporaryYearBooks.objects.get(id=temp_yearbook_id, user_id=user_id)

        all_yearbook = AllYearBooks.objects.create(
            yearbook=temp_yearbook.yearbook,
            yearbook_front_page=temp_yearbook.yearbook_front_page, 
            user=temp_yearbook.user, 
            total_amount=total_amount
        )
        
        # Return a success response with the ID of the newly created AllYearBooks entry
        return Response({"success": True, "all_yearbook_id": all_yearbook.id})
    
    except TemporaryYearBooks.DoesNotExist:
        return Response({"error": "Temporary Yearbook not found."}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_temporary_yearbook(request):
    """
    Function to create a new temporary yearbook entry based on the provided user and yearbook data.
    @param request: The WSGIRequest object containing the user and yearbook data.
    @return: A Response containing the created yearbook data or validation errors.
    """
    
    user_id = request.data.get('user') 
    user = get_object_or_404(LoginCustomUser, id=user_id)
    
    serializer = TemporaryYearBooksSerializer(data=request.data)
    
    serializer.context['request'] = request

    if serializer.is_valid():
        serializer.save(user=user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """
    Function to create a new order entry based on the provided order data.
    @param request: The WSGIRequest object containing the order data.
    @return: A Response containing the created order data or validation errors.
    """
    
    serializer = OrderSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
    
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def add_cart(request):
    """
    Function to add a cart item or update an existing cart item for a user.
    @param request: The WSGIRequest object containing the cart data (user, yearbook, quantity, etc.).
    @return: A Response containing the updated or created cart data, or validation errors.
    """
    
    
    user = request.data.get('user')
    temp_yearbook_id = request.data.get('tempYearbookId')
    yearbook_front_page = request.data.get('yearbook_front_page')

    try:
        
        cart = Cart.objects.filter(user=user, yearbook_id=temp_yearbook_id).first()
        
        if cart:
            
            cart.quantity = request.data.get('quantity', cart.quantity) 
            cart.amount = request.data.get('amount', cart.amount)  
            cart.total_amount = request.data.get('total_amount', cart.total_amount) 
            cart.save()  
            
            # Serialize the cart and return the updated cart data with a 200 OK status
            serializer = CartSerializer(cart)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # If no cart exists, create a new cart
            serializer = CartSerializer(data=request.data)
            
            if serializer.is_valid():
                # Save the new cart object to the database
                cart = serializer.save()
                
                # If a temporary yearbook ID is provided, fetch the corresponding yearbook
                if temp_yearbook_id:
                    yearbook = TemporaryYearBooks.objects.get(id=temp_yearbook_id)
                    
                    # If a front page for the yearbook is provided, update it
                    if yearbook_front_page:
                        yearbook.yearbook_front_page = yearbook_front_page
                        yearbook.save()
                    
                    # Link the yearbook to the cart and save the cart
                    cart.yearbook = yearbook
                    cart.save()
                
                # Return the newly created cart data with a 201 Created status
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            # If the cart data is not valid, return the validation errors with a 400 Bad Request status
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except TemporaryYearBooks.DoesNotExist:
        # If the TemporaryYearBooks entry does not exist for the provided ID, return an error
        return Response({"error": "TemporaryYearBooks not found"}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def cart_list_create(request):
    """
    Handle GET and POST requests for managing cart items.
    - GET: Retrieve the list of carts for a given user, optionally filtered by yearbook ID.
    - POST: Create a new cart entry for the specified user and yearbook.
    
    @param request: The WSGIRequest object containing either the cart list request or new cart creation request.
    @return: A Response containing either a list of carts or validation errors.
    """
    
    if request.method == 'GET':
        """
        Handles GET requests to fetch the list of carts for a specific user, optionally filtered by yearbook.
        """
        user_id = request.GET.get('user_id')  # Retrieve user ID from query parameters
        yearbook_id = request.GET.get('yearbook_id')  # Retrieve yearbook ID from query parameters (optional)

        if user_id:
            # Fetch the user object based on the provided user ID, or return 404 if not found
            user = get_object_or_404(CustomUser, id=user_id)
            
            # Get all carts associated with the user
            carts = Cart.objects.filter(user=user)
            
            # If a yearbook ID is provided, filter carts by yearbook ID as well
            if yearbook_id:
                carts = carts.filter(yearbook_id=yearbook_id)

            # Serialize the filtered list of carts and return the data
            serializer = CartSerializer(carts, many=True)
            return Response(serializer.data)
        
        # If no user ID is provided, return an error response
        return Response({"error": "User ID required"}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        """
        Handles POST requests to create a new cart entry for a user.
        """
        user_id = request.data.get('user_id')  # Retrieve user ID from the request body
        
        if user_id:
            # Fetch the user object based on the provided user ID, or return 404 if not found
            user = get_object_or_404(CustomUser, id=user_id)
            
            # Create a copy of the request data and add the user ID to the 'user' field
            data = request.data.copy()
            data['user'] = user.id 
            
            yearbook_id = request.data.get('yearbook_id')  # Retrieve yearbook ID from the request data (optional)
            if yearbook_id:
                # If yearbook ID is provided, add it to the data
                data['yearbook'] = yearbook_id  

            # Serialize the data to create a new Cart object
            serializer = CartSerializer(data=data)
            
            # Validate and save the new cart object
            if serializer.is_valid():
                serializer.save()
                # Return the created cart data with a 201 Created status
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            # If the data is invalid, return the validation errors with a 400 Bad Request status
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # If no user ID is provided in the request body, return an error response
        return Response({"error": "User ID required in request data"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def order_statistics(request):
    """
    Function used to upload the images in local system to database table.
    @param request: The WSGIRequest from the client.
    @return: Return the success and error response.
    """

    today = timezone.now().date()
    last_week = today - timedelta(days=7)
    last_month = today - timedelta(days=30)
    weekly_orders = Order.objects.filter(order_date__gte=last_week).count()
    monthly_orders = Order.objects.filter(order_date__gte=last_month).count()
    total_orders = Order.objects.count()
    total_dispatched_orders = Order.objects.filter(status='dispatched').count()
    total_payments = Payment.objects.aggregate(total_amount=Sum('amount'))
    total_users = CustomUser.objects.count()
    data = {
        'weekly_orders': weekly_orders,
        'monthly_orders': monthly_orders,
        'total_orders': total_orders,
        'total_dispatched_orders': total_dispatched_orders,
        'total_payments': total_payments,
        'total_users': total_users
    }

    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def current_dispatched_orders(request):
    """
    Function used to get the accepted, processed and dispatched yearbook order details.
    @param request: The WSGIRequest from the client.
    @return: Return the accepted, processed and dispatched yearbook order details.
    """

    role = request.data.get('role')
    user_id = request.data.get('user_id')
    if role == 'student':
        current_orders = Order.objects.filter(user_id=user_id).order_by('-order_date')
        all_orders_list = OrderSerializer(current_orders, many=True)
        all_order_status = []
        for all_order in all_orders_list.data:
            yearbook_image = AllYearBooks.objects.filter(id=all_order["yearbook"]).first()
            all_details = AllYearBookstSerializer(yearbook_image, context={'request': request})
            yearbook_front_page_details = all_details.data
            all_order['yearbook'] = yearbook_front_page_details['yearbook_url']
            all_order['yearbook_front_page'] = yearbook_front_page_details['yearbook_front_page_url']
            order_payment = Payment.objects.filter(order_id=all_order["id"]).first()
            all_paymewnt_details = PaymentSerializer(order_payment)
            all_paymewnt_details_amount = all_paymewnt_details.data
            all_order['amount'] = all_paymewnt_details_amount['ssl_amount']
            custom_user_name = CustomUser.objects.filter(id=all_order['user']).first()
            all_order['name'] = custom_user_name.name
            all_order_status.append(all_order)
        return Response({'all_order_status': all_order_status}, status=status.HTTP_200_OK)

    all_order_status = []
    for order_status in ORDER_STATUS:
        current_orders = Order.objects.filter(status=order_status).order_by('-order_date')
        all_orders_list = OrderSerializer(current_orders, many=True)
        order_status_list = []
        for all_order in all_orders_list.data:
            yearbook_image = AllYearBooks.objects.filter(id=all_order["yearbook"]).first()
            all_details = AllYearBookstSerializer(yearbook_image, context={'request': request})
            yearbook_front_page_details = all_details.data
            all_order['yearbook'] = yearbook_front_page_details['yearbook_url']
            all_order['yearbook_front_page'] = yearbook_front_page_details['yearbook_front_page_url']
            order_payment = Payment.objects.filter(order_id=all_order["id"]).first()
            all_paymewnt_details = PaymentSerializer(order_payment)
            all_paymewnt_details_amount = all_paymewnt_details.data
            all_order['amount'] = all_paymewnt_details_amount['ssl_amount']
            custom_user_name = CustomUser.objects.filter(id=all_order['user']).first()
            all_order['name'] = custom_user_name.name
            order_status_list.append(all_order)
        all_order_status.append({order_status: order_status_list})

    return Response({'all_order_status': all_order_status}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_details(request):
    """
    Function used to get the all user details from the database table.
    @param request: The WSGIRequest from the client.
    @return: Return the success and error response with user details.
    """

    all_user_details = CustomUser.objects.all().order_by('-date_updated')
    custom_details = CustomUserSerializer(all_user_details, many=True)
    user_details = custom_details.data
    if custom_details:
        return Response({'custom_user_details': user_details}, status=status.HTTP_200_OK)

    return Response({'message': UNABLE_TO_LOAD_USER}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def payment_details(request):
    """
    Function used to get the all user payment details from the database table.
    @param request: The WSGIRequest from the client.
    @return: Return the success and error response with user payment details.
    """

    role = request.data.get('role')
    user_id = request.data.get('user_id')
    payment_details_queryset = Payment.objects.filter(user_id=user_id).order_by('-payment_date') if role == 'student' else Payment.objects.all().order_by('-payment_date')
    payment_details = PaymentSerializer(payment_details_queryset, many=True)
    all_payment_details = []
    for payment_data in payment_details.data:
        current_order = Order.objects.filter(id=payment_data['order']).first()
        payment_data['status'] = current_order.status
        yearbook_image = AllYearBooks.objects.filter(id=current_order.yearbook_id).first()
        yearbook_serializer = AllYearBookstSerializer(yearbook_image, context={'request': request})
        payment_data['yearbook_front_page'] = yearbook_serializer.get_yearbook_front_page_url(yearbook_image)
        custom_user_name = CustomUser.objects.filter(id=payment_data['user']).first()
        payment_data['name'] = custom_user_name.name
        all_payment_details.append(payment_data)
    return Response({'all_payment_details': all_payment_details}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def student_cart_details(request):
    """
    Function used to get the user cart details from the database table.
    @param request: The WSGIRequest from the client.
    @return: Return the success and error response with user payment details.
    """

    user_id = request.data.get('user_id')
    user_cart = Cart.objects.filter(user_id=user_id).order_by('-date')
    cart_serializer = CartSerializer(user_cart, many=True)
    all_cart_details = []
    for cart_detail in cart_serializer.data:
        purchase_yearbook_page = AllYearBooks.objects.filter(id=cart_detail['yearbook'])
        cart_detail['purchase_yearbook_page'] = purchase_yearbook_page[0].yearbook_front_page
        all_cart_details.append(cart_detail)

    return Response({}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def purchase_saved_yearbook(request):
    """
    Function used to get the purchase and saved yearbook details from the database table.
    @param request: The WSGIRequest from the client.
    @return: Return the success and error response with purchase and saved yearbook details.
    """

    yearbook_option = request.data.get('yearbook_option')
    user_id = request.data.get('user_id')
    print(f'\n user_id: {user_id}')
    print(f'\n yearbook_option: {yearbook_option}')
    if yearbook_option == 'purchase':
        current_orders = Order.objects.filter(user_id=user_id, status='dispatched').order_by('-dispatched_date')
        all_orders_list = OrderSerializer(current_orders, many=True)
        purchase_all_yearbook_details = []
        for order in all_orders_list.data:
            purchase_details = {}
            purchase_details['dispatched_date'] = order['dispatched_date']
            payment_details_queryset = Payment.objects.filter(order_id=order['id'])
            purchase_details['amount'] = payment_details_queryset[0].amount if payment_details_queryset and payment_details_queryset[0].amount else None
            purchase_yearbook_page = AllYearBooks.objects.filter(id=order['yearbook']).first()
            yearbook_serializer = AllYearBookstSerializer(purchase_yearbook_page, context={'request': request})
            purchase_details['yearbook_front_page'] = yearbook_serializer.get_yearbook_front_page_url(purchase_yearbook_page)
            purchase_all_yearbook_details.append(purchase_details)

        return Response({'purchase_all_yearbook_details': purchase_all_yearbook_details}, status=status.HTTP_200_OK)

    else:
        saved_images = TemporaryYearBooks.objects.filter(user_id=user_id).order_by('-date')
        yearbook_serializer = TemporaryYearBooksSerializer(saved_images, many=True)
        return Response({'yearbook_serializer': yearbook_serializer}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def payment_statistics(request):
    today = timezone.now().date()
    last_week = today - timedelta(days=7)
    last_month = today - timedelta(days=30)

    weekly_payments = Payment.objects.filter(payment_date__gte=last_week).aggregate(total_amount=Sum('amount'))
    monthly_payments = Payment.objects.filter(payment_date__gte=last_month).aggregate(total_amount=Sum('amount'))
    total_payments = Payment.objects.aggregate(total_amount=Sum('amount'))


    data = {
        'weekly_payments': weekly_payments['total_amount'],
        'monthly_payments': monthly_payments['total_amount'],
        'total_payments': total_payments['total_amount']
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_statistics(request):
    total_users = CustomUser.objects.count()

    data = {
        'total_users': total_users
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_summary(request):
    total_orders = Order.objects.count()
    total_payments = Payment.objects.aggregate(total_amount=Sum('amount'))['total_amount']
    total_users = CustomUser.objects.count()

    data = {
        'total_orders': total_orders,
        'total_payments': total_payments,
        'total_users': total_users
    }

    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_user(request):
    """
    Create a new user.
    """
    data = request.data
    data['access_code'] = ''.join(random.choices(string.digits, k=8))
    serializer = CustomUserSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def checkJobStatus(jobId):
    url = f"{BASE_URL}/job/check?jobid={jobId}"
    
    response = requests.get(url, headers={ "x-api-key": API_KEY })
    if response.status_code == 200:
        json = response.json()
        return json["status"]
    else:
        print(f"Request error: {response.status_code} {response.reason}")
        return None

# Function to upload file to external service
def uploadFile(fileUrl):
    fileName = os.path.basename(fileUrl)
    url = f"{BASE_URL}/file/upload/get-presigned-url?contenttype=application/octet-stream&name={fileName}"
    
    response = requests.get(url, headers={ "x-api-key": API_KEY })
    if response.status_code == 200:
        json = response.json()
        if not json["error"]:
            uploadUrl = json["presignedUrl"]
            uploadedFileUrl = json["url"]
            with open(fileUrl, 'rb') as file:
                requests.put(uploadUrl, data=file, headers={ "x-api-key": API_KEY, "content-type": "application/octet-stream" })
            return uploadedFileUrl
        else:
            print(json["message"])    
    else:
        print(f"Request error: {response.status_code} {response.reason}")
    return None

# View to upload and convert PDF to HTML
@api_view(['POST'])
@permission_classes([AllowAny])
def upload_pdf(request):
    if 'Sample' not in request.FILES:
        return Response({"error": "No file found in the request"}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['Sample']
    
    if file.content_type != 'application/pdf':
        return Response({"error": "Only PDF files are allowed"}, status=status.HTTP_400_BAD_REQUEST)
    
    
    file_name = default_storage.save(file.name, ContentFile(file.read()))
    local_file_path = default_storage.path(file_name)  

    current_time = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    destinationFile = os.getcwd() + f"/media/result_{current_time}.html"

    uploadedFileUrl = uploadFile(local_file_path)  
    isPDFConverted = False

    if uploadedFileUrl:        
        parameters = {
            "async": True,
            "name": os.path.basename(destinationFile),
            "password": '',
            "pages": '',
            "simple": False,
            "columns": False,
            "url": uploadedFileUrl
        }

        url = "{}/pdf/convert/to/html".format(BASE_URL)

        response = requests.post(url, data=parameters, headers={"x-api-key": API_KEY})

        if response.status_code == 200:
            json = response.json()

            if not json["error"]:
                jobId = json["jobId"]
                resultFileUrl = json["url"]

                # Check job status in a loop
                while True:
                    convertstatus = checkJobStatus(jobId)
                    print(f"{datetime.datetime.now().strftime('%H:%M.%S')}: {convertstatus}")

                    if convertstatus == "success":
                        r = requests.get(resultFileUrl, stream=True)
                        if r.status_code == 200:
                            with open(destinationFile, 'wb') as htmlfile:
                                for chunk in r:
                                    htmlfile.write(chunk)
                            isPDFConverted = True
                            print(f"Result file saved as \"{destinationFile}\".")
                        else:
                            print(f"Request error: {response.status_code} {response.reason}")
                        break
                    elif convertstatus == "working":
                        time.sleep(3)
                    else:
                        print(convertstatus)
                        break
            else:
                print(json["message"])
        else:
            print(f"Request error: {response.status_code} {response.reason}")
    
    default_storage.delete(file_name)
    logger = logging.getLogger(__name__)

    try:
        if isPDFConverted:
            with open(destinationFile, 'r', encoding='utf-8') as htmlfile:
                content = htmlfile.read()
                if content:
                    pdf_instance = PdfFile(file=file, pages=content)
                    pdf_instance.save()
                else:
                    return Response({"error": "Unable to read pdf destination file."}, status=status.HTTP_400_BAD_REQUEST)

            if os.path.exists(destinationFile):
                os.remove(destinationFile)
                return Response({"message": "PDF uploaded and converted successfully."}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "Unable to convert the PDF. Please try again later."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error saving PDF instance: {e}")
        raise





@api_view(['POST'])
@permission_classes([AllowAny])
def save_edited_html(request):
    """
    Saves or updates the embedded HTML content associated with a PDF for a specific user.
    
    This function accepts embedded page content and either updates an existing template
    or creates a new one, linked to a specific user and PDF document.
    
    @param request: The HTTP request from the client containing `user_id`, `email`, `pdf_id`,
                    and the HTML content `embedded_pages`.
    @return: A JSON response indicating success or failure status and relevant message.
    """
    
    user_id = request.data.get('user_id')
    email = request.data.get('email')
    pdf_id = request.data.get('pdf_id')
    image_url = request.data.get('imgUrl')
    pdf_type  = request.data.get('pdfType')
    
    if not user_id or not email:
        return JsonResponse({'error': 'user_id and email are required'}, status=400)

    try:
        user = LoginCustomUser.objects.get(id=user_id, email=email)
    except LoginCustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    embedded_pages = request.data.get('embedded_pages', '')
    
    if not embedded_pages:
        return Response({"error": "No embedded pages content provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        pdf_instance = PdfFile.objects.get(id=pdf_id)
    except PdfFile.DoesNotExist:
        return Response({"error": "PDF not found"}, status=status.HTTP_404_NOT_FOUND)

    edit_id = request.data.get('edit_id')
    
    
    if edit_id:
        try:
            existing_template = EditedPdfTemplate.objects.get(id=edit_id, pdf=pdf_instance, user=user)
            existing_template.embedded_pages = embedded_pages
            existing_template.image_url = image_url
            existing_template.pdf_type = pdf_type
            existing_template.save()

            return Response({
                "message": "Embedded pages updated successfully!",
                "edit_id": existing_template.id,
                "file_name": pdf_instance.file.name  
            }, status=status.HTTP_200_OK)

        except EditedPdfTemplate.DoesNotExist:
            return Response({"error": "Edited PDF template not found with the provided edit_id"}, status=status.HTTP_404_NOT_FOUND)

    else:
        edited_template = EditedPdfTemplate.objects.create(
            pdf=pdf_instance,
            embedded_pages=embedded_pages,
            user=user,
            title_name=request.data.get('title_name', ''),
            image_url=image_url,
            pdf_type=pdf_type
        )
        
        return Response({
            "message": "Embedded pages saved successfully!",
            "edit_id": edited_template.id,
            "file_name": pdf_instance.file.name  
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_latest_edited_pdf(request):
    """
    API view to fetch all edited embedded pages PDF templates for a user.
    """
    
    user_id = request.GET.get('user_id')
    email = request.GET.get('email')

    if not user_id or not email:
        return JsonResponse({'error': 'user_id and email are required'}, status=400)

    try:
        user = LoginCustomUser.objects.get(id=user_id, email=email)
    except LoginCustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    edited_templates = EditedPdfTemplate.objects.filter(user=user).order_by('-updated_at')

    if not edited_templates.exists():
        return Response({'error': 'No edited PDFs found for this user.'}, status=status.HTTP_404_NOT_FOUND)

    templates_data = [
        {
            "edit_id": template.id,
            "pdf_id": template.pdf_id,
            "embedded_pages": template.embedded_pages, 
            "imageUrl": template.image_url,
            "pdf_type ": template.pdf_type ,
            "file_name": template.title_name,  
            "updated_at": template.updated_at,
        }
        for template in edited_templates
    ]

    return Response({
        "message": "Edited PDFs found successfully!",
        "edited_pdfs": templates_data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_pdfs(request):
    upload_file_details = []
    for category in upload_file_category:
        pdfs = PdfFile.objects.filter(category=category)
        serializer = PdfFileSerializer(pdfs, many=True)
        upload_file_details.append({category: serializer.data})

    pdfs = PdfFile.objects.all()
    all_category_details = PdfFileSerializer(pdfs, many=True).data
    return Response({
        'upload_file_details': upload_file_details,
        'upload_file_categories': upload_file_category,
        'all_category_details': all_category_details
    }, status=status.HTTP_200_OK)

def list_yearbooks(request):
    """
    Retrieve all yearbooks and return them as a JSON response.
    """
    yearbooks = AllYearBooks.objects.all().values('id', 'yearbook', 'yearbook_front_page', 'date')
    
    yearbook_list = list(yearbooks)  # Convert QuerySet to list
    return JsonResponse(yearbook_list, safe=False)


def order_confirmation(request):
    """
    Handles the order confirmation process, including:
    - Retrieving the user and cart details
    - Creating a new order and payment record in the database
    - Rendering the confirmation page with the relevant order details

    @param request: The HTTP request from the client, containing session info and POST data for the order and payment.
    @return: A rendered HTML response with order confirmation details.
    """
    
    user_id = request.session.get('user_id')
    user_detail = LoginCustomUser.objects.get(id=user_id)
    
    cart_detail = Cart.objects.filter(user=user_detail, cart_status=False).first()
    cart_detail.cart_status = True
    cart_detail.save()

    ssl_amount = request.POST.get('ssl_amount', '')
    ssl_email = request.POST.get('ssl_email', '')
    ssl_phone = request.POST.get('ssl_phone', '')
    ssl_card_number = request.POST.get('ssl_card_number', '')
    ssl_exp_date = request.POST.get('ssl_exp_date', '')
    ssl_txn_id = request.POST.get('ssl_txn_id', '')
    ssl_invoice_number = request.POST.get('ssl_invoice_number', '')
    ssl_txn_time = request.POST.get('ssl_txn_time', '')

    
    new_order = Order.objects.create(
        user=user_detail,
        yearbook=cart_detail.yearbook,
        status='accepted'
    )

    
    payment_details = f"Transaction ID: {ssl_txn_id}, Card Number: {ssl_card_number}, Expiry Date: {ssl_exp_date}"
    
    new_payment = Payment.objects.create(
        order=new_order,
        user=user_detail,
        payment_date=ssl_txn_time,
        amount=ssl_amount,
        payment_details=payment_details
    )
    
    send_order_confirmation_mail(ssl_email, ssl_invoice_number, ssl_txn_id, ssl_amount)

    content = {
        'ssl_invoice_number': ssl_invoice_number,
        'ssl_txn_time': ssl_txn_time,
        'ssl_amount': ssl_amount
    }

    return render(request, "confirmation.html", content)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def get_converge_session_token(request):
    """
    API endpoint to fetch a session token from the Converge payment gateway.
    This token will be used for processing payment.
    """

    amount = request.data.get('amount')
    payload = {
        "ssl_account_id": account_id,
        "ssl_user_id": user_id,
        "ssl_pin": pin,
        "ssl_transaction_type": "CCSALE",
        "ssl_amount": amount,
    }

    try:
        response = requests.post(transaction_token_url, data=payload, verify=False)
        if response.status_code == 200:
            session_token = response.text.strip()
            return Response({
                "message": SUCCESS,
                "session_token": session_token,
                "client_status_code": status.HTTP_200_OK
            })

        return Response({
            "message": SESSION_TOKEN_ERROR_RESPONSE,
            "response_text": response.text,
            "client_status_code": status.HTTP_400_BAD_REQUEST
        })

    except Exception as e:
        return Response({
            "message": e,
            "client_status_code": status.HTTP_400_BAD_REQUEST
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def generate_invoice_number(request):
    """
    API endpoint to generate a unique invoice number.
    This endpoint returns a response containing a newly generated
    invoice number in the format 'INV<unique_number>'.
    """

    return Response({
        "message": SUCCESS,
        "invoice_number": f"INV{generate_unique_invoice_number()}",
        "client_status_code": status.HTTP_200_OK
    })


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def transaction_response(request):
    """
    API endpoint to handle transaction responses.
    This endpoint processes payment data and user information,
    associates carts with the user, creates new orders and payment records,
    and updates the cart status accordingly.
    """

    payment_response = request.data['payment_response']
    user_data = request.data['user_data']

    user_id = user_data.get('user_id')
    user = LoginCustomUser.objects.filter(id=user_id).first()

    last_name = user_data.get('last_name', '')
    first_name = user_data.get('first_name', '')
    email = user_data.get('email', '')
    phone = user_data.get('phone', '')
    state = user_data.get('state', '')
    city = user_data.get('city', '')
    address = user_data.get('address', '')
    zip = user_data.get('zip', '')

    yearbook = user_data.get('yearbook', '')
    order_status = user_data.get('status', '')

    ssl_amount = payment_response.get('ssl_amount', '')
    ssl_result_message = payment_response.get('ssl_result_message', '')
    ssl_card_number = payment_response.get('ssl_card_number', '')
    ssl_exp_date = payment_response.get('ssl_exp_date', '')
    ssl_txn_id = payment_response.get('ssl_txn_id', '')
    ssl_approval_code = payment_response.get('ssl_approval_code', '')
    ssl_card_short_description = payment_response.get('ssl_card_short_description', '')
    ssl_invoice_number = payment_response.get('ssl_invoice_number', '')
    ssl_txn_time = payment_response.get('ssl_txn_time', '')
    ssl_cvv2_response = payment_response.get('ssl_cvv2_response', '')
    ssl_card_type = payment_response.get('ssl_card_type', '')
    ssl_par_value = payment_response.get('ssl_par_value', '')
    ssl_oar_data = payment_response.get('ssl_oar_data', '')
    ssl_result = payment_response.get('ssl_result', '')
    ssl_avs_response = payment_response.get('ssl_avs_response', '')
    ssl_transaction_type = payment_response.get('ssl_transaction_type', '')
    ssl_partner_app_id = payment_response.get('ssl_partner_app_id', '')
    ssl_issuer_response = payment_response.get('ssl_issuer_response', '')
    ssl_merchant_initiated_unscheduled = payment_response.get('ssl_merchant_initiated_unscheduled', '')
    ssl_token_response = payment_response.get('ssl_token_response', '')
    ssl_account_balance = payment_response.get('ssl_account_balance', '')
    ssl_ps2000_data = payment_response.get('ssl_ps2000_data', '')

    ip_address = request.META.get('HTTP_X_FORWARDED_FOR')
    if ip_address:
        ip_address = ip_address.split(',')[0].strip()

    order_yearbook = AllYearBooks.objects.filter(id=yearbook).first()
    new_orders = Order.objects.create(
        invoice=ssl_invoice_number,
        user=user,
        status=order_status,
        yearbook=order_yearbook,
        amount=ssl_amount,

    )

    new_payment = Payment.objects.create(
        order=new_orders,
        user=user,
        payment_status='paid',
        ssl_last_name=last_name,
        ssl_first_name=first_name,
        ssl_amount=ssl_amount,
        ssl_email=email,
        ssl_phone=phone,
        ssl_state=state,
        ssl_city=city,
        ssl_avs_address=address,
        ssl_avs_zip=zip,
        ssl_description='',
        ssl_result_message=ssl_result_message,
        ssl_card_number=ssl_card_number,
        ssl_exp_date=ssl_exp_date,
        ssl_txn_id=ssl_txn_id,
        ssl_approval_code=ssl_approval_code,
        ssl_card_short_description=ssl_card_short_description,
        ssl_invoice_number=ssl_invoice_number,
        ssl_txn_time=ssl_txn_time,
        ssl_cvv2_response=ssl_cvv2_response,
        ssl_card_type=ssl_card_type,
        ssl_par_value=ssl_par_value,
        ssl_oar_data=ssl_oar_data,
        ssl_result=ssl_result,
        ssl_avs_response=ssl_avs_response,
        ssl_transaction_type=ssl_transaction_type,
        ssl_partner_app_id=ssl_partner_app_id,
        ssl_issuer_response=ssl_issuer_response,
        ssl_merchant_initiated_unscheduled=ssl_merchant_initiated_unscheduled,
        ssl_token_response=ssl_token_response,
        ssl_account_balance=ssl_account_balance,
        ssl_ps2000_data=ssl_ps2000_data,
        ip_address=ip_address
    )

    return Response({
        "message": SUCCESS,
        "ssl_invoice_number": ssl_invoice_number,
        "ssl_txn_time": ssl_txn_time,
        "ssl_amount": ssl_amount,
        "payment_id": new_payment.id,
        "user_id": user.id,
        "order_id": new_orders.id,
        "client_status_code": status.HTTP_200_OK
    })


def login(request):
    return render(request, 'accounts/login.html')

def alter_login(request):
    return render(request, 'accounts/login2.html')