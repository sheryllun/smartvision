const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.loadFromPath('/home/pi/config.json');

let rekognition = new AWS.Rekognition({ apiVersion: '2016-06-27' });
let file = process.argv[2];

// pull base64 representation of image from file system
fs.readFile(file, 'base64', (err, data) => {

    // create a new base64 buffer out of the string passed to us by fs.readFile()
    const buffer = new Buffer(data, 'base64');

    // now that we have things in the right type, send it to rekognition
    rekognition.detectLabels({
        Image: {
            Bytes: buffer
        },
        MaxLabels: 15,
        MinConfidence: 75
    }).promise()
    .then((res) => {
        let matchResults = parseResults(res.Labels);
        if (matchResults.length) {
            // Return the results as a string to bash script to send email
            // WBN to pass this directly to the node email script, but
            // the Google OAuth2 Gmail client is CLI so I couldn't pass the results
            // through as params
            console.log(matchResults.join(', '));
        } else {
            console.log('No match');
        }
    });
});

function parseResults(results) {
    let searchTerms = ['Human', 'Person', 'People', 'Male', 'Female', 'Selfie', 'Costume', 'Animal', 'Mammal', 'Cat', 'Pet', 'Dog'];
    let foundTerms = [];
    results.map(result => {
        if (searchTerms.indexOf(result.Name) >= 0) {
            foundTerms.push(result.Name);
        }
    });
    return foundTerms;
}
