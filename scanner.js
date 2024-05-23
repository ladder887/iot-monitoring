const { parentPort } = require('worker_threads');
const nmap = require('node-nmap');
nmap.nmapLocation = "C:\\Program Files (x86)\\Nmap\\nmap"; // Nmap의 경로 설정

async function scanNetwork(range) {
  return new Promise((resolve, reject) => {
    let quickScan = new nmap.QuickScan(range);

    quickScan.on('complete', function(data) {
      resolve(data);
      //console.log(data)
    });

    quickScan.on('error', function(error) {
      reject(error);
    });
  });
}

parentPort.on('message', async (range) => {
  try {
    const scanResults = await scanNetwork(range);
    parentPort.postMessage({ scanResults, type: 'scan' });
  } catch (error) {
    parentPort.postMessage({ error });
  }
});
