// const axios = require('axios')
// const getLanguageById = (lang) => {
//     const language = {
//         'c++': 54,
//         'java': 62,
//         'javascript': 63,
//     }

//     return language[lang.toLowerCase()];
// }

// const submitBatch = async (submissions) => {

//     const options = {
//         method: 'POST',
//         url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//         params: {
//             base64_encoded: 'false'
//         },
//         headers: {
//             'x-rapidapi-key': 'c31c05f1cfmsh18ee09a77e93453p136528jsnb1fbee99b2c2',
//             'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//             'Content-Type': 'application/json'
//         },
//         data: {
//             submissions
//         }
//     };

//     async function fetchData() {
//         try {
//             const response = await axios.request(options);
//             return response.data;
//         } catch (error) {
//             // console.error(error);
//             console.log("error 1")

//         }
//     }

//     return await fetchData();

// }


// const waiting = async (timer) => {
//     setTimeout(() => {
//         return 1;
//     }, timer);
// }

// const submitToken = async (resultToken) => {
//     const options = {
//         method: 'GET',
//         url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//         params: {
//             tokens: resultToken.join(","),
//             base64_encoded: 'false',
//             fields: '*'
//         },
//         headers: {
//             'x-rapidapi-key': 'c31c05f1cfmsh18ee09a77e93453p136528jsnb1fbee99b2c2',
//             'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//         }
//     };

//     async function fetchData() {
//         try {
//             const response = await axios.request(options);
//             // console.log(response.data);
//             return response.data;
//         } catch (error) {
//             // console.error(error);
//             console.log("error 2")
//         }
//     }


//     while (true) {

//         const result = await fetchData();

//         const IsResultObtained = result.submissions.every((r) => r.status_id > 2);

//         if (IsResultObtained)
//             return result.submissions;


//         await waiting(1000);
//     }


// }


// module.exports = { getLanguageById, submitBatch, submitToken };

// //


const axios = require("axios");

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63,
  };

  return language[lang.toLowerCase()];
};

// FIXED: expects ARRAY
const submitBatch = async (submissions) => {
  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions/batch",
      { submissions }, //  correct shape
      {
        params: { base64_encoded: "true" },
        headers: {
          "x-rapidapi-key": process.env.JUDGE0_KEY,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // MUST RETURN
  } catch (error) {
    console.error(
      "submitBatch error:",
      error.response?.data || error.message
    );
    throw new Error("Judge0 batch submission failed");
  }
};

//  FIXED WAIT
const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const submitToken = async (resultToken) => {
  try {
    while (true) {
      const response = await axios.get(
        "https://judge0-ce.p.rapidapi.com/submissions/batch",
        {
          params: {
            tokens: resultToken.join(","),
            base64_encoded: "true",
            fields: "*",
          },
          headers: {
            "x-rapidapi-key": process.env.JUDGE0_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const submissions = response.data.submissions;

      const done = submissions.every(
        (s) => s.status_id > 2
      );

      if (done) return submissions;

      await wait(1000); // ✅ real delay
    }
  } catch (error) {
    console.error(
      "submitToken error:",
      error.response?.data || error.message
    );
    throw new Error("Judge0 polling failed");
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };