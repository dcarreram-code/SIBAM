
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

    def find_port(self):
        # Primero buscar el adaptador CP2102 de nuestra ESP32
        for port in list_ports.comports():
            if port.vid == 0x10C4 and port.pid == 0xEA60:
                return port.device

        # Alternativa: revisar el puerto habitual
        for port in list_ports.comports():
            if port.device in ("/dev/ttyUSB0", "/dev/ttyACM0"):
                return port.device

        return None

    def start(self):
        if self.running:
            return

        self.running = True
        self.thread = threading.Thread(
            target=self._read_loop,
            daemon=True
        )
        self.thread.start()

    def _read_loop(self):
        while self.running:
            port = self.find_port()

            if not port:
                self.connected = False
                self.port = None
                time.sleep(1)
                continue

            try:
                with serial.Serial(
                    port,
                    self.baudrate,
                    timeout=0.1
                ) as connection:
                    self.connected = True
                    self.port = port

                    # Algunas ESP32 se reinician al abrir el puerto
                    time.sleep(2)

                    while self.running:
                        raw = connection.readline()

                        if not raw:
                            continue

                        line = raw.decode(
                            "utf-8",
                            errors="ignore"
                        ).strip()

                        parts = line.split(",")

                        if len(parts) != 2:
                            continue

                        action = parts[0].strip().upper()

                        try:
                            lane = int(parts[1].strip())
                        except ValueError:
                            continue

                        if action not in ("DOWN", "UP"):
                            continue

                        if lane not in (1, 2, 3, 4):
                            continue

                        event = {
                            "action": action,
                            "lane": lane,
                            "timestamp": time.monotonic()
                        }

                        with self.lock:
                            self.events.append(event)

            except (serial.SerialException, OSError):
                time.sleep(1)

            finally:
                self.connected = False
                self.port = None

    def get_events(self):
        with self.lock:
            events = list(self.events)
            self.events.clear()

        return events

    def stop(self):
        self.running = False

        if self.thread:
            self.thread.join(timeout=2)
