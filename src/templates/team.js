import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
export default ({ data }) => {
  const allTeams = data.allTeamsJson.edges.reduce((acc, curr) => {
    const team = curr.node;
    acc[team.name] = team.fields.slug;
    return acc;
  }, {});
  const team = data.teamsJson
  const results = team.results.map(result => {
    const isHome = team.name === result.home;
    const winProbability = (result.elo.pregame.probability * 100).toFixed(1);
    const opponent = isHome ? result.visitor : result.home;
    const opponentLink = isHome ? allTeams[result.visitor] : allTeams[result.home];
 
    const calculateResult = (isHome, homeScore, visitorScore) => {
      
        if (homeScore > visitorScore) {
          return isHome ? 'W' : 'L';
        } else if (homeScore < visitorScore) {
          return isHome ? 'L' : 'W';
        } else {
          return 'T';
        }

      
    }
    
    const gameResult = calculateResult(isHome, result.homeScore, result.visitorScore);
    const score = result.homeScore > result.visitorScore ? `${result.homeScore} - ${result.visitorScore}` : `${result.visitorScore} - ${result.homeScore}`
    return (
      <tr>
        <td><span>{isHome ? 'vs' : '@'} </span><Link to={opponentLink}>{opponent}</Link></td>
        <td>{gameResult}</td>
        <td>{score}</td>
        <td>{result.record}</td>
        <td>{winProbability}</td>
    </tr>
    )
  })
  return (
    <Layout>
      <div>
        <h1>{team.name}</h1>
        <h1>{team.win} - {team.loss} - {team.tie}</h1>
        <h2>Goals For: {team.for}</h2>
        <h2>Goals Against: {team.against}</h2>
        <h2>Opponent Record: {team.opponentRecord.w} -  {team.opponentRecord.l} -  {team.opponentRecord.t}</h2>
        <table>
          <tr>
            <th>
              Opponent
            </th>
            <th>
              Result
            </th>
            <th>
              Score
            </th>
            <th>Record</th>
            <th>Win Probability</th>
          </tr>
          {results}
        </table>
      </div>
    </Layout>
  )
}
export const query = graphql`
  query($slug: String!) {
    allTeamsJson {
      edges {
          node {
            name
            fields {
              slug
            }
          }
        }
    }
    teamsJson(fields: { slug: { eq: $slug } }) {
        win
        loss
        tie
        name
        for
        against
        opponentRecord {
          w
          l
          t
        }
        results{
          home
          visitor
          homeScore
          visitorScore
          record
          
          elo {
            pregame {
              probability
            }
          }
        }
    }
  }
`