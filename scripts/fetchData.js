import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.VITE_API_KEY;
const BASE_URL = 'https://solve.ivy.homes';

const EMAIL = 'demo1@ivy.homes';
const PASSWORD = 'cde483bd0b';

if (!API_KEY) {
  throw new Error(
    'VITE_API_KEY is missing. Make sure it is present in your .env file.'
  );
}

async function sweepEndpoint(endpoint, token) {
  console.log(`\nSweeping ${endpoint}...`);

  let offset = 0;
  const limit = 200;

  const allRecords = [];
  let keepFetching = true;

  while (keepFetching) {
    const url = `${BASE_URL}${endpoint}?offset=${offset}&limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-API-Key': API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        `\nFailed at offset ${offset}: ${response.status} ${errorText}`
      );

      break;
    }

    const data = await response.json();

    const results = data.results || data.data || [];

    if (results.length === 0) {
      break;
    }

    allRecords.push(...results);

    process.stdout.write(
      `\rFetched offset ${offset} (${allRecords.length} total records)`
    );

    /*
     * Rely on the API's actual has_more flag.
     */
    if (data.has_more === false) {
      keepFetching = false;
    } else {
      /*
       * Increment by the number of records actually received.
       */
      offset += results.length;
    }
  }

  console.log('\n');

  const filename =
    endpoint.replace('/v1/', '') + '.json';

  const dataDirectory = path.join(
    process.cwd(),
    'data'
  );

  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, {
      recursive: true,
    });
  }

  const filepath = path.join(
    dataDirectory,
    filename
  );

  fs.writeFileSync(
    filepath,
    JSON.stringify(allRecords, null, 2)
  );

  console.log(
    `Saved ${allRecords.length} records to data/${filename}`
  );
}

async function run() {
  console.log('Authenticating...');

  const authResponse = await fetch(
    `${BASE_URL}/auth/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },

      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    }
  );

  console.log(
    `Auth status: ${authResponse.status}`
  );

  const authText = await authResponse.text();

  /*
   * Print the server response so we can diagnose
   * authentication problems.
   */
  console.log(
    'Auth response:',
    authText
  );

  let authData;

  try {
    authData = JSON.parse(authText);
  } catch {
    throw new Error(
      'Authentication response was not valid JSON.'
    );
  }

  /*
   * The API may return either access_token or token.
   */
  const token =
    authData.access_token ||
    authData.token;

  if (!token) {
    throw new Error(
      'Authentication failed: no access token returned.'
    );
  }

  console.log(
    'Authentication successful.'
  );

  const dataDirectory = path.join(
    process.cwd(),
    'data'
  );

  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, {
      recursive: true,
    });
  }

  await sweepEndpoint(
    '/v1/listings',
    token
  );

  await sweepEndpoint(
    '/v1/rentals',
    token
  );

  await sweepEndpoint(
    '/v1/projects',
    token
  );

  console.log(
    '\nAll data downloaded successfully!'
  );
}

run().catch((error) => {
  console.error(
    '\nData download failed:',
    error
  );

  process.exit(1);
});