# utils.py

import random
import string
from django.core.mail import send_mail
from django.conf import settings
from .models import Order


def generate_unique_invoice_number():
    """
    Generates a unique 8-character access code consisting of uppercase letters and digits.

    @return: The generated access code.
    """

    while True:
        invoice_number = str(random.randint(10000000, 99999999))
        if not Order.objects.filter(invoice=f"INV{invoice_number}").exists():
            return invoice_number


def send_order_confirmation_mail(email, invoice_number, transaction_id, amount):
    """Send an order confirmation email."""
    subject = 'Order Confirmation'
    message = f'Your order has been confirmed.\n\nInvoice Number: {invoice_number}\nTransaction ID: {transaction_id}\nAmount: {amount}'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
