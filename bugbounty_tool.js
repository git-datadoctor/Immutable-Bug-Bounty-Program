#!/usr/bin/env node
/**
 * Bug Bounty Report Submission Tool
 * For use with the Immutable Bug Bounty Program
 */

const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Set up environment variables
const BUGCROWD_USERNAME = process.env.BUGCROWD_sourceeye;
const BUGCROWD_API_KEY = process.env.BUGCROWD_API_KEY;

// Validate required environment variables
if (!BUGCROWD_USERNAME || !BUGCROWD_API_KEY) {
  console.error('Error: Missing required environment variables');
  console.log('Please set BUGCROWD_USERNAME and BUGCROWD_API_KEY');
  process.exit(1);
}

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to validate report
function validateReport(title, description, severity, pocUrl) {
  // Check length constraints
  if (title.length > 100) {
    return 'Error: Title exceeds maximum length of 100 characters';
  }
  if (description.length > 5000) {
    return 'Error: Description exceeds maximum length of 5000 characters';
  }
  
  // Check for required fields
  if (!title) return 'Error: Title cannot be empty';
  if (!description) return 'Error: Description cannot be empty';
  
  // Validate URL if provided
  if (pocUrl && !isValidUrl(pocUrl)) {
    return 'Error: Provided URL is invalid';
  }
  
  return null;
}

// Function to validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Function to submit report
async function submitReport(title, description, severity, pocUrl) {
  // Format report
  const report = {
    title,
    description,
    severity,
    pocUrl,
    username: BUGCROWD_USERNAME,
    timestamp: new Date().toISOString()
  };
  
  // Submit to Bugcrowd API
  try {
    const response = await axios.post(
      'https://api.bugcrowd.com/vulnerabilities',
      report,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BUGCROWD_API_KEY}`
        }
      }
    );
    
    return `Report submitted successfully! Vulnerability ID: ${response.data.id}`;
    
  } catch (error) {
    return `Error submitting report: ${error.response?.status} - ${error.response?.data}`;
  }
}

// Main function
async function main() {
  // Get report details
  const title = await new Promise(resolve => 
    rl.question('Enter vulnerability title: ', resolve)
  );
  
  const description = await new Promise(resolve => 
    rl.question('Enter vulnerability description: ', resolve)
  );
  
  const severity = await new Promise(resolve => 
    rl.question('Enter severity (P1-P5): ', resolve)
  );
  
  const pocUrl = await new Promise(resolve => 
    rl.question('Enter proof-of-concept URL (optional): ', resolve)
  );
  
  // Validate before submission
  const validationError = validateReport(title, description, severity, pocUrl);
  if (validationError) {
    console.error(validationError);
    return;
  }
  
  // Submit report
  const result = await submitReport(title, description, severity, pocUrl);
  console.log(result);
  
  // Close readline interface
  rl.close();
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
