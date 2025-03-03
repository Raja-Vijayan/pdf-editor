from django.contrib import admin
from .models import CustomUser
from django.contrib.auth.admin import UserAdmin


class CustomUserAdmin(admin.ModelAdmin):
    exclude = ('access_code', 'date_created', 'date_updated', 'school_name', 'parent_name', 'password', 'last_login')


admin.site.register(CustomUser, CustomUserAdmin)
