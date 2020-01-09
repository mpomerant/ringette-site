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
    const winProbability = (result.elo.pregame.probability * 100).toFixed(1) 
    const isFavorite = winProbability > 0.5;

    return (
      <tr>
        <td><Link to={allTeams[result.home]}>{result.home}</Link> </td>
        <td>{result.homeScore}</td>
        <td>{result.visitorScore}</td>
        <td><Link to={allTeams[result.visitor]}>{result.visitor}</Link></td>
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
        <table>
          <tr>
            <th>
              Home
            </th>
            <th>

            </th>
            <th>

            </th>
            <th>Visitor</th>
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
        results{
          home
          visitor
          homeScore
          visitorScore
          elo {
            pregame {
              probability
            }
          }
        }
    }
  }
`