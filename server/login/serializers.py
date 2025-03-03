from rest_framework import serializers
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.date_created:
            representation['date_created'] = instance.date_created.strftime("%Y-%m-%d %H:%M:%S")
        return representation
