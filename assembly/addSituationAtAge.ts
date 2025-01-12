import { neo4j } from "@hypermode/modus-sdk-as"

const hostName: string = "my-neo4j"

export function AddSituationAtAge(
  gameSessionId: string,
  playerId: string,
  age: i32,
  situationQuestion: string,
  situationDescription: string,
  leadsTo: string, 
  decisionDescription: string,
  decisionMade: bool,
  actionDescription: string,
  tookAction: bool,
  usedAnythingForAction: string,
  skill: string,
  skillUsed: bool,
  object: string,
  objectUsed: bool
): string {
  const vars = new neo4j.Variables()
  vars.set("gameSessionId", gameSessionId)
  vars.set("playerId", playerId)
  vars.set("age", age)
  vars.set("situationQuestion", situationQuestion)
  vars.set("situationDescription", situationDescription)
  

  // Base query to create age and situation nodes
  let query = `
    MATCH (gs:GameSession {gamesession_id: $gameSessionId})-[:HAS_PLAYER]->(p:Player)

    MERGE (a:Age {age: $age, gamesession_id: $gameSessionId})  
    
    MERGE (p)-[:AT_AGE {gamesession_id: $gameSessionId}]->(a)

    MERGE (situation:Situation {
        gamesession_id: $gameSessionId,
        situation_question: $situationQuestion,
        situation_description: $situationDescription
    })

    MERGE (a)-[:FACES_A_SITUATION]->(situation)
  `

  // Handle different routes
  if (leadsTo == "decision") {
    vars.set("decisionDescription", decisionDescription)
    vars.set("decisionMade", decisionMade)
    vars.set("actionDescription", actionDescription)
    vars.set("tookAction", tookAction)
    
    query += `
        MERGE (decision:Decision {
            gamesession_id: $gameSessionId,
            decision_description: $decisionDescription
        })
        MERGE (situation)-[:HAS_DECIDED {decision_made: $decisionMade}]->(decision)
        MERGE (decision)-[:TOOK_ACTION {took_action: $tookAction}]->(action)
    `
  } else if (leadsTo == "action") {
    // Direct route from situation to action
    vars.set("actionDescription", actionDescription)
    vars.set("tookAction", tookAction)
    query += `
        MERGE (action:Action {
            gamesession_id: $gameSessionId,
            action_description: $actionDescription
        })
        MERGE (situation)-[:TOOK_ACTION {took_action: $tookAction}]->(action)
    `

    // If skill is used, create and connect skill node
    if (usedAnythingForAction == "skill") {
        vars.set("skill", skill)
        vars.set("skillUsed", skillUsed)
        query += `
            MERGE (skill:Skill {skill: $skill, gamesession_id: $gameSessionId})
            MERGE (action)-[:USES_SKILL {skill_used: $skillUsed}]->(skill)
        `
    }

    // If object is used, create and connect object node
    if (usedAnythingForAction == "object") {
        vars.set("object", object)
        vars.set("objectUsed", objectUsed)
        query += `
            MERGE (object:Object {object: $object, gamesession_id: $gameSessionId})
            MERGE (action)-[:USES_OBJECT {object_used: $objectUsed}]->(object)
        `
    }
  }

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result) {
    throw new Error("Error creating situation and related nodes")
  }

  return 'Situation created successfully'
}
