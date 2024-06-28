require('dotenv').config();

const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// 환경 변수 설정
const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086';  // 실제 InfluxDB URL로 변경
const org = 'iot';  // 실제 조직 이름으로 변경
const bucket = 'test';  // 실제 버킷 이름으로 변경

// InfluxDB 클라이언트 생성
const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket);

// 예제 데이터 포인트 생성
const point = new Point('measurement_name')
  .floatField('value', 120.45);

// 데이터 쓰기
writeApi.writePoint(point);
writeApi
  .close()
  .then(() => {
    console.log('WRITE FINISHED');
  })
  .catch((e) => {
    console.error(e);
    console.log('WRITE FAILED');
  });
