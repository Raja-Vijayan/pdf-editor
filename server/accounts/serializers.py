from rest_framework import serializers
from .models import CustomUser, School, Order, Payment, AllYearBooks, TemporaryYearBooks, Cart
from user_panel.models import DesignAsset
from .models import PdfFile,EditedPdfTemplate
from .models import SessionLink


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

    def create(self, validated_data):
        user = CustomUser.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            role=validated_data['role']
        )
        return user


class TemporaryYearBooksSerializer(serializers.ModelSerializer):
    yearbook_url = serializers.SerializerMethodField()
    yearbook_front_page_url = serializers.SerializerMethodField()

    class Meta:
        model = TemporaryYearBooks
        fields = ['id', 'yearbook', 'yearbook_front_page', 'user', 'date', 'yearbook_url', 'yearbook_front_page_url']

    def get_yearbook_url(self, obj):
        request = self.context.get('request')
        if request and obj.yearbook:
            return request.build_absolute_uri(obj.yearbook.url)
        return None

    def get_yearbook_front_page_url(self, obj):
        request = self.context.get('request')
        if request and obj.yearbook_front_page:
            return request.build_absolute_uri(obj.yearbook_front_page.url)
        return None


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'address', 'phone_number', 'email']


class DesignAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignAsset
        fields = ['id', 'name', 'file', 'asset_type', 'size', 'tags']


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'user', 'yearbook', 'amount', 'status', 'order_date', 'dispatched_date']  # Make sure 'amount' is included here

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Format the order_date field explicitly
        if instance.order_date:
            representation['order_date'] = instance.order_date.strftime("%Y-%m-%d %H:%M:%S")
            representation['dispatched_date'] = instance.order_date.strftime("%Y-%m-%d %H:%M:%S")
        return representation



class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class AllYearBookstSerializer(serializers.ModelSerializer):
    yearbook_url = serializers.SerializerMethodField()
    yearbook_front_page_url = serializers.SerializerMethodField()

    class Meta:
        model = AllYearBooks
        fields = ['id', 'yearbook', 'yearbook_front_page', 'date', 'yearbook_url', 'yearbook_front_page_url']

    def get_yearbook_url(self, obj):
        request = self.context.get('request')
        if request and obj.yearbook:
            return request.build_absolute_uri(obj.yearbook.url)
        return None

    def get_yearbook_front_page_url(self, obj):
        request = self.context.get('request')
        if request and obj.yearbook_front_page:
            return request.build_absolute_uri(obj.yearbook_front_page.url)
        return None


class CartSerializer(serializers.ModelSerializer):
    yearbook_front_page = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'yearbook', 'quantity', 'amount', 'total_amount', 'date', 'user', 'yearbook_front_page']

    def get_yearbook_front_page(self, obj):
        # Check if the Cart has an associated yearbook and retrieve its `yearbook_front_page` if it exists
        if obj.yearbook and obj.yearbook.yearbook_front_page:
            return obj.yearbook.yearbook_front_page.url  # Return the URL if it's an uploaded file
        return None
class PdfFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PdfFile
        fields = ['id', 'file', 'pages', 'uploaded_at', 'category', 'keywords', 'name', 'upload_image_path']
        
        
class EditedPdfTemplateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True) 
    title_name = serializers.CharField(source='pdf.file.name', read_only=True)  
    pages = serializers.SerializerMethodField()  

    class Meta:
        model = EditedPdfTemplate
        fields = ['id', 'user_id', 'title_name', 'embedded_pages', 'pages', 'created_at', 'updated_at']

class SessionLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionLink
        fields = ['link', 'pdf_id', 'created_at']