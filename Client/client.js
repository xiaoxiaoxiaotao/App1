// Define the URL to send the request to
const url = 'http://localhost:5000/controller';

// Define the payload to be sent in the request
const args = process.argv;
const userInput = args[2]; // the first param

let inputModel = {
    Number: userInput
};

let jsonString = JSON.stringify(inputModel);


// Define the function to send the POST request
async function sendPostRequest() {
  try {
    // Use fetch to send a POST request
    const response = await fetch(url, {
      method: 'POST', // Request method
      headers: {
        'Content-Type': 'application/json' // Request headers, indicating that the data is JSON
      },
      body: jsonString // Request body, converting JavaScript object to JSON string
    });

    // Check the response status
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response data
    const data = await response.json();
    console.log('Response data:', data);

  } catch (error) {
    console.error('Error sending POST request:', error);
  }
}

// Call the function to send the POST request
sendPostRequest();
