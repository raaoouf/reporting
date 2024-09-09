from django.core.mail import send_mail
from django.conf import settings

def send_email_notification(user_email, message, subject="New BRQ Notification"):
    sender_email = settings.EMAIL_HOST_USER  # Retrieve sender email from Django settings
    sender_name = 'BRQ System'
    full_subject = f"{sender_name}: {subject}"

    try:
        send_mail(
            full_subject,
            message,
            sender_email,
            [user_email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Failed to send email: {e}")


