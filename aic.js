#!/usr/bin/env node

import inquirer from "inquirer";
import ora from "ora";
import gradient from "gradient-string";

import AIClient from "./lib/aiClient/aiClient.js";
import Logger from "./lib/logger.js";
import { getConfig, getCommand } from "./lib/cli.js";

import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

const logger = new Logger("chat");

function markdownToConsole(text) {
  let terminalHighlightedCode = "";
  try {
    marked.use(markedTerminal());

    terminalHighlightedCode = marked(text); //console.log(terminalHighlightedCode);
  } catch (error) {
    console.error("An error occurred while highlighting code:", error);
  }

  return terminalHighlightedCode;
}

async function askQuestion(question, client) {
  const spinner = ora(gradient.cristal("Thinking...")).start();
  try {
    const response = await client.generateResponse(question);
    spinner.succeed(gradient.cristal("Ready."));
    
    console.log(markdownToConsole(response.trim()));
  } catch (error) {
    spinner.fail(gradient.cristal("Failed to get response."));
    logger.error({ error: error.message }, "Error occurred.");
  }
}

async function chatPrompt() {
  const { result } = await inquirer.prompt([
    {
      type: "input",
      name: "result",
      message: ">",
    },
  ]);
  return result;
}

async function startConversation(client, initialQuestion) {
  let continueConversation = true;
  let question = initialQuestion;

  while (continueConversation) {
    if (!question) {
      question = await chatPrompt();
    }

    if (shouldExitConversation(question)) {
      continueConversation = false;
      break;
    }

    await askQuestion(question, client);
    question = null;
  }

  console.log(gradient.morning("Goodbye!"));
  process.exit(0);
}

function shouldExitConversation(question) {
  const exitWords = new Set(["exit", "goodbye", "quit"]);
  return !question || exitWords.has(question.toLowerCase().trim());
}

async function main(startConvo = true) {
  try {
    const command = await getCommand();
    const config = await getConfig(command);
    const client = new AIClient(config);
    if (startConvo) {
      await startConversation(client, command);
    } else {
      await askQuestion(command, client);
    }
    process.exit(0);
  } catch (error) {
    logger.error(`An error occurred: ${error.message}`);
    process.exit(1);
  }
}

if (!`file://${process.argv[1]}`.includes('!')) {
  main();
}

export default main;
