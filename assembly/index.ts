import { neo4j } from "@hypermode/modus-sdk-as"
import { JSON } from "json-as";
export * from "./determineGoodOrBadDecision";
export * from "./createGameSession";
export * from "./fetchGameSession";
export * from "./addDecisionAtAge";
export * from "./addActionAtAge";
export * from "./addSituationAtAge";
export * from "./addEventAtAge";
export * from "./addSkillAtAge";
// This host name should match one defined in the modus.json manifest file.
const hostName: string = "my-neo4j"





// export function GetPlayerDetails(id: string, name: string): PlayerDetails[] {
//   if (!id || !name) {
//     throw new Error("Id or Name missing");
//   }

//   const query = `
//     MATCH (n:Player {name: $name, id: $id})-[r*]-(connected)
//     RETURN n, connected, r
//   `;

//   const vars = new neo4j.Variables();
//   vars.set("id", id);
//   vars.set("name", name);

//   const result = neo4j.executeQuery(hostName, query, vars);
//   if (!result || result.Records.length === 0) {
//     throw new Error(result ? "Player not found." : "Error fetching player details.");
//   }

//   const details: PlayerDetails[] = [];

//   for (let i = 0; i < result.Records.length; i++) {
//     const record = result.Records[i];
//     details.push(
//       new PlayerDetails(
//         record.getValue<string>("n"),
//         record.getValue<string[]>("connected"),
//         record.getValue<string[]>("r")
//       )
//     );
//   }
//   return simplifyDetails(details);
// }

// function simplifyDetails(details: PlayerDetails[]): any {
//   return details.map(detail => {
//     const node = JSON.parse(`{${detail.node as string}}`) as { Id: number; Labels: string[]; Props: any };
//     const nodes = [
//       { id: node.Id, labels: node.Labels, props: node.Props }
//     ];
    
//     const relationships = detail.relationships.map(relStr => {
//       const rel = JSON.parse(`{${relStr as string}}`) as { Type: string; StartId: number; EndId: number };
//       return { type: rel.Type, start: rel.StartId, end: rel.EndId };
//     });

//     return { nodes, relationships };
//   });
// }






// @json
// class Player {
//   id: string
//   name: string

//   constructor(id: string, name: string) {
//     this.id = id,
//     this.name = name
//   }
// }

// export function CreatePlayer(id: string, name: string, fatherName: string, motherName: string): string {
//   if (!id || !name || !fatherName || !motherName) {
//     throw new Error("Id, Name, Father Name, or Mother Name missing")
//   }

//   const createPlayerQuery = `
//     MERGE (p:Player {id: $id})
//     SET p.name = $name

//     MERGE (a:Age {id: $id + '-age'})
//     ON CREATE SET a.age = 0

//     MERGE (p)-[:AT_AGE]->(a)

//     MERGE (f:Player {id: $fatherId})
//     SET f.name = $fatherName

//     MERGE (m:Player {id: $motherId})
//     SET m.name = $motherName

//     MERGE (a)-[:HAS_RELATION]->(f)
//     MERGE (a)-[:HAS_RELATION]->(m)
//   `;

//   const playerVars = new neo4j.Variables()
//   playerVars.set("id", id);
//   playerVars.set("name", name);
//   playerVars.set("fatherId", id + "-father");
//   playerVars.set("fatherName", fatherName);
//   playerVars.set("motherId", id + "-mother");
//   playerVars.set("motherName", motherName);

//   const result = neo4j.executeQuery(hostName, createPlayerQuery, playerVars)
//   if (!result) {
//     throw new Error("Error creating player.")
//   }

//   return "Player created successfully"
// }