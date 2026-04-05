async function testLogin() {
  console.log("Starting login test...");
  
  const baseUrl = "http://127.0.0.1:3004";

  // 1. Get CSRF Token
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  console.log("CSRF Token:", csrfToken);

  let sessionCookie = csrfRes.headers.get("set-cookie");
  console.log("Initial Cookie:", sessionCookie);

  // 2. Perform Login POST
  const loginBody = new URLSearchParams({
    email: "admin@hosapp.com",
    password: "Test@1234",
    csrfToken: csrfToken,
    json: "true"
  });

  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": sessionCookie || ""
    },
    body: loginBody.toString(),
    redirect: "manual"
  });

  console.log("Login Status:", loginRes.status);
  
  const setCookieHeader = loginRes.headers.get("set-cookie");
  console.log("Login Set-Cookie:", setCookieHeader);

  if (!setCookieHeader) {
     console.log("Failed to get session cookie, cannot proceed.");
     return;
  }

  // 3. Test accessing '/'
  const homeRes = await fetch(`${baseUrl}/`, {
    headers: {
      "Cookie": setCookieHeader
    },
    redirect: "manual" // don't follow automatically so we see the 30x
  });

  console.log("Home Status:", homeRes.status);
  console.log("Home Redirects to:", homeRes.headers.get("location"));

  // 4. Test accessing '/admin/dashboard'
  const dashRes = await fetch(`${baseUrl}/admin/dashboard`, {
    headers: {
       "Cookie": setCookieHeader
    },
    redirect: "manual"
  });
  
  console.log("Dashboard Status:", dashRes.status);
  console.log("Dashboard Redirects to:", dashRes.headers.get("location"));
}

testLogin().catch(console.error);
