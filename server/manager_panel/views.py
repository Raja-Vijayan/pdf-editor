# # manager_panel/views.py

# from rest_framework import status
# from rest_framework.response import Response
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.views import APIView
# from django.contrib.auth import authenticate, login
# from django.shortcuts import get_object_or_404
# from .serializers import OrderSerializer, CustomUserSerializer
# from user_panel.models import Order
# from accounts.models import CustomUser
# from django.contrib import messages
# from rest_framework.authtoken.models import Token
# from rest_framework.permissions import IsAdminUser


# class ManagerLoginView(APIView):
#     def post(self, request):
#         username = request.data.get('username')
#         password = request.data.get('password')
#         user = authenticate(request, username=username, password=password)
#         if user is not None:
#             if user.is_staff:  # Check if the user is a staff (manager) user
#                 login(request, user)
#                 token, created = Token.objects.get_or_create(user=user)
#                 return Response({'token': token.key}, status=status.HTTP_200_OK)
#             else:
#                 return Response({'error': 'You do not have permission to access this page.'}, status=status.HTTP_403_FORBIDDEN)
#         else:
#             return Response({'error': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)


# class ManagerDashboardView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         orders = Order.objects.all()
#         serializer = OrderSerializer(orders, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class EditOrderStatusView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, order_id):
#         order = get_object_or_404(Order, id=order_id)
#         new_status = request.data.get('status')
#         order.status = new_status
#         order.save()
#         return Response({'success': 'Order status updated successfully.'}, status=status.HTTP_200_OK)


# class ViewUserDetailsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, user_id):
#         user = get_object_or_404(CustomUser, id=user_id)
#         serializer = CustomUserSerializer(user)
#         return Response(serializer.data, status=status.HTTP_200_OK)
