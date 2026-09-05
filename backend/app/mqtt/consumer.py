"""
MQTT consumer — NOT ACTIVE in this phase. Requires a physical ESP32
device and a running MQTT broker, neither of which exist in this
prototype.
"""
import logging
from app.utils.config import settings
from app.mqtt.topics import build_wildcard_subscription
from app.mqtt.parser import parse_message, MQTTParseError
from app.mqtt.ingestion import ingest_hardware_reading, IngestionError
from app.database import SessionLocal

logger = logging.getLogger("smartretrofit.mqtt")

try:
    import paho.mqtt.client as mqtt
    PAHO_AVAILABLE = True
except ImportError:
    PAHO_AVAILABLE = False


def _on_message(client, userdata, msg):
    db = SessionLocal()
    try:
        message = parse_message(msg.payload)
        ingest_hardware_reading(db, message)
        logger.info("Ingested hardware reading from topic %s", msg.topic)
    except (MQTTParseError, IngestionError) as e:
        logger.warning("Rejected MQTT message on topic %s: %s", msg.topic, e)
    finally:
        db.close()


def start_mqtt_consumer() -> None:
    if not settings.MQTT_ENABLED:
        logger.info(
            "MQTT ingestion inactive — hardware not connected. "
            "Continuing with simulated data only (SIMULATION_MODE=%s).",
            settings.SIMULATION_MODE,
        )
        return

    if not PAHO_AVAILABLE:
        logger.warning("MQTT_ENABLED=True but paho-mqtt is not installed. Run: pip install paho-mqtt")
        return

    client = mqtt.Client()
    client.on_message = _on_message
    client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT)
    client.subscribe(build_wildcard_subscription())
    client.loop_start()
    logger.info("MQTT consumer connected to %s:%s", settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT)