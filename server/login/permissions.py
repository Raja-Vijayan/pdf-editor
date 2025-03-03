# permissions.py
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed

class IsTokenValid(BasePermission):
    """
    Custom permission to check if the provided JWT token is valid.
    """

    def has_permission(self, request, view):
        token = request.headers.get('Authorization', None)
        
        if token is None:
            raise AuthenticationFailed('Authorization header is missing')
        
        # Remove 'Bearer' prefix if present
        token = token.replace('Bearer ', '')

        try:
            # Decode and verify the token
            decoded_token = AccessToken(token)
            request.user = decoded_token['user_id']  # Store user_id in request if needed
            return True
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
