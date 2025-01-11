import { neo4j } from "@hypermode/modus-sdk-as"

const hostName: string = "my-neo4j"

@json
class Player {
  id: string
  name: string

  constructor(id: string, name: string) {
    this.id = id,
    this.name = name
  }
}

export function CreateGameSession(gameSessionId: string, id: string, name: string, eventDescription: string): string {
  if (!gameSessionId || !id || !name || !eventDescription) {
    throw new Error("Id, Name, Event Description missing")
  }

  const createPlayerQuery = `
    MERGE (gs:GameSession {gamesession_id: $gameSessionId})

    MERGE (p:Player {player_id: $id, gamesession_id: $gameSessionId})
    SET p.name = $name

    MERGE (gs)-[:HAS_PLAYER]->(p)

    MERGE (a:Age {gamesession_id: $gameSessionId})
    ON CREATE SET a.age = 0.0

    MERGE (p)-[:AT_AGE {gamesession_id: $gameSessionId}]->(a)

    MERGE (e:Event {gamesession_id: $gameSessionId})
    ON CREATE SET e.event_description = $eventDescription

    MERGE (a)-[:EVENT_OCCURED {gamesession_id: $gameSessionId}]->(e)
  `;

  const playerVars = new neo4j.Variables()
  playerVars.set("gameSessionId", gameSessionId);
  playerVars.set("id", id);
  playerVars.set("name", name);
  playerVars.set("eventDescription", eventDescription);

  const result = neo4j.executeQuery(hostName, createPlayerQuery, playerVars)
  if (!result) {
    throw new Error("Error creating player.")
  }

  return "Game Session and Player created successfully"
}