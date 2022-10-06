import { program } from "commander";

// TODO
// Get inspired from: https://github.com/UMAprotocol/protocol/blob/master/packages/merkle-distributor/scripts/2_PublishClaimsForWindow.ts

program
  .requiredOption(
    "-i, --input <path>",
    "input JSON file location containing output of 'yarn create-tree'"
  )
  .parse(process.argv);

async function main() {
  console.log("TODO");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
