import { neo4j } from "@hypermode/modus-sdk-as"

const hostName: string = "my-neo4j"

export function AddActionAtAge(
  gameSessionId: string,
  playerId: string,
  age: i32,
  actionQuestion: string,
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
  vars.set("actionQuestion", actionQuestion)
  vars.set("actionDescription", actionDescription)
  vars.set("tookAction", tookAction)

  // Base query to create age node and action node
  let query = `
    MATCH (gs:GameSession {gamesession_id: $gameSessionId})-[:HAS_PLAYER]->(p:Player)

    CREATE (a:Age {age: $age, gamesession_id: $gameSessionId}) 
    
    MERGE (p)-[:AT_AGE {gamesession_id: $gameSessionId}]->(a)

    MERGE (action:Action {
        gamesession_id: $gameSessionId,
        action_question: $actionQuestion,
        action_description: $actionDescription
    })

    MERGE (a)-[:HAS_ACTED {took_action: $tookAction}]->(action)
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

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result) {
    throw new Error("Error creating action and related nodes")
  }

  return 'Action created successfully'
}
