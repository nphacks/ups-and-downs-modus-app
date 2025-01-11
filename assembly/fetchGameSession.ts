import { neo4j } from "@hypermode/modus-sdk-as"
import { JSON } from "json-as"
import { models } from "@hypermode/modus-sdk-as"
import {
  OpenAIChatModel,
  ResponseFormat,
  SystemMessage,
  UserMessage,
} from "@hypermode/modus-sdk-as/models/openai/chat"

const hostName: string = "my-neo4j"

@json
class Age {
  age: i32
  age_data: string

  constructor(age: i32, age_data: string) {
    this.age = age
    this.age_data = age_data
  }
}

@json
class GameSessionData {
  gamesession_id: string;
  player_id: string;
  player_name: string;
  ages: Age[];
  lifeSummary: string;

  constructor(
    gamesession_id: string,
    player_id: string,
    player_name: string,
    ages: Age[],
    lifeSummary: string = ""
  ) {
    this.gamesession_id = gamesession_id;
    this.player_id = player_id;
    this.player_name = player_name;
    this.ages = ages;
    this.lifeSummary = lifeSummary;
  }
}

@json
class ActionSkillData {
  skill_used: boolean;
  skill: string;

  constructor(skill_used: boolean, skill: string) {
    this.skill_used = skill_used;
    this.skill = skill;
  }
}

@json
class ActionObjectData {
  object_used: boolean;
  object: string;

  constructor(object_used: boolean, object: string) {
    this.object_used = object_used;
    this.object = object;
  }
}

// Update ActionData class to include new properties
@json
class ActionData {
  acted: boolean;
  action_question: string;
  action_description: string;
  skill_data: ActionSkillData | null;
  object_data: ActionObjectData | null;

  constructor(
    acted: boolean, 
    action_question: string, 
    action_description: string,
    skill_data: ActionSkillData | null,
    object_data: ActionObjectData | null
  ) {
    this.acted = acted;
    this.action_question = action_question;
    this.action_description = action_description;
    this.skill_data = skill_data;
    this.object_data = object_data;
  }
}

@json
class DecisionData {
  decision_made: boolean;
  decision_question: string;
  decision_description: string;

  constructor(decision_made: boolean, decision_question: string, decision_description: string) {
    this.decision_made = decision_made;
    this.decision_question = decision_question;
    this.decision_description = decision_description;
  }
}

@json
class SituationActionData {
  took_action: boolean;
  action: ActionData | null;

  constructor(took_action: boolean, action: ActionData | null) {
    this.took_action = took_action;
    this.action = action;
  }
}

@json
class SituationDecisionData {
  decision_made: boolean;
  decision_description: string;
  took_action: boolean;
  action: ActionData | null;

  constructor(
    decision_made: boolean,
    decision_description: string,
    took_action: boolean,
    action: ActionData | null
  ) {
    this.decision_made = decision_made;
    this.decision_description = decision_description;
    this.took_action = took_action;
    this.action = action;
  }
}

@json
class SituationData {
  faces_situation: boolean;
  situation_description: string;
  situation_action: SituationActionData | null;
  situation_decision: SituationDecisionData | null;

  constructor(
    faces_situation: boolean,
    situation_description: string,
    situation_action: SituationActionData | null,
    situation_decision: SituationDecisionData | null
  ) {
    this.faces_situation = faces_situation;
    this.situation_description = situation_description;
    this.situation_action = situation_action;
    this.situation_decision = situation_decision;
  }
}

@json
class AgeData {
  events: string | null;
  skill: string | null;
  action: ActionData | null;
  decision: DecisionData | null;
  situation: SituationData | null;

  constructor() {
    this.events = null;
    this.skill = null;
    this.action = null;
    this.decision = null;
    this.situation = null;
  }
}

function getEventData(sessionId: string, age: i32): string | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("age", age)

  const query = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    -[:HAS_PLAYER]->(:Player)-[:AT_AGE]->(a:Age {age: $age})
    -[*]-(e: Event)
    RETURN e.event_description as event_description
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null
  return result.Records[0].getValue<string>("event_description")
}

function getSkillData(sessionId: string, age: i32): string | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("age", age)

  const query = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    -[:HAS_PLAYER]->(:Player)-[:AT_AGE]->(a:Age {age: $age})
    -[r:HAS_ACQUIRED]->(s:Skill)
    RETURN s.skill as skill
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null
  return result.Records[0].getValue<string>("skill")
}

// New function to get action-related skill data
// function getActionSkillData(sessionId: string, actionId: string): ActionSkillData | null {
//   const vars = new neo4j.Variables()
//   vars.set("sessionId", sessionId)
//   vars.set("actionId", actionId)

//   const query = `
//     MATCH (ac:Action)
//     WHERE ID(ac) = $actionId
//     MATCH (ac)-[r:USES_SKILL]->(s:Skill)
//     RETURN 
//       r.skill_used as skill_used,
//       s.skill as skill
//   `

//   const result = neo4j.executeQuery(hostName, query, vars)
//   if (!result || result.Records.length === 0) return null

//   return new ActionSkillData(
//     result.Records[0].getValue<boolean>("skill_used"),
//     result.Records[0].getValue<string>("skill")
//   )
// }

function getActionSkillDataById(sessionId: string, actionId: string): ActionSkillData | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("actionId", actionId)

  const query = `
    MATCH (ac:Action)
    WHERE ID(ac) = $actionId
    MATCH (ac)-[r:USES_SKILL]->(s:Skill)
    RETURN 
      r.skill_used as skill_used,
      s.skill as skill
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null

  return new ActionSkillData(
    result.Records[0].getValue<boolean>("skill_used"),
    result.Records[0].getValue<string>("skill")
  )
}

// New function to get action-related object data
// function getActionObjectData(sessionId: string, actionId: string): ActionObjectData | null {
//   const vars = new neo4j.Variables()
//   vars.set("sessionId", sessionId)
//   vars.set("actionId", actionId)

//   const query = `
//     MATCH (ac:Action)
//     WHERE ID(ac) = $actionId
//     MATCH (ac)-[r:USES_OBJECT]->(o:Object)
//     RETURN 
//       r.object_used as object_used,
//       o.object as object
//   `

//   const result = neo4j.executeQuery(hostName, query, vars)
//   if (!result || result.Records.length === 0) return null

//   return new ActionObjectData(
//     result.Records[0].getValue<boolean>("object_used"),
//     result.Records[0].getValue<string>("object")
//   )
// }

function getActionObjectDataById(sessionId: string, actionId: string): ActionObjectData | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("actionId", actionId)

  const query = `
    MATCH (ac:Action)
    WHERE ID(ac) = $actionId
    MATCH (ac)-[r:USES_OBJECT]->(o:Object)
    RETURN 
      r.object_used as object_used,
      o.object as object
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null

  return new ActionObjectData(
    result.Records[0].getValue<boolean>("object_used"),
    result.Records[0].getValue<string>("object")
  )
}

// Function for getting skill data by age
function getActionSkillDataByAge(sessionId: string, age: i32): ActionSkillData | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("age", age)

  const query = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    -[:HAS_PLAYER]->(:Player)-[:AT_AGE]->(a:Age {age: $age})
    -[:HAS_ACTED]->(ac:Action)-[r:USES_SKILL]->(s:Skill)
    RETURN 
      r.skill_used as skill_used,
      s.skill as skill
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null

  return new ActionSkillData(
    result.Records[0].getValue<boolean>("skill_used"),
    result.Records[0].getValue<string>("skill")
  )
}

// Function for getting object data by age
function getActionObjectDataByAge(sessionId: string, age: i32): ActionObjectData | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("age", age)

  const query = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    -[:HAS_PLAYER]->(:Player)-[:AT_AGE]->(a:Age {age: $age})
    -[:HAS_ACTED]->(ac:Action)-[r:USES_OBJECT]->(o:Object)
    RETURN 
      r.object_used as object_used,
      o.object as object
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null

  return new ActionObjectData(
    result.Records[0].getValue<boolean>("object_used"),
    result.Records[0].getValue<string>("object")
  )
}

// Update the getActionData function
function getActionData(sessionId: string, age: i32): ActionData | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("age", age)

  const query = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    -[:HAS_PLAYER]->(:Player)-[:AT_AGE]->(a:Age {age: $age})
    -[r:HAS_ACTED]->(ac:Action)
    RETURN 
      r.acted as acted,
      ac.action_question as action_question,
      ac.action_description as action_description
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null

  const skillData = getActionSkillDataByAge(sessionId, age)
  const objectData = getActionObjectDataByAge(sessionId, age)

  return new ActionData(
    result.Records[0].getValue<boolean>("acted"),
    result.Records[0].getValue<string>("action_question"),
    result.Records[0].getValue<string>("action_description"),
    skillData,
    objectData
  )
}

function getDecisionData(sessionId: string, age: i32): DecisionData | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("age", age)

  const query = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    -[:HAS_PLAYER]->(:Player)-[:AT_AGE]->(a:Age {age: $age})
    -[r:HAS_DECIDED]->(d:Decision)
    RETURN 
      r.decision_made as decision_made,
      d.decision_question as decision_question,
      d.decision_description as decision_description
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null

  return new DecisionData(
    result.Records[0].getValue<boolean>("decision_made"),
    result.Records[0].getValue<string>("decision_question"),
    result.Records[0].getValue<string>("decision_description")
  )
}

function getActionDataForNode(sessionId: string, actionId: string): ActionData | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("actionId", actionId)

  const query = `
    MATCH (ac:Action)
    WHERE ID(ac) = $actionId
    RETURN 
      ac.action_question as action_question,
      ac.action_description as action_description
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null

  const skillData = getActionSkillDataById(sessionId, actionId)
  const objectData = getActionObjectDataById(sessionId, actionId)

  return new ActionData(
    true, // Since this action is connected, it was acted upon
    result.Records[0].getValue<string>("action_question"),
    result.Records[0].getValue<string>("action_description"),
    skillData,
    objectData
  )
}

// Update getSituationData function
function getSituationData(sessionId: string, age: i32): SituationData | null {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("age", age)

  const query = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    -[:HAS_PLAYER]->(:Player)-[:AT_AGE]->(a:Age {age: $age})
    -[r:FACES_A_SITUATION]->(s:Situation)
    OPTIONAL MATCH (s)-[ra:TOOK_ACTION]->(ac:Action)
    OPTIONAL MATCH (s)-[rd:HAS_DECIDED]->(d:Decision)-[rda:TOOK_ACTION]->(da:Action)
    RETURN 
      r.faces_situation as faces_situation,
      s.situation_question as situation_question,
      ra.took_action as direct_took_action,
      ID(ac) as action_id,
      rd.decision_made as decision_made,
      d.decision_description as decision_description,
      rda.took_action as decision_took_action,
      ID(da) as decision_action_id
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result || result.Records.length === 0) return null

  const record = result.Records[0]
  
  // Handle direct action relationship
  let situationAction: SituationActionData | null = null
  const directTookAction = record.getValue<boolean>("direct_took_action")
  const actionId = record.getValue<string>("action_id")
  if (directTookAction && actionId) {
    const actionData = getActionDataForNode(sessionId, actionId)
    situationAction = new SituationActionData(directTookAction, actionData)
  }

  // Handle decision and its action relationship
  let situationDecision: SituationDecisionData | null = null
  const decisionMade = record.getValue<boolean>("decision_made")
  const decisionDescription = record.getValue<string>("decision_description")
  const decisionTookAction = record.getValue<boolean>("decision_took_action")
  const decisionActionId = record.getValue<string>("decision_action_id")

  if (decisionMade) {
    let decisionActionData: ActionData | null = null
    if (decisionTookAction && decisionActionId) {
      decisionActionData = getActionDataForNode(sessionId, decisionActionId)
    }
    situationDecision = new SituationDecisionData(
      decisionMade,
      decisionDescription,
      decisionTookAction,
      decisionActionData
    )
  }

  return new SituationData(
    record.getValue<boolean>("faces_situation"),
    record.getValue<string>("situation_question"),
    situationAction,
    situationDecision
  )
}

function getAgeData(sessionId: string, maxAge: i32): Age[] {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)
  vars.set("maxAge", maxAge)

  const query = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    -[:HAS_PLAYER]->(:Player)-[:AT_AGE]->(a:Age)
    WHERE a.age >= 0 AND a.age <= $maxAge 
    RETURN a.age as age
    ORDER BY a.age
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result) {
    throw new Error("Error fetching age data")
  }

  const ages: Age[] = []
  for (let i = 0; i < result.Records.length; i++) {
    const age = result.Records[i].getValue<i32>("age")
    if (age >= 0) {
      const ageData = new AgeData()
      
      const events = getEventData(sessionId, age)
      const skill = getSkillData(sessionId, age)
      const action = getActionData(sessionId, age)
      const decision = getDecisionData(sessionId, age)
      const situation = getSituationData(sessionId, age)

      if (events) ageData.events = events
      if (skill) ageData.skill = skill
      if (action) ageData.action = action
      if (decision) ageData.decision = decision
      if (situation) ageData.situation = situation

      ages.push(new Age(age, JSON.stringify(ageData)))
    }
  }

  return ages
}

@json
class JsonGameSession {
  gamesession_id: string
  ages: JsonAge[]
  lifeSummary: string
  player_id: string
  player_name: string

  constructor(gamesession_id: string, ages: JsonAge[], lifeSummary: string, player_id: string, player_name: string) {
    this.gamesession_id = gamesession_id
    this.ages = ages
    this.lifeSummary = lifeSummary
    this.player_id = player_id
    this.player_name = player_name
  }
}

@json
class JsonAge {
  age: i32
  age_data: string

  constructor(age: i32, age_data: string) {
    this.age = age
    this.age_data = age_data
  }
}

// Update fetchGameSession
export function fetchGameSession(sessionId: string, maxAge: i32): GameSessionData {
  const vars = new neo4j.Variables()
  vars.set("sessionId", sessionId)

  const checkQuery = `
  MATCH (gs:GameSession {gamesession_id: $sessionId})
  RETURN 
    gs.session as session,
    gs.gamesession_id as gamesession_id
  `

  const checkResult = neo4j.executeQuery(hostName, checkQuery, vars)
  if (checkResult && checkResult.Records.length > 0) {
    const record = checkResult.Records[0]
    const existingSession = record.getValue<string>("session")
    
    if (existingSession) {
      // Parse the stored JSON into a temporary object
      const parsedData = JSON.parse<JsonGameSession>(existingSession)
      
      // Create a new GameSessionData with properly initialized arrays
      if (parsedData) {
        const ages = new Array<Age>(0)
        
        // Reconstruct each Age object from the parsed data
        if (parsedData.ages) {
          for (let i = 0; i < parsedData.ages.length; i++) {
            const ageData = parsedData.ages[i]
            if (ageData) {
              ages.push(new Age(ageData.age, ageData.age_data))
            }
          }
        }

        // Create new GameSessionData with the reconstructed ages array
        const sessionData = new GameSessionData(
          parsedData.gamesession_id,
          parsedData.player_id,
          parsedData.player_name,
          ages
        )
        sessionData.lifeSummary = parsedData.lifeSummary

        return sessionData
      }
    }
  }

  const query = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    -[:HAS_PLAYER]->(p:Player)
    RETURN 
      gs.gamesession_id as gamesession_id,
      p.player_id as player_id,
      p.name as player_name
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result) {
    throw new Error("Error fetching game session data")
  }

  const record = result.Records[0]
  const gamesession_id = record.getValue<string>("gamesession_id")
  const player_id = record.getValue<string>("player_id")
  const player_name = record.getValue<string>("player_name")
  
  // Start building the life story
  let lifeStory = "Life Story of " + player_name + "\n\n";
  
  // Modify getAgeData to return both ages and formatted story
  const ages = getAgeData(sessionId, maxAge)
  
  for (let i = 0; i < ages.length; i++) {
    const age = ages[i];
    lifeStory += "At age " + age.age.toString() + ":\n";
    
    // Add the age_data details to the story
    if (age.age_data) {
      lifeStory += age.age_data + "\n";
    }
    
    lifeStory += "\n";
  }

  const sessionData = new GameSessionData(
    gamesession_id,
    player_id,
    player_name,
    ages
  );

  // Use the incrementally built story for summarization
  sessionData.lifeSummary = SummarizeTheLife(lifeStory);

  const saveVars = new neo4j.Variables()
  saveVars.set("sessionId", sessionId)
  saveVars.set("session", JSON.stringify(sessionData))

  const saveQuery = `
    MATCH (gs:GameSession {gamesession_id: $sessionId})
    SET gs.session = $session
    RETURN gs
  `
  const saveResult = neo4j.executeQuery(hostName, saveQuery, saveVars)
  if (!saveResult) {
    throw new Error("Error saving session data")
  }

  return sessionData;
}



const modelName: string = "text-generator"

function SummarizeTheLife(snippet: string): string {
  const model = models.getModel<OpenAIChatModel>(modelName)
  const input = model.createInput([
    new SystemMessage("Summarize the life the player lived but also give insights on how they lived, focus more on insights."),
    new UserMessage(snippet),
    // new UserMessage(code),
    // new UserMessage(testcase),
  ])

  // this is one of many optional parameters available for the OpenAI chat interface
  input.temperature = 0.7

  const output = model.invoke(input)
  console.log(output.choices[0].message.content.trim())
  return output.choices[0].message.content.trim()
}