import { neo4j } from "@hypermode/modus-sdk-as"

const hostName: string = "my-neo4j"

@json
class GameSession {
    gamesession_id: string
    // status: string
    session_data: string
    // lifeSummary: string = ""

    constructor(
        gamesession_id: string,
        // status: string,
        session_data: string,
        // lifeSummary: string = ""
    ) {
        this.gamesession_id = gamesession_id;
        // this.status = status
        this.session_data = session_data
        // this.lifeSummary = lifeSummary;
    }
}

export function AllGameSessionNodes(): GameSession[] {
  const vars = new neo4j.Variables()

  // Explicitly name each property we want to return
  let query = `
    MATCH (g:GameSession)
    WHERE g.session IS NOT null
    RETURN 
      g.gamesession_id as gamesession_id,
      g.session as session_data
  `

  const result = neo4j.executeQuery(hostName, query, vars)
  if (!result) {
    throw new Error("Error fetching game session nodes")
  }

  const gameSessionNodes: GameSession[] = []

  for (let i = 0; i < result.Records.length; i++) {
    const record = result.Records[i]
    
    // Access properties directly using the aliases from the query
    const game = new GameSession(
      record.get("gamesession_id"),
      // record.get("status"),
      record.get("session_data"),
      // record.get("summary")
    )
    gameSessionNodes.push(game)
  }

  return gameSessionNodes
}
