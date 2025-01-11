import { neo4j } from "@hypermode/modus-sdk-as"

const hostName: string = "my-neo4j"

export function AddSkillAtAge(
  gameSessionId: string,
  playerId: string,
  age: i32,
  skill: string,
  acquired: bool
): string {
  const vars = new neo4j.Variables()
  vars.set("gameSessionId", gameSessionId)
  vars.set("playerId", playerId)
  vars.set("age", age)
  vars.set("skill", skill)
  vars.set("acquired", acquired)

  // Query to create age and skill nodes with relationship
  let query = `
    MATCH (gs:GameSession {gamesession_id: $gameSessionId})-[:HAS_PLAYER]->(p:Player)

    CREATE (a:Age {age: $age, gamesession_id: $gameSessionId}) 
    
    MERGE (p)-[:AT_AGE {gamesession_id: $gameSessionId}]->(a)

    MERGE (skill:Skill {
        gamesession_id: $gameSessionId,
        skill: $skill
    })

    MERGE (a)-[:HAS_ACQUIRED {acquired: $acquired}]->(skill)
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result) {
    throw new Error("Error creating skill and related nodes")
  }

  return 'Skill created successfully'
}
