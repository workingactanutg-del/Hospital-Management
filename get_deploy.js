async function getDeployment() {
  const res = await fetch("https://api.github.com/repos/workingactanutg-del/Hospital-Management/deployments");
  const data = await res.json();
  const latest = data.find(d => d.environment === "Production" || d.environment === "Preview");
  if (latest) {
    const statusRes = await fetch(latest.statuses_url);
    const statusData = await statusRes.json();
    if (statusData.length > 0) {
      console.log("LATEST URL:", statusData[0].environment_url);
    } else {
      console.log("No statuses yet");
    }
  }
}
getDeployment();
