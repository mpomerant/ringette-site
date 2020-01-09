import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
export default ({ data }) => {
  const game = data.gamesJson
  return (
    <Layout>
      <div>
        <h1>{game.home} - {game.visitor}</h1>
        <h1>{game.homeScore} - {game.visitorScore}</h1>
    
      </div>
    </Layout>
  )
}
export const query = graphql`
  query($slug: String!) {
    
    gamesJson(fields: { slug: { eq: $slug } }) {
        home
        homeScore
        visitor
        visitorScore
    }
  }
`