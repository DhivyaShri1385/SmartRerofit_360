"""
Simulated sensor-data engine.

Architecture contract: SensorDataProvider defines the interface every
value source must implement. SimulatedDataProvider is the only
implementation today. When real ESP32/MQTT hardware is ready, a
HardwareDataProvider implementing the same interface can be swapped in
via engine.py's single provider reference — no other code changes.
"""