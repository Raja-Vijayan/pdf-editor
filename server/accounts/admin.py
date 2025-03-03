from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, School, Order, Payment, AllYearBooks, TemporaryYearBooks, Cart,SessionLink,PdfFile,EditedPdfTemplate

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role',)}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(School)
# admin.site.register(DesignAsset)  
admin.site.register(Order)
admin.site.register(Payment)
admin.site.register(AllYearBooks)
admin.site.register(TemporaryYearBooks)
admin.site.register(Cart)
admin.site.register(SessionLink)
admin.site.register(PdfFile)
admin.site.register(EditedPdfTemplate)
