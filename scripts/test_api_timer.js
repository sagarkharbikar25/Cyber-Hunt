require('dotenv').config({ path: '.env.local' });
const { signToken } = require('./src/lib/jwt');

async function getMockSessionCookie() {
  const token = await signToken({ team_id: 'TEST-EPSILON', role: 'team' });
  return `cyberhunt_session=${token}`;
}

async function testFetch() {
  const cookie = await getMockSessionCookie();
  const headers = { 'Cookie': cookie };
  
  const res1 = await fetch('http://localhost:3000/api/dashboard', { headers });
  const data1 = await res1.json();
  console.log("Fetch 1 startedAt:", data1.team?.startedAt);
  
  await new Promise(r => setTimeout(r, 2000)); // wait 2 sec
  
  const res2 = await fetch('http://localhost:3000/api/dashboard', { headers });
  const data2 = await res2.json();
  console.log("Fetch 2 startedAt:", data2.team?.startedAt);
}
testFetch();
