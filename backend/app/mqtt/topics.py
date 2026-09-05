"""
Conceptual MQTT topic structure for future ESP32 integration:

    smartretrofit/{machine_id}/{sensor_type}

Example: smartretrofit/8f3c1e2a-.../vibration
"""
import re
from app.utils.config import settings

_TOPIC_PATTERN = re.compile(r"^([^/]+)/([^/]+)/([^/]+)$")


def build_topic(machine_id: str, sensor_type: str) -> str:
    return f"{settings.MQTT_TOPIC_PREFIX}/{machine_id}/{sensor_type}"


def build_wildcard_subscription() -> str:
    return f"{settings.MQTT_TOPIC_PREFIX}/+/+"


def parse_topic(topic: str) -> tuple[str, str] | None:
    match = _TOPIC_PATTERN.match(topic)
    if not match:
        return None
    prefix, machine_id, sensor_type = match.groups()
    if prefix != settings.MQTT_TOPIC_PREFIX:
        return None
    return machine_id, sensor_type