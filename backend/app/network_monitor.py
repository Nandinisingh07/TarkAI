import time
import os
import threading
import ipaddress
import psutil
from datetime import datetime
from pathlib import Path

LOG_FILE = Path(__file__).resolve().parent.parent.parent / "network_audit.log"

class NetworkMonitor:
    def __init__(self):
        self.lock = threading.Lock()
        self.external_calls_detected = 0
        self.log_history = []
        self.running = False
        self.thread = None
        self._ensure_log_file()

    def _ensure_log_file(self):
        if not LOG_FILE.exists():
            with open(LOG_FILE, "w", encoding="utf-8") as f:
                f.write(f"[{datetime.now().isoformat()}] AUDIT_LOG_INITIALIZED: Air-Gap Network Monitor active.\n")

    def _log_event(self, message: str, is_external: bool = False):
        timestamp = datetime.now().isoformat()
        entry = f"[{timestamp}] {'[WARNING - EXTERNAL CALL DETECTED]' if is_external else '[OK - LOCAL AIR-GAPPED]'} {message}"
        
        with self.lock:
            # Deduplicate repeating logs
            if self.log_history and self.log_history[-1].endswith(message):
                return

            if is_external:
                self.external_calls_detected += 1
            self.log_history.append(entry)
            if len(self.log_history) > 100:
                self.log_history.pop(0)

        try:
            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write(entry + "\n")
        except Exception:
            pass

    def is_local_ip(self, ip_str: str) -> bool:
        if not ip_str or ip_str in ("127.0.0.1", "localhost", "0.0.0.0", "::1", "::"):
            return True
        try:
            ip = ipaddress.ip_address(ip_str)
            return ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_multicast or ip.is_reserved
        except ValueError:
            return False

    def check_connections(self):
        try:
            pids = {os.getpid()}
            try:
                main_proc = psutil.Process(os.getpid())
                for child in main_proc.children(recursive=True):
                    pids.add(child.pid)
            except Exception:
                pass

            connections = psutil.net_connections(kind="inet")
            for conn in connections:
                if conn.pid in pids and conn.status == psutil.CONN_ESTABLISHED and conn.raddr:
                    remote_ip = conn.raddr.ip
                    remote_port = conn.raddr.port
                    if not self.is_local_ip(remote_ip):
                        self._log_event(f"External connection to {remote_ip}:{remote_port} (PID: {conn.pid})", is_external=True)
                    else:
                        self._log_event(f"Local connection to {remote_ip}:{remote_port} (PID: {conn.pid})", is_external=False)
        except Exception:
            pass

    def start_monitoring(self, interval_seconds: int = 3):
        if self.running:
            return
        self.running = True

        def loop():
            self._log_event("Air-Gap Network Monitor started background audit thread for Workbench PID.")
            while self.running:
                self.check_connections()
                time.sleep(interval_seconds)

        self.thread = threading.Thread(target=loop, daemon=True)
        self.thread.start()

    def stop_monitoring(self):
        self.running = False

    def get_status(self) -> dict:
        with self.lock:
            logs = list(self.log_history)
            if not logs and LOG_FILE.exists():
                try:
                    with open(LOG_FILE, "r", encoding="utf-8") as f:
                        logs = [line.strip() for line in f.readlines()[-25:]]
                except Exception:
                    pass

            return {
                "air_gapped": True,
                "external_calls_detected": self.external_calls_detected,
                "status": "SECURE" if self.external_calls_detected == 0 else "WARNING",
                "log": logs[-50:],
                "timestamp": datetime.now().isoformat()
            }

network_monitor = NetworkMonitor()
