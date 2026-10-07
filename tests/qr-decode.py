"""Independent QA using the already-installed local OpenCV; never a site dependency.
Reads matrices or actual canvas PNGs from stdin, writes results only to stdout.
"""
import sys, json, base64
import cv2
import numpy as np

results = []
for case in json.loads(sys.stdin.buffer.read().decode('utf-8')):
    if 'png' in case:
        image = cv2.imdecode(np.frombuffer(base64.b64decode(case['png']), np.uint8), cv2.IMREAD_GRAYSCALE)
    else:
        image = np.where(np.array(case['modules']), 0, 255).astype(np.uint8)
        image = np.pad(image, 4, constant_values=255)
        image = cv2.resize(image, None, fx=8, fy=8, interpolation=cv2.INTER_NEAREST)
    decoded, points, _ = cv2.QRCodeDetector().detectAndDecode(image)
    detector = 'QRCodeDetector'
    if not decoded and hasattr(cv2, 'QRCodeDetectorAruco'):
        decoded, points, _ = cv2.QRCodeDetectorAruco().detectAndDecode(image)
        detector = 'QRCodeDetectorAruco'
    results.append({'name':case.get('name', ''), 'detected':points is not None, 'detector':detector, 'decoded':decoded, 'matched':decoded == case['expected']})
print(json.dumps(results))
sys.exit(0 if all(result['matched'] for result in results) else 1)
