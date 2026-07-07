async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gov.iq',
        password: 'Admin@12345'
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Login result:', data);
  } catch (err) {
    console.error('Login failed:', err);
  }
}
test();
