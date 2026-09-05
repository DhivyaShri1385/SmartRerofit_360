from fastapi import APIRouter
from app.utils.config import settings
from app.mqtt.consumer import PAHO_AVAILABLE
from app.schemas.mqtt_status import MQTTStatusOut

router = APIRouter(prefix="/api/mqtt", tags=["MQTT Architecture"])


@router.get("/status", response_model=MQTTStatusOut)
def get_mqtt_status():
    return MQTTStatusOut(
        enabled=settings.MQTT_ENABLED,
        connected=False,
        broker_host=settings.MQTT_BROKER_HOST,
        broker_port=settings.MQTT_BROKER_PORT,
        topic_pattern=f"{settings.MQTT_TOPIC_PREFIX}/{{machine_id}}/{{sensor_type}}",
        message_schema_example={
            "device_id": "ESP32-LATHE-01",
            "machine_id": "<machine-uuid>",
            "sensor": "vibration",
            "value": 2.34,
            "unit": "mm/s",
            "timestamp": "2026-09-05T10:15:30Z",
        },
    )