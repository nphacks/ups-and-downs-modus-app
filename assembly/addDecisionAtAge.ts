import { neo4j } from "@hypermode/modus-sdk-as"

const hostName: string = "my-neo4j"

export function AddDecisionAtAge(
  gameSessionId: string,
  playerId: string,
  age: i32,
  decisionQuestion: string,
  decisionDescription: string,
  decisionMade: bool,
  leadsTo: string,
  actionDescription: string,
  tookAction: bool,
  skill: string,
  skillUsed: bool,
  object: string,
  objectUsed: bool
): string {
  const vars = new neo4j.Variables()
  vars.set("gameSessionId", gameSessionId)
  vars.set("playerId", playerId)
  vars.set("age", age)
  vars.set("decisionQuestion", decisionQuestion)
  vars.set("decisionDescription", decisionDescription)
  vars.set("decisionMade", decisionMade)

  // Base query to create decision node and connect it to age
  let query = `
    MATCH (gs:GameSession {gamesession_id: $gameSessionId})-[:HAS_PLAYER]->(p:Player)

    CREATE (a:Age {age: $age, gamesession_id: $gameSessionId}) 
    
    MERGE (p)-[:AT_AGE {gamesession_id: $gameSessionId}]->(a)

    MERGE (decision:Decision {
        gamesession_id: $gameSessionId,
        decision_question: $decisionQuestion,
        description: $decisionDescription
    })

    MERGE (a)-[:HAS_DECIDED {decision_made: $decisionMade}]->(decision)
  `

  // If action is taken, extend query to create action node
  if (leadsTo !== "" && leadsTo === 'action') {
    vars.set("actionDescription", actionDescription)
    vars.set("tookAction", tookAction)
    query += `
      MERGE (action:Action {action_description: $actionDescription, gamesession_id: $gameSessionId})
      MERGE (decision)-[:TO_TAKE_ACTION {took_action: $tookAction}]->(action)
    `

    // If skill is used, create and connect skill node
    if (skill !== "") {
        vars.set("skill", skill)
        vars.set("skillUsed", skillUsed)
        query += `
            MERGE (skill:Skill {skill: $skill, gamesession_id: $gameSessionId})
            MERGE (action)-[:USES_SKILL {skill_used: $skillUsed}]->(skill)
        `
    }

    // If object is used, create and connect object node
    if (object !== "") {
        vars.set("object", object)
        vars.set("objectUsed", objectUsed)
        query += `
            MERGE (object:Object {object: $objectUsed, gamesession_id: $gameSessionId})
            MERGE (action)-[:USES_OBJECT {object_used: $objectUsed}]->(object)
        `
        }
  }

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result) {
    throw new Error("Error creating decision and related nodes")
  }

  return 'Decision created successfully'
}
