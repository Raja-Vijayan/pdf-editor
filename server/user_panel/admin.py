from django.contrib import admin
from .models import CustomUser,  Payment, DesignAsset, School


# # Custom admin for CustomUser
# class CustomUserAdmin(admin.ModelAdmin):
#     list_display = ('username', 'email', 'is_school_admin', 'school')
#     search_fields = ('username', 'email', 'school__name')
#     list_filter = ('is_school_admin', 'school')
#     ordering = ('username',)


# # Custom admin for Yearbook
# class YearbookAdmin(admin.ModelAdmin):
#     list_display = ('title', 'user', 'created_at', 'updated_at')
#     search_fields = ('title', 'user__username')
#     list_filter = ('created_at', 'updated_at')


# # Custom admin for Cart
# class CartAdmin(admin.ModelAdmin):
#     list_display = ('user', 'yearbook', 'created_at')
#     search_fields = ('user__username', 'yearbook__title')
#     list_filter = ('created_at',)

# # Custom admin for Order
# class OrderAdmin(admin.ModelAdmin):
#     list_display = ('user', 'yearbook', 'status', 'order_date')
#     search_fields = ('user__username', 'yearbook__title', 'status')
#     list_filter = ('status', 'order_date')


# # Custom admin for Payment
# class PaymentAdmin(admin.ModelAdmin):
#     list_display = ('user', 'amount', 'payment_date')
#     search_fields = ('user__username',)
#     list_filter = ('payment_date',)


# # Custom admin for DesignAsset
class DesignAssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'asset_type', 'uploaded_at')
    search_fields = ('name', 'asset_type')
    list_filter = ('asset_type', 'uploaded_at')
    exclude = ('user_id',)


# # Custom admin for School
# class SchoolAdmin(admin.ModelAdmin):
#     list_display = ('name', 'code', 'created_at')
#     search_fields = ('name', 'code')
#     list_filter = ('created_at',)


# # Register all the models
# admin.site.register(CustomUser, CustomUserAdmin)
# # admin.site.register(Yearbook, YearbookAdmin)
# # admin.site.register(Cart, CartAdmin)
# # admin.site.register(Order, OrderAdmin)
# admin.site.register(Payment, PaymentAdmin)
# admin.site.register(DesignAsset, DesignAssetAdmin)
# admin.site.register(School, SchoolAdmin)
