import pandas as pd
from tabulate import tabulate

# Data: comparison of attendance systems
data = {
    "Feature / Criteria": [
        "Core Technology",
        "Hardware Dependency",
        "Infrastructure Requirement",
        "Ease of Integration / Setup",
        "Real-Time Attendance",
        "Anti-Proxy Measures",
        "Mobility / Flexibility",
        "Cost-Effectiveness",
        "User Interaction Required",
        "Scalability",
        "Data Logging / Reports",
        "Dependence on Internet",
        "Environmental / Lighting Sensitivity",
        "Scenarios / Use Cases"
    ],
    "RFID / Biometric Systems (Shah et al.)": [
        "RFID tags, fingerprint sensors",
        "High (readers, sensors)",
        "RFID readers, local database",
        "Moderate-Complex (hardware + software)",
        "Yes",
        "Moderate",
        "Low (fixed readers)",
        "Moderate",
        "Medium (scan card / fingerprint)",
        "Limited by hardware",
        "Yes, local & cloud optional",
        "Low",
        "Low",
        "Educational institutes"
    ],
    "Multi-Step Hardware (Sarker et al.)": [
        "RFID + Fingerprint + Password",
        "High (Arduino Mega, RFID, fingerprint, keypad)",
        "Local setup, desktop app",
        "Complex (3-step auth + hardware setup)",
        "Yes",
        "Very High",
        "Low-Medium (hardware + network)",
        "Moderate-High",
        "Medium (scan + password + fingerprint)",
        "Limited by hardware & desktop app",
        "Yes, local desktop app",
        "Low-Medium",
        "Low",
        "Educational institutes / secure access"
    ],
    "Wi-Fi + Face Recognition (Anand et al.)": [
        "Smartphone facial recognition + Wi-Fi fingerprinting",
        "Medium (smartphones)",
        "Wi-Fi coverage in classrooms",
        "Moderate (smartphones + Wi-Fi calibration)",
        "Yes",
        "High",
        "Medium (smartphone-based, classroom-bound)",
        "Low",
        "Medium (take selfie)",
        "Moderate (depends on Wi-Fi coverage)",
        "Yes, logs attendance",
        "Low-Medium",
        "Medium",
        "Classrooms"
    ],
    "QR/Time-based Field (Navin et al.)": [
        "QR codes, timed session handshake",
        "Low (smartphones + web server)",
        "Internet / web server",
        "Easy (mobile apps + portal)",
        "Yes",
        "High",
        "High (field personnel, any location)",
        "Very Low",
        "Medium (scan QR handshake)",
        "High (web-based, mobile-friendly)",
        "Yes, logs + timestamp",
        "High",
        "Low",
        "Field personnel / remote workers"
    ],
    "Face Recognition (Bhattacharya et al., SAMS)": [
        "Deep learning + CNN + Face Quality Assessment",
        "High (camera + portable device)",
        "Portable device, classroom-bound",
        "Moderate (setup device & camera)",
        "Yes",
        "High",
        "Medium (device portable, classroom-bound)",
        "Moderate",
        "Low (camera captures automatically)",
        "Moderate (hardware per classroom)",
        "Yes, database",
        "Low-Medium",
        "Medium",
        "Classrooms"
    ],
    "Face Recognition Deep Learning (Alhanaee et al.)": [
        "Deep transfer learning (AlexNet, GoogleNet, SqueezeNet)",
        "Medium-High (camera + computing device)",
        "Camera, computing device",
        "Moderate (training models + deployment)",
        "Yes",
        "High",
        "Medium (camera & computing device)",
        "Moderate-High",
        "Low-Medium (face detection)",
        "Moderate (model deployment per location)",
        "Yes, database",
        "Medium",
        "Medium",
        "Classrooms / offices"
    ],
    "QR Code Systems (Nuhi et al., Hendry et al.)": [
        "QR codes scanned via web / app",
        "Low (camera / smartphone)",
        "Minimal, any device with QR reader",
        "Easy (deploy web-based QR system)",
        "Yes",
        "Low-Moderate",
        "High (web + any device)",
        "Low",
        "Low (scan QR)",
        "High (web-based)",
        "Yes, web portal",
        "High",
        "Low",
        "Educational institutes"
    ],
    "Your System: AttendSmart": [
        "QR codes + timed session code",
        "Very Low (browser + camera)",
        "Minimal, any device with QR reader & web access",
        "Very Easy (plug & play web-based system)",
        "Yes",
        "High",
        "Very High (any device, any location, web-based)",
        "Very Low",
        "Low (scan QR / enter session code)",
        "Very High (web-based, multi-sector)",
        "Yes, logs, reports, admin dashboards",
        "Medium (web-based, server required)",
        "Low",
        "Educational institutes + companies (universal)"
    ]
}

# Create DataFrame
df = pd.DataFrame(data)

# Display table using tabulate for console output
print(tabulate(df, headers='keys', tablefmt='grid', showindex=False))
