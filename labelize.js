const AWS = require('aws-sdk');
const fs = require('fs');

//AWS.config.loadFromPath('./config.json');
 AWS.config.loadFromPath('/home/pi/smartvision/config.json');

let file = process.argv[2];
let rekognition = new AWS.Rekognition({ apiVersion: "2016-06-27" });

// pull base64 representation of image from file system
fs.readFile(file, 'base64', (err, data) => {

    // create a new base64 buffer out of the string passed to us by fs.readFile()
    const buffer = new Buffer(data, 'base64');

    // now that we have things in the right type, send it to rekognition
    rekognition
      .detectLabels({
        Image: {
          Bytes: buffer,
        },
        MaxLabels: 15,
        MinConfidence: 86,
      })
      .promise()
      .then((res) => {
        let matchResults = parseResults(res.Labels);
        if (matchResults.length) {
          // return the results as a string to bash script to send email
          console.log(matchResults.join(", "));
        } else {
          console.log("No match");
        }
      });
});

function parseResults(results) {
  let searchTerms = [
    "People",
    "Male",
    "Female",
    "Selfie",
    "Costume",
    "Animal",
    "Mammal",
    "Cat",
    "Pet",
    "Dog",
  ];
  let foundTerms = [];
  results.map((result) => {
    if (
      searchTerms.indexOf(result.Name) >= 0 ||
      ((result.Name === "Person" || result.Name === "Human") &&
        result.Confidence > 95)
    ) {
      let confidence = result.Confidence.toFixed(2);
      let label = `${result.Name} ${confidence}%`;
      foundTerms.push(label);
    }
  });
  return foundTerms;
}
