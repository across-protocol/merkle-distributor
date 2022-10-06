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

```
Usage: yarn publish-tree [options]

Options:
  -i, --input <path>  input JSON file location containing output of 'yarn create-tree'
  -h, --help          display help for command
```

### Set Merkle Root / Window

```
Usage: yarn set-root [options]

Options:
  -i, --input <path>  input JSON file location containing output of 'yarn create-tree'
  -h, --help          display help for command
```
