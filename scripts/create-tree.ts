import { program } from "commander";

// TODO
// Get inspired from: https://github.com/UMAprotocol/protocol/blob/master/packages/merkle-distributor/scripts/1_CreateClaimsForWindow.ts

program
  .requiredOption(
    "-i, --input <path>",
    "input JSON file location containing a recipients payout"
  )
  .parse(process.argv);

async function main() {
  console.log("TODO");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
