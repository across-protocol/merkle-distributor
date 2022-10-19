# merkle-distributor

This repository contains scripts to facilitate the Across Protocol airdrop.

## Get Started

Checkout the repository and change directory

```bash
git clone https://github.com/across-protocol/merkle-distributor.git && cd merkle-distributor
```

Install dependencies

```bash
yarn install
```

Run one of the scripts below.

## Scripts

### Create Merkle Tree

```
Usage: yarn create-tree [options]

Options:
  -i, --input <path>  input JSON file location containing a recipients payout
  -h, --help          display help for command
```

### Publish Merkle Tree

To publish a tree to IPFS and to the Scraper API, you need to set the respective env vars in an `.env` file.
Use the example file as a template by running

```bash
cp .env.example .env
```

and set the respective values. Afterward you can run the script below.

```
Usage: yarn publish-tree [options]

Options:
  -i, --input <path>   input JSON file location containing output of 'yarn create-tree'
  -ss, --skip-scraper  optional flag whether to skip scraper api upload (default: true)
  -h, --help           display help for command
```

### Set Merkle Root / Window

```
Usage: yarn set-root [options]

Options:
  -i, --input <path>  input JSON file location containing output of 'yarn create-tree'
  -h, --help          display help for command
```
