import AWS from "aws-sdk";

const polly = new AWS.Polly({
  apiVersion: "2016-06-10",
  region: process.env.AWS_REGION || "us-east-1",
});

export default polly;
