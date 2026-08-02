import pytest

from src.domain.common.exceptions import DomainException
from src.domain.issues.issue_entity import (
    Coordinates,
    Issue,
    IssuePriority,
    IssueStatus
)


def test_coordinates_value_object_valid():
    coords = Coordinates(latitude=37.7749, longitude=-122.4194, address="San Francisco, CA")
    assert coords.latitude == 37.7749
    assert coords.longitude == -122.4194
    assert coords.address == "San Francisco, CA"


def test_coordinates_value_object_invalid_latitude():
    with pytest.raises(DomainException):
        Coordinates(latitude=95.0, longitude=-122.4194)


def test_coordinates_value_object_invalid_longitude():
    with pytest.raises(DomainException):
        Coordinates(latitude=37.7749, longitude=190.0)


def test_issue_state_machine_transition():
    issue = Issue(
        title="Dangerous Road Pothole",
        description="Pothole near crossroad",
        status=IssueStatus.SUBMITTED
    )

    issue.transition_status(IssueStatus.IN_PROGRESS, priority=IssuePriority.HIGH)
    assert issue.status == IssueStatus.IN_PROGRESS
    assert issue.priority == IssuePriority.HIGH
    assert issue.resolved_at is None

    issue.transition_status(IssueStatus.RESOLVED)
    assert issue.status == IssueStatus.RESOLVED
    assert issue.resolved_at is not None


def test_issue_state_machine_cannot_transition_from_terminal():
    issue = Issue(title="Resolved Pothole", status=IssueStatus.RESOLVED)
    with pytest.raises(DomainException):
        issue.transition_status(IssueStatus.IN_PROGRESS)
