from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import random
import string


class CustomUser(AbstractBaseUser):
    ROLES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('student', 'Student'),
        ('parent', 'Parent'),
    )

    password = models.CharField(max_length=128, blank=True, null=True)
    last_login = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    access_code = models.CharField(max_length=50, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLES)
    date_created = models.DateTimeField(auto_now_add=True)
    
    date_updated = models.DateTimeField(auto_now=True)
    school_name = models.CharField(max_length=255, blank=True, null=True)
    parent_name = models.CharField(max_length=255, blank=True, null=True)

    USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['name', 'phone_number', 'email', 'role']

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if not self.access_code:
            self.access_code = self.generate_unique_access_code()
        super().save(*args, **kwargs)

    def generate_unique_access_code(self):
        while True:
            code = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            if not CustomUser.objects.filter(access_code=code).exists():
                return code

