const { parentPort } = require('worker_threads');
const nmap = require('node-nmap');
nmap.nmapLocation = "C:\\Program Files (x86)\\Nmap\\nmap"; // Nmap의 경로 설정

async function scanNetwork(range) {
  return new Promise((resolve, reject) => {
    let quickScan = new nmap.QuickScan(range);

    quickScan.on('complete', function(data) {
      //console.log('Scan complete:', data);
      resolve(data);
    });

    quickScan.on('error', function(error) {
      console.error('Scan error:', error);
      reject(error);
    });

  });
}

parentPort.on('message', async (range) => {
  try {
    //console.log('Received range:', range);
    const scanResults = await scanNetwork(range);
    //console.log('Posting scan results:', scanResults);
    parentPort.postMessage({ scanResults, type: 'scanResults' });
  } catch (error) {
    console.error('Scan failed:', error);
    parentPort.postMessage({ error });
  }
});
