/**
 * The Unimod data is licensed under the Design Science License.
 * To avoid polluting this project or any derivative project,
 * the Unimod data is not included with this repo and must be
 * downloaded separately.
 */

const fs = require('fs');
const http = require('http');
const readline = require('readline');
const path = require('path');

const xmlEndpoint = 'http://www.unimod.org/xml/unimod.xml';
const licenseEndpoint = 'http://www.unimod.org/dsl.txt';

const scriptDirectory = path.dirname(require.main.filename);

const downloadFile = (url, outputPath) => {
  const fullPath = path.join(scriptDirectory, outputPath);
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(fullPath);
    http
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (err) => {
        fs.unlink(fullPath);
        reject(err);
      });
  });
};

const promptUser = (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const main = async () => {
  const args = process.argv.slice(2);
  const autoAccept = args.includes('-y');

  try {
    console.log('Downloading license...');
    await downloadFile(licenseEndpoint, 'license.txt');
    const licenseContent = fs.readFileSync(
      path.join(scriptDirectory, 'license.txt'),
      'utf8'
    );
    fs.unlinkSync(path.join(scriptDirectory, 'license.txt'));
    console.log('License downloaded. Please read it:\n', licenseContent);

    if (!autoAccept) {
      const userResponse = await promptUser(
        'Do you accept the license? (yes/no) '
      );
      if (userResponse.toLowerCase() !== 'yes') {
        console.log('License not accepted. Exiting.');
        return;
      }
    }

    console.log('Downloading XML file...');
    await downloadFile(xmlEndpoint, 'unimod.xml');
    console.log(
      `XML file downloaded successfully to ${path.join(scriptDirectory, 'unimod.xml')}`
    );
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

main();

module.exports = {
  downloadUnimod: main,
};
