// netlify/functions/deploy-succeeded.js

// This is an event-triggered function that runs on "deploy-succeeded".
exports.handler = async function(event, context) {
// 1. GET YOUR SECRETS
// These are stored in the Netlify UI, not in your code.
const githubToken = process.env.GITHUB_PAT;
const githubUser = process.env.GITHUB_USER;
const githubRepo = process.env.GITHUB_REPO;

// 2. DEFINE THE REQUEST
const url = `https://api.github.com/repos/${githubUser}/${githubRepo}/dispatches`;
const payload = {
  event_type: 'netlify-deploy-success', // This must match your GitHub Action's 'on.repository_dispatch.types'
};

console.log(`Sending dispatch request to: ${url}`);

// 3. SEND THE REQUEST
try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  // 4. HANDLE THE RESPONSE
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`GitHub API Error: ${response.status} - ${errorBody}`);
    return { statusCode: response.status, body: `Failed to trigger GitHub Action. Server responded with: ${errorBody}` };
  }

  console.log('Successfully triggered the GitHub Action workflow.');
  return {
    statusCode: 204, // Use 204 "No Content" for a successful dispatch
    body: 'Workflow triggered.',
  };

} catch (error) {
  console.error('An unexpected error occurred:', error);
  return {
    statusCode: 500,
    body: `An error occurred while trying to trigger the workflow: ${error.message}`,
  };
}
};