from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import string
from login.models import CustomUser as LoginCustomUser
from django.utils.crypto import get_random_string
from django.utils import timezone
from decimal import Decimal


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('parent', 'Parent'),
        ('student', 'Student'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='parent')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    access_code = models.CharField(max_length=8, unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.access_code:
            self.access_code = self.generate_unique_access_code()
        super().save(*args, **kwargs)

    def generate_unique_access_code(self):
        while True:
            code = ''.join(random.choices(string.digits, k=8))
            if not CustomUser.objects.filter(access_code=code).exists():
                return code

class Permission(models.Model):
    user = models.ForeignKey(LoginCustomUser, related_name="custom_permissions", on_delete=models.CASCADE)
    permission_link = models.CharField(max_length=255, null=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    can_access = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'permission_link')

    def __str__(self):
        return f"Permission for {self.user.name} - {self.permission_link}"

class School(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()

    def __str__(self):
        return self.name
    
class TemporaryYearBooks(models.Model):
    yearbook = models.FileField(upload_to='yearbook/', null=True)
    yearbook_front_page = models.FileField(upload_to='yearbook/', null=True)
    user = models.ForeignKey(LoginCustomUser, on_delete=models.CASCADE, null=True)
    date = models.DateTimeField(auto_now_add=True)



class AllYearBooks(models.Model):
    yearbook = models.FileField(upload_to='yearbook/', null=True)
    yearbook_front_page = models.FileField(upload_to='yearbook/', null=True)
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(LoginCustomUser, on_delete=models.CASCADE, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)


class Cart(models.Model):
    quantity = models.PositiveIntegerField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    yearbook = models.ForeignKey(TemporaryYearBooks, on_delete=models.CASCADE, null=True, related_name='carts')
    user = models.ForeignKey(LoginCustomUser, on_delete=models.CASCADE, null=True, related_name='carts')
    

    def __str__(self):
        return f'Cart {self.id} for {self.user}'

class Order(models.Model):
    STATUS_CHOICES = (
        ('accepted', 'Accepted'),
        ('processed', 'Processed'),
        ('dispatched', 'Dispatched'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(LoginCustomUser, on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='accepted')
    yearbook = models.ForeignKey(AllYearBooks, on_delete=models.CASCADE, null=True)
    dispatched_date = models.DateTimeField(auto_now_add=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    invoice = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.email}"

class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    user = models.ForeignKey(LoginCustomUser, on_delete=models.CASCADE, null=True, related_name='accounts_payments')
    payment_status = models.CharField(max_length=255, null=True)
    ssl_last_name = models.CharField(max_length=255, null=True)
    ssl_first_name = models.CharField(max_length=255, null=True)
    ssl_amount = models.CharField(max_length=255, null=True)
    ssl_email = models.CharField(max_length=255, null=True)
    ssl_phone = models.CharField(max_length=255, null=True)
    ssl_state = models.CharField(max_length=255, null=True)
    ssl_city = models.CharField(max_length=255, null=True)
    ssl_avs_address = models.CharField(max_length=255, null=True)
    ssl_avs_zip = models.CharField(max_length=255, null=True)
    ssl_description = models.CharField(max_length=255, null=True)
    ssl_result_message = models.CharField(max_length=255, null=True)
    ssl_card_number = models.CharField(max_length=255, null=True)
    ssl_exp_date = models.CharField(max_length=255, null=True)
    ssl_txn_id = models.CharField(max_length=255, null=True)
    ssl_approval_code = models.CharField(max_length=255, null=True)
    ssl_card_short_description = models.CharField(max_length=255, null=True)
    ssl_invoice_number = models.CharField(max_length=255, null=True)
    ssl_txn_time = models.DateTimeField(auto_now=True, null=True)
    ssl_cvv2_response = models.CharField(max_length=255, null=True)
    ssl_card_type = models.CharField(max_length=255, null=True)
    ssl_par_value = models.CharField(max_length=255, null=True)
    ssl_oar_data = models.CharField(max_length=255, null=True)
    ssl_result = models.CharField(max_length=255, null=True)
    ssl_avs_response = models.CharField(max_length=255, null=True)
    ssl_transaction_type = models.CharField(max_length=255, null=True)
    ssl_partner_app_id = models.CharField(max_length=255, null=True)
    ssl_issuer_response = models.CharField(max_length=255, null=True)
    ssl_merchant_initiated_unscheduled = models.CharField(max_length=255, null=True)
    ssl_token_response = models.CharField(max_length=255, null=True)
    ssl_account_balance = models.CharField(max_length=255, null=True)
    ssl_ps2000_data = models.CharField(max_length=255, null=True)
    ip_address = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return f"Payment for Order {self.order.id}"


class SessionLink(models.Model):
    user = models.ForeignKey(LoginCustomUser, on_delete=models.CASCADE, related_name='session_links')  
    link = models.CharField(max_length=255, unique=True, null=True)
    pdf_id = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)   

    def __str__(self):
        return f"Session link for {self.user.email}"

    def generate_link(self):
        self.link = get_random_string(30)
        return self.link

class PdfFile(models.Model):
    file = models.FileField(upload_to='pdfs/', null=True)
    pages = models.TextField(null=True)
    name = models.CharField(max_length=255, null=True)
    keywords = models.TextField(null=True)
    category = models.TextField(null=True)
    upload_image_path = models.TextField(null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, null=True)


class EditedPdfTemplate(models.Model):
    pdf = models.ForeignKey(PdfFile, on_delete=models.CASCADE)
    user = models.ForeignKey(LoginCustomUser, on_delete=models.CASCADE, null=True)
    title_name = models.CharField(max_length=255, default="")
    embedded_pages = models.TextField(null=True)
    image_url = models.TextField(null=True)
    pdf_type = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True) 
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Edited template '{self.title_name}' for {self.user.email} - Last updated on {self.updated_at}"

    @property
    def user_id(self):
        return self.user.id if self.user else None
