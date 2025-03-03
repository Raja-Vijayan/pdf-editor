from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, Group, Permission
from login.models import CustomUser

class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} by {self.user.username}"


class DesignAsset(models.Model):
    ASSET_TYPE_CHOICES = (
        # ('psd', 'PSD Template'),
        ('png', 'PNG Images'),
        ('svg', 'SVG Images'),
        ('background', 'Background Images')
    )

    name = models.CharField(max_length=100)
    asset_type = models.CharField(max_length=255, choices=ASSET_TYPE_CHOICES)
    file = models.FileField(upload_to='design_assets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    user_id = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True)
    size = models.CharField(max_length=50, blank=True, default='')
    tags = models.TextField(blank=True, default=list)

    def __str__(self):
        return self.name


class School(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    is_school_admin = models.BooleanField(default=False)
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True)
    groups = models.ManyToManyField(Group, related_name='user_panel_customuser_groups')
    user_permissions = models.ManyToManyField(Permission, related_name='user_panel_customuser_user_permissions')

    def __str__(self):
        return self.username
