import { models } from "@hypermode/modus-sdk-as"
import {
  OpenAIChatModel,
  ResponseFormat,
  SystemMessage,
  UserMessage,
} from "@hypermode/modus-sdk-as/models/openai/chat"

// this model name should match the one defined in the modus.json manifest file
const modelName: string = "text-generator"

export function AnalysisChat(snippet: string): string {
  const model = models.getModel<OpenAIChatModel>(modelName)
  const input = model.createInput([
    new SystemMessage("You have the conversation of life analysis between analysis bot and the analyzer. Answer the last question prompted by the analyzer."),
    new UserMessage(snippet)
  ])

  // this is one of many optional parameters available for the OpenAI chat interface
  input.temperature = 0.7

  const output = model.invoke(input)
  console.log(output.choices[0].message.content.trim())
  return output.choices[0].message.content.trim()
}