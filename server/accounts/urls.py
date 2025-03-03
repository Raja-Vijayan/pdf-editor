from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import login
from .views import alter_login
from .views import create_user
from .views import order_statistics
from .views import payment_statistics
from .views import user_statistics
from .views import current_dispatched_orders
from .views import user_details
from .views import payment_details
from .views import purchase_saved_yearbook
from .views import student_cart_details
from . import views
from .views import upload_pdf, list_pdfs
from .views import cart_list_create
from .views import order_confirmation
from .views import list_yearbooks,generate_session_link, save_edited_html
from .views import get_latest_edited_pdf
from .views import add_cart
from .views import upload_pdf_pages
from .views import create_temporary_yearbook,create_all_yearbook,send_email_api
from .views import get_links_by_user,get_users_by_permission_status
from .views import get_converge_session_token
from .views import generate_invoice_number
from .views import transaction_response


router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login, name='login'),
    path('login2/', alter_login, name='login'),
    path('create_user/', create_user, name='create_user'),
    path('order_statistics/', order_statistics, name='order_statistics'),
    path('payment_statistics/', payment_statistics, name='payment_statistics'),
    path('user_statistics/', user_statistics, name='user_statistics'),
    path('current_dispatched_orders/', current_dispatched_orders, name='current_dispatched_orders'),
    path('user_details/', user_details, name='user_details'),
    path('payment_details/', payment_details, name='payment_details'),
    path('purchase_saved_yearbook/', purchase_saved_yearbook, name='purchase_saved_yearbook'),
    path('student_cart_details/', student_cart_details, name='student_cart_details'),
    path('upload-pdf/', views.upload_pdf, name='upload_pdf'),
    path('list-pdfs/', list_pdfs, name='list_pdfs'),
    path('carts/', cart_list_create, name='cart-list-create'),
    path('order_confirmation/', order_confirmation, name='order_confirmation'),
    path('yearbooks/', list_yearbooks, name='list_yearbooks'),
    path('generate_session_link/', generate_session_link, name='generate_session_link'),
    path('save_edited_html/', save_edited_html, name='save-edited-html'),
    path('latest-edited-pdf/', get_latest_edited_pdf, name='get-latest-edited-pdf'),
    path('addcarts/', add_cart, name='add_cart'),   
    path('upload_pdf_pages/', upload_pdf_pages, name='upload_pdf_pages'),
    path('orders/', views.create_order, name='create_order'),
    path('temporaryyearbooks/', create_temporary_yearbook, name='create_temporary_yearbook'),
    path('create_all_yearbook/', create_all_yearbook, name='create_all_yearbook'),
    path('get_session_data/', views.get_session_data, name='get_session_data'),
    path('list_users/', views.listusers, name='list_users'),
    path('update_permissions/',views.update_permissions,name='update_permissions'),
    path('send-email/', send_email_api, name='send-email'),
    path('user-links/<int:user_id>/', get_links_by_user, name='get_links_by_user'),
    path('update-permissions/', views.update_permissions, name='update_permissions'),
    path('permission-status/<int:session_link_id>/<int:user_id>/', get_users_by_permission_status, name='permission_status'),
    path('get_converge_session_token/', get_converge_session_token, name='get_converge_session_token'),
    path('generate_invoice_number/', generate_invoice_number, name='generate_invoice_number'),
    path('transaction_response/', transaction_response, name='transaction_response'),
   
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
