# user_panel/serializers.py
import base64
from rest_framework import serializers
from .models import  DesignAsset


class DesignAssetSerializer(serializers.ModelSerializer):
    file_base64 = serializers.SerializerMethodField()

    class Meta:
        model = DesignAsset
        fields = ['id', 'name', 'asset_type', 'file_base64', 'uploaded_at', 'user_id', 'size', 'tags']

    def get_file_base64(self, obj):
        with open(obj.file.path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

