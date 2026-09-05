from app.schemas.ml_training import DatasetSummary, TrainRequest, ModelRunOut
from app.schemas.machine import MachineBase, MachineCreate, MachineUpdate, MachineOut
from app.schemas.user import UserLogin, UserOut, Token
from app.schemas.dashboard import DashboardOverview
from app.schemas.sensor import SensorOut, ThresholdUpdate, SensorStateUpdate
from app.schemas.sensor_reading import SensorReadingOut
from app.schemas.live_monitoring import LiveMonitoringSnapshot, LiveSensorPoint, LiveHistoryPoint
from app.schemas.alert import AlertOut, AlertSummary
from app.schemas.maintenance_recommendation import MachineHealthOut, RecommendationOut
from app.schemas.energy import EnergyOverview, EnergyTrendPoint, MachineEnergyComparison
from app.schemas.maintenance_record import (
    MaintenanceRecordCreate, MaintenanceRecordUpdate, MaintenanceRecordOut, MaintenanceOverview,
)
from app.schemas.reports import (
    MachinePerformanceReportRow, SensorTrendReportRow, AlertReportRow,
    MaintenanceReportRow, ReportBundle,
)
from app.schemas.device import DeviceOut, DeviceUpdate, SensorMappingOut
from app.schemas.mqtt_status import MQTTStatusOut

__all__ = [
    "DatasetSummary", "TrainRequest", "ModelRunOut",
    "MachineBase", "MachineCreate", "MachineUpdate", "MachineOut",
    "UserLogin", "UserOut", "Token",
    "DashboardOverview",
    "SensorOut", "ThresholdUpdate", "SensorStateUpdate",
    "SensorReadingOut",
    "LiveMonitoringSnapshot", "LiveSensorPoint", "LiveHistoryPoint",
    "AlertOut", "AlertSummary",
    "MachineHealthOut", "RecommendationOut",
    "EnergyOverview", "EnergyTrendPoint", "MachineEnergyComparison",
    "MaintenanceRecordCreate", "MaintenanceRecordUpdate", "MaintenanceRecordOut", "MaintenanceOverview",
]