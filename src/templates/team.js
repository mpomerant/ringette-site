import React from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import UpcomingGamesTable from "../components/upcoming-game"
import GameResultTable from "../components/game-result-table"
import TeamCard from "../components/team-card";
import TabPanel from "../components/tab-panel";
import { makeStyles } from "@material-ui/core/styles"
import { Tabs, Tab } from "@material-ui/core"
import "./team.css"



const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));
export default ({ data }) => {

  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const allTeams = data.allTeamsJson.edges.reduce((acc, curr) => {
    const team = curr.node
    acc[team.name] = { link: team.fields.slug, record: team.record }
    return acc
  }, {})
  const team = data.teamsJson

  const upcoming = team.upcoming
    .sort((a, b) => {
      return a.isoDate - b.isoDate
    })
    .map(result => {
      const isHome = team.name === result.home;
      const winProbability = (result.elo.pregame.probability * 100).toFixed(1)
      const opponent = isHome ? result.visitor : result.home
      const oppData = isHome ? allTeams[result.visitor] : allTeams[result.home]
      const opponentLink = oppData ? oppData.link : "Not Available"
      const opponentRecord = oppData ? oppData.record : "Not Available"
      return {
        isHome,
        tournament: result.tournamentName,
        opponentLink,
        opponent,
        opponentRecord,
        date: `${result.date} ${result.time}`,
        isoDate: result.isoDate,
        winProbability,
      }
    })

  const nextGames = upcoming.slice(0, Math.min(5, upcoming.length))
  const nextGame = upcoming[0] || {};
  console.log(nextGame);
  const results = team.results
    .sort((a, b) => {
      return a.isoDate - b.isoDate
    })
    .map(result => {
      const isHome = team.name === result.home
      const winProbability = (result.elo.pregame.probability * 100).toFixed(1)
      const opponent = isHome ? result.visitor : result.home
      const oppData = isHome ? allTeams[result.visitor] : allTeams[result.home]
      const opponentLink = oppData ? oppData.link : "Not Available"
      const hs = parseInt(result.homeScore)
      const vs = parseInt(result.visitorScore)
      const calculateResult = (isHome, homeScore, visitorScore) => {
        if (homeScore > visitorScore) {
          return isHome ? "W" : "L"
        } else if (homeScore < visitorScore) {
          return isHome ? "L" : "W"
        } else {
          return "T"
        }
      }

      const gameResult = calculateResult(isHome, hs, vs)
      const resultClass =
        gameResult === "W"
          ? "game-win"
          : gameResult === "L"
          ? "game-loss"
          : "game-tie"
      const score =
        hs > vs
          ? `${result.homeScore} - ${result.visitorScore}`
          : `${result.visitorScore} - ${result.homeScore}`
      return {
        isHome,
        opponentLink,
        opponent,
        gameResult,
        tournament: result.tournamentName,
        date: result.date,
        time: result.time,
        isoDate: result.isoDate,
        resultClass,
        score,
        record: result.record,
        winProbability,
      }
    })
  return (
    <Layout>
      <div>
        <TeamCard team={team} next={nextGame} image={data.allFile.edges[0].node.childImageSharp}></TeamCard>
        
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Results"></Tab>
          <Tab label="Upcoming"></Tab>
        </Tabs>
        <TabPanel value={value} index={0}>
          <GameResultTable results={results}></GameResultTable>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <UpcomingGamesTable nextGames={nextGames}></UpcomingGamesTable>
        </TabPanel>
        

        
      </div>
    </Layout>
  )
}
export const query = graphql`
  query($name: String!, $slug: String!) {
    allFile(
      filter: {
        name: { eq: $name }
        extension: { eq: "png" }
        relativeDirectory: { eq: "team" }
      }
    ) {
      edges {
        node {
          name
          childImageSharp {
            fluid(maxHeight: 400) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
    allTeamsJson {
      edges {
        node {
          name
          record
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
      upcoming {
        isoDate
        tournamentName
        home
        visitor
        date
        time
        elo {
          pregame {
            probability
          }
        }
      }
      results {
        home
        tournamentName
        visitor
        homeScore
        visitorScore
        record
        date
        time
        isoDate
        elo {
          pregame {
            probability
          }
        }
      }
    }
  }
`
