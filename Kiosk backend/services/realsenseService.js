// services/realsenseService.js
const axios = require('axios');

const ENABLE_REALSENSE = process.env.ENABLE_REALSENSE === 'true';
const REALSENSE_HEALTH_URL = process.env.REALSENSE_HEALTH_URL || 'http://localhost:5000/api/health';

async function getRealSenseStatus() {
  if (!ENABLE_REALSENSE) {
    return {
      camera_name: 'Intel RealSense D435i',
      status: 'Disabled ⏸️',
      serial_number: 'N/A',
      firmware_version: 'N/A',
      connected: false
    };
  }

  try {
    const response = await axios.get(REALSENSE_HEALTH_URL, { timeout: 3000 });
    const data = response.data;
    const camera = data.camera || {};
    return {
      camera_name: camera.camera_name || 'Intel RealSense D435i',
      status: data.status || camera.status || (camera.connected ? 'online' : 'offline'),
      serial_number: camera.serial_number || 'N/A',
      firmware_version: camera.firmware_version || 'N/A',
      connected: camera.connected === true
    };
  } catch (error) {
  console.error('❌ RealSense health check failed:', error.message);
  if (error.code === 'ECONNREFUSED') console.error('   → Connection refused – is the health server running?');
  if (error.code === 'ETIMEDOUT') console.error('   → Timeout – increase timeout or check server latency');
  if (error.response) console.error('   → Response status:', error.response.status);
  return { /* offline status */ };
}
  
}

module.exports = { getRealSenseStatus };