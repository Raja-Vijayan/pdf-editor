# school_panel/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login
from .serializers import SchoolLoginSerializer, CustomUserSerializer, SchoolSerializer
from user_panel.models import CustomUser, School
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render


class SchoolLoginView(APIView):
    def post(self, request):
        serializer = SchoolLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None and user.is_school_admin:
                login(request, user)
                return Response({'detail': 'Logged in successfully.'}, status=status.HTTP_200_OK)
            return Response({'detail': 'Invalid credentials or insufficient permissions.'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SchoolDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.filter(school=request.user.school)
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)


class CreateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(school=request.user.school)
            return Response({'detail': 'User created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ManageUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.filter(school=request.user.school)
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)


class ViewUserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = CustomUser.objects.filter(id=user_id, school=request.user.school).first()
        if user:
            serializer = CustomUserSerializer(user)
            return Response(serializer.data)
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


def add_school(request):
    return render(request, 'add-school.html')