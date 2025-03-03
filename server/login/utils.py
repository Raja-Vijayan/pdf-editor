import random
import string
from .models import CustomUser


def generate_unique_access_code():
    while True:
        code = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        if not CustomUser.objects.filter(access_code=code).exists():
            return code
