from src.infrastructure.notifications.email_service import (
    EmailTemplateRenderer,
    dispatch_status_update_email,
    dispatch_welcome_email,
    send_email_task
)


def test_email_template_rendering():
    welcome = EmailTemplateRenderer.render_welcome_email("Jane Citizen")
    assert "Jane Citizen" in welcome["body"]
    assert "Welcome to CivicFix" in welcome["subject"]

    status_update = EmailTemplateRenderer.render_status_update_email(
        to_email="citizen@example.com",
        issue_title="Main St Pothole",
        new_status="RESOLVED",
        remarks="Repaired by Crew #2"
    )
    assert "RESOLVED" in status_update["subject"]
    assert "Main St Pothole" in status_update["body"]
    assert "Repaired by Crew #2" in status_update["body"]


def test_celery_task_retry_configuration():
    assert send_email_task.max_retries == 3
    assert send_email_task.default_retry_delay == 5
    assert send_email_task.retry_backoff is True


def test_celery_eager_task_execution():
    res = dispatch_welcome_email("jane@example.com", "Jane")
    assert res.result["status"] == "sent"
    assert res.result["to"] == "jane@example.com"
