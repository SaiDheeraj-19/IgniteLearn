const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:5001/api/roadmap/generate', {
      userId: "guest_" + Date.now(),
      interests: ["technology"],
      language: "en"
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Status:", err.response?.status);
    console.log("Data:", err.response?.data);
  }
}
test();
