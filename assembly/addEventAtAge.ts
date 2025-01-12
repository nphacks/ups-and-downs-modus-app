import { neo4j } from "@hypermode/modus-sdk-as"

const hostName: string = "my-neo4j"

export function AddEventAtAge(
  gameSessionId: string,
  playerId: string,
  age: i32,
  eventDescription: string
): string {
  const vars = new neo4j.Variables()
  vars.set("gameSessionId", gameSessionId)
  vars.set("playerId", playerId)
  vars.set("age", age)
  vars.set("eventDescription", eventDescription)

  // Query to create age and event nodes with relationship
  let query = `
    MATCH (gs:GameSession {gamesession_id: $gameSessionId})-[:HAS_PLAYER]->(p:Player)

    MERGE (a:Age {age: $age, gamesession_id: $gameSessionId}) 
    
    MERGE (p)-[:AT_AGE {gamesession_id: $gameSessionId}]->(a)

    MERGE (event:Event {
        gamesession_id: $gameSessionId,
        event_description: $eventDescription
    })

    MERGE (a)-[:EVENT_OCCURRED]->(event)
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result) {
    throw new Error("Error creating event and related nodes")
  }

  return 'Event created successfully'
}
