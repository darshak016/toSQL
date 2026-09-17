"""
Start Script for toSQL Application.
Launches both FastAPI backend (uvicorn) and React frontend (Vite) concurrently,
streams their output, and shuts down both cleanly on Ctrl+C.
"""

import os
import sys
import subprocess
import signal
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"


def get_python_executable():
    # Prefer virtualenv python if present
    if sys.platform == "win32":
        venv_py = ROOT_DIR / "venv" / "Scripts" / "python.exe"
    else:
        venv_py = ROOT_DIR / "venv" / "bin" / "python"

    if venv_py.is_file():
        return str(venv_py)
    return sys.executable


def get_npm_executable():
    npm_cmd = shutil.which("npm") or shutil.which("npm.cmd")
    if not npm_cmd and sys.platform == "win32":
        # Check standard default installation paths on Windows
        candidate = Path(os.environ.get("ProgramFiles", "C:\\Program Files")) / "nodejs" / "npm.cmd"
        if candidate.is_file():
            return str(candidate)
    return npm_cmd or "npm"


def main():
    print("=" * 60)
    print(" 🚀 Starting toSQL (Backend + Frontend)")
    print("=" * 60)

    python_exec = get_python_executable()
    npm_exec = get_npm_executable()

    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = str(BACKEND_DIR)

    # Command to run backend
    backend_cmd = [
        python_exec,
        "-m",
        "uvicorn",
        "app.main:app",
        "--reload",
        "--port",
        "8000",
    ]

    # Command to run frontend
    frontend_cmd = [npm_exec, "run", "dev"]

    processes = []

    try:
        print(f"[*] Starting backend on http://127.0.0.1:8000 (Python: {python_exec})")
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=str(ROOT_DIR),
            env=backend_env,
        )
        processes.append(("Backend", backend_proc))

        print(f"[*] Starting frontend (Vite) in {FRONTEND_DIR}...")
        frontend_proc = subprocess.Popen(
            frontend_cmd,
            cwd=str(FRONTEND_DIR),
            shell=(sys.platform == "win32"),
        )
        processes.append(("Frontend", frontend_proc))

        print("\n[+] Both services are starting up!")
        print("    - Backend:  http://127.0.0.1:8000")
        print("    - Docs:     http://127.0.0.1:8000/docs")
        print("    - Frontend: http://localhost:5173")
        print("\nPress Ctrl+C to terminate both servers.\n")

        # Wait for either process to exit
        while True:
            for name, proc in processes:
                ret = proc.poll()
                if ret is not None:
                    print(f"\n[!] {name} process exited with returncode {ret}.")
                    return
            try:
                # Sleep briefly to avoid busy waiting
                import time
                time.sleep(0.5)
            except KeyboardInterrupt:
                raise

    except KeyboardInterrupt:
        print("\n[*] Stopping servers...")
    finally:
        for name, proc in processes:
            if proc.poll() is None:
                print(f"[*] Terminating {name}...")
                try:
                    if sys.platform == "win32":
                        # Terminate child processes tree on Windows
                        subprocess.run(
                            ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                            capture_output=True,
                            check=False,
                        )
                    else:
                        proc.terminate()
                except Exception:
                    pass
        print("[+] All services stopped.")


if __name__ == "__main__":
    main()
