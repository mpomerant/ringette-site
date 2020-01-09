import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

const IndexPage = ({data}) => {
  console.log(data);
  const games = data.allTeamsJson.edges;
  const items = games.map(item => {
    const team = item.node;
    return (
      <tr>
        <td><Link to={team.fields.slug}>{team.name}</Link></td>
        <td>{team.win}-{team.loss}-{team.tie}</td>
        <td>{team.points}</td>
        <td>{team.pct.toFixed(3)}</td>
        <td>{team.elo.toFixed(3)}</td>
      </tr>
    )
   });
  return (
    <Layout>
      <SEO title="Home" />
      
      <table>
<tr>
  <th>Team</th>
  <th>Record</th>
  <th>Points</th>
  <th>%</th>
  <th>Power Ranking</th>
</tr>
      {items}
      </table>
    </Layout>
    )
  }

export default IndexPage

export const query = graphql`
  query {
    allTeamsJson(sort: {fields: elo, order: DESC}) {
      pageInfo {
        itemCount
      }
      edges {
        node {
          name
          win
          loss
          tie
          points
          pct
          elo
          games
          fields {
            slug
          }
        }
      }
    }
  }
`