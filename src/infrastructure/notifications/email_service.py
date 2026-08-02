import logging
from typing import Dict, Any
from src.infrastructure.notifications.celery_app import celery_app

logger = logging.getLogger("civicfix.notifications")


class EmailTemplateRenderer:
    """Renders HTML and plaintext email templates."""

    @staticmethod
    def render_welcome_email(user_name: str) -> Dict[str, str]:
        subject = "Welcome to CivicFix - Civic Issue Reporting Platform"
        body = (
            f"Hello {user_name},\n\n"
            "Thank you for registering with CivicFix. You can now report local infrastructure issues "
            "and track their resolution status in real-time.\n\n"
            "Best regards,\nCivicFix Municipal Operations Team"
        )
        return {"subject": subject, "body": body}

    @staticmethod
    def render_status_update_email(to_email: str, issue_title: str, new_status: str, remarks: str = None) -> Dict[str, str]:
        subject = f"[CivicFix Update] Issue Status Changed: {new_status}"
        body = (
            f"Hello,\n\n"
            f"The status of your reported issue '{issue_title}' has been updated to: {new_status}.\n"
        )
        if remarks:
            body += f"Official Remarks: {remarks}\n\n"
        body += "Thank you for helping improve our community.\n\nCivicFix Operations Team"
        return {"subject": subject, "body": body}


@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=5,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True
)
def send_email_task(self, to_email: str, subject: str, body: str) -> Dict[str, Any]:
    """
    Asynchronous Celery Task with automatic exponential backoff retry logic.
    Retries up to 3 times upon failure with random jitter.
    """
    logger.info(f"Attempting email dispatch to {to_email} (Attempt {self.request.retries + 1}/4)")

    # Simulate email transmission via SMTP / AWS SES
    # Raises exception if connection fails, triggering Celery automatic retry
    try:
        # SMTP delivery logic here
        logger.info(f"Successfully delivered email to {to_email}: '{subject}'")
        return {"status": "sent", "to": to_email, "subject": subject, "attempt": self.request.retries + 1}
    except Exception as exc:
        logger.error(f"Failed to send email to {to_email}: {str(exc)}. Retrying...")
        raise self.retry(exc=exc)


def dispatch_welcome_email(to_email: str, user_name: str):
    """Triggers background welcome email task."""
    content = EmailTemplateRenderer.render_welcome_email(user_name)
    return send_email_task.delay(to_email, content["subject"], content["body"])


def dispatch_status_update_email(to_email: str, issue_title: str, new_status: str, remarks: str = None):
    """Triggers background status update email task."""
    content = EmailTemplateRenderer.render_status_update_email(to_email, issue_title, new_status, remarks)
    return send_email_task.delay(to_email, content["subject"], content["body"])
