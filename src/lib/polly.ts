// src/lib/polly.ts

import AWS from "aws-sdk";

// AWS picks up credentials from process.env.AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION
const polly = new AWS.Polly({
  apiVersion: "2016-06-10",
  region: process.env.AWS_REGION || "us-east-1",
});

export default polly;
