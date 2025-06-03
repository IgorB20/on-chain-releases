import { IExecDataProtectorDeserializer } from "@iexec/dataprotector-deserializer";
import fs from "node:fs/promises";

const writeTaskOutput = async (path, message) => {
  try {
    await fs.writeFile(path, message);
    console.log(`File successfully written at path: ${path}`);
  } catch {
    console.error(`Failed to write Task Output`);
    process.exit(1);
  }
};

const main = async () => {
  const iexecOut = process.env.IEXEC_OUT;

  const deserializer = new IExecDataProtectorDeserializer();
  const file = await deserializer.getValue("file", "application/octet-stream"); //to be compatible with dataProtectorSharing the protectedData should contain a file named file

  try {
    await fs.writeFile(`${iexecOut}/content`, file); // post-compute will zip the folder inside the iexec_out
  } catch (err) {
    console.error(err);
    console.error("Failed to copy content to output");
  }

  await writeTaskOutput(
    `${iexecOut}/computed.json`,
    JSON.stringify({
      "deterministic-output-path": `${iexecOut}/content`,
    })
  );
};

main();

// const main = async () => {
//   const { IEXEC_OUT } = process.env;

//   let computedJsonObj = {};

//   try {
//     let messages = [];

//     // Example of process.argv:
//     // [ '/usr/local/bin/node', '/app/src/app.js', 'Bob' ]
//     const args = process.argv.slice(2);
//     console.log(`Received ${args.length} args`);
//     messages.push(args.join(' '));

//     try {
//       const deserializer = new IExecDataProtectorDeserializer();
//       // The protected data mock created for the purpose of this Hello World journey
//       // contains an object with a key "secretText" which is a string
//       const protectedName = await deserializer.getValue('secretText', 'string');
//       console.log('Found a protected data');
//       messages.push(protectedName);
//     } catch (e) {
//       console.log('It seems there is an issue with your protected data:', e);
//     }

//     // Transform input text into an ASCII Art text
//     const asciiArtText = figlet.textSync(
//       `Hello, ${messages.join(' ') || 'World'}!`
//     );

//     // Write result to IEXEC_OUT
//     await fs.writeFile(`${IEXEC_OUT}/result.txt`, asciiArtText);

//     // Build the "computed.json" object
//     computedJsonObj = {
//       'deterministic-output-path': `${IEXEC_OUT}/result.txt`,
//     };
//   } catch (e) {
//     // Handle errors
//     console.log(e);

//     // Build the "computed.json" object with an error message
//     computedJsonObj = {
//       'deterministic-output-path': IEXEC_OUT,
//       'error-message': 'Oops something went wrong',
//     };
//   } finally {
//     // Save the "computed.json" file
//     await fs.writeFile(
//       `${IEXEC_OUT}/computed.json`,
//       JSON.stringify(computedJsonObj)
//     );
//   }
// };

// main();
