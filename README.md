
import threading
import time
from collections import deque

import serial
from serial.tools import list_ports


class ESP32Controller:
    def __init__(self, baudrate=115200):
        self.baudrate = baudrate
        self.events = deque()
        self.lock = threading.Lock()
        self.running = False
        self.thread = None
        self.connected = False
        self.port = None




 
        import time
        from hardware.esp32_controller import ESP32Controller

        controller = ESP32Controller()
    controller.start()

    print("=== BALAM BEAT ===")
    print("Receptor ESP32 iniciado")
    print("Presiona Ctrl+C para salir")

    try:
    while True:
        for event in controller.get_events():
            lane = event["lane"]
            action = event["action"]

            if action == "DOWN":
                print(f"Carril {lane}: PRESIONADO")
            elif action == "UP":
                print(f"Carril {lane}: LIBERADO")

        time.sleep(0.005)

    except KeyboardInterrupt:
    print("\nCerrando receptor...")

    finally:
    controller.stop()

