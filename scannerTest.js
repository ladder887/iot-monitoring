const nmap = require('node-nmap');
nmap.nmapLocation = "C:\\Program Files (x86)\\Nmap\\nmap"; // nmap이 설치된 경로


let quickscan = new nmap.QuickScan('192.168.1.*'); // 대상 네트워크 범위

quickscan.on('complete', function(data){
  console.log(data); // 스캔 완료 시 결과 출력
});

quickscan.on('error', function(error){
  console.log(error);
});

quickscan.start();

