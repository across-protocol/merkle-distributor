import fs from "fs";

export function parseInputFile(inputFilePath: string) {
  if (!fs.existsSync(inputFilePath)) {
    throw new Error(`File ${inputFilePath} does not exist`);
  }

  return JSON.parse(fs.readFileSync(inputFilePath, { encoding: "utf8" }));
}

export function writeToOutput(
  outputFileName: string,
  outputFileContent: Record<string, any>
) {
  const outputDirPath = `${process.cwd()}/generated`;

  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath);
  }

  const outputFilePath = `${outputDirPath}/${outputFileName}`;
  fs.writeFileSync(outputFilePath, JSON.stringify(outputFileContent));

  return outputFilePath;
}
