from pydantic import BaseModel


class MQTTStatusOut(BaseModel):
    enabled: bool
    connected: bool
    broker_host: str
    broker_port: int
    topic_pattern: str
    message_schema_example: dict