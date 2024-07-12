import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 4,
  duration: '60s'
};

export default function () {
  const res = http.get('http://172.xx.xx.xx:3000');
  check(res, {
    status: (r) => r.status < 400
  });
}
