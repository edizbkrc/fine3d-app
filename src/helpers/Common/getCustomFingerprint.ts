function generateStableUUID() {
  const timestamp = Date.now();
  const language = navigator.language;
  const userAgent = navigator.userAgent;
  const hardwareConcurrency = navigator.hardwareConcurrency;

  const data = `${timestamp}-${language}-${hardwareConcurrency}-${userAgent}`;

  return hashCode(data);
}

function hashCode(str: any) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `device-${Math.abs(hash)}`;
}

export function getDeviceID() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = generateStableUUID();
    localStorage.setItem("deviceId", deviceId);
  }

  return deviceId;
}
