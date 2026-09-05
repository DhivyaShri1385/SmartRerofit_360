"""
Parses and validates raw MQTT payload bytes/strings into a
MQTTSensorMessage. Kept separate from the consumer so it can be unit
tested without a broker connection.
"""
import json
from pydantic import ValidationError
from app.mqtt.schemas import MQTTSensorMessage


class MQTTParseError(Exception):
    pass


def parse_message(raw_payload: str | bytes) -> MQTTSensorMessage:
    if isinstance(raw_payload, bytes):
        raw_payload = raw_payload.decode("utf-8")

    try:
        data = json.loads(raw_payload)
    except json.JSONDecodeError as e:
        raise MQTTParseError(f"Payload is not valid JSON: {e}") from e

    try:
        return MQTTSensorMessage(**data)
    except ValidationError as e:
        raise MQTTParseError(f"Payload failed schema validation: {e}") from e