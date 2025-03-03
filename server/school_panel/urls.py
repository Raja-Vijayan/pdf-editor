# school_panel/urls.py
from django.urls import path
from .views import SchoolLoginView, SchoolDashboardView, CreateUserView, ManageUsersView, ViewUserDetailsView
from .views import add_school

urlpatterns = [
    path('login/', SchoolLoginView.as_view(), name='school_login'),
    path('dashboard/', SchoolDashboardView.as_view(), name='school_dashboard'),
    path('create_user/', CreateUserView.as_view(), name='create_user'),
    path('manage_users/', ManageUsersView.as_view(), name='manage_users'),
    path('view_user_details/<int:user_id>/', ViewUserDetailsView.as_view(), name='view_user_details'),
    path('add-school/', add_school, name='add_school'),
]
