import React from "react"
import {  graphql } from "gatsby"
import Layout from "../components/layout"
import Link from '../components/Link';
import MaterialTable from "material-table";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

const {useState} = React;
export default ({ data }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const allTeams = data.allTeamsJson.edges.reduce((acc, curr) => {
    const team = curr.node;
    acc[team.name] = team.fields.slug;
    return acc;
  }, {});
  const team = data.teamsJson
  const results = team.results.sort((a, b) => {
    const _a = new Date(a.date);
    const _b = new Date(b.date);
    if (_a.getMonth() > 9) {
        _a.setFullYear(2019);
    } else {
        _a.setFullYear(2020);
    }
    if (_b.getMonth() > 9) {
        _b.setFullYear(2019);
    }else {
        _b.setFullYear(2020);
    }
    return _a - _b;
}).map(result => {
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
    return {
      isHome,
      opponentLink,
      opponent,
      gameResult,
      score,
      record: result.record,
      winProbability
    } 
  });
  return (
  
    <Layout>
      
      <div>
        <h1>{team.name}</h1>
        <h1>{team.win} - {team.loss} - {team.tie}</h1>
        <h2>Goals For: {team.for}</h2>
        <h2>Goals Against: {team.against}</h2>
        <h2>Opponent Record: {team.opponentRecord.w} -  {team.opponentRecord.l} -  {team.opponentRecord.t}</h2>
        <MaterialTable
      options={{
        sorting: false,
        search: false,
        paging: false,
        pageSize: 100,
        headerStyle: {
          backgroundColor: '#000',
          color: '#FFF'
        }
      }}
          columns={[
            { title: "Opponent",
            cellStyle: {
              backgroundColor: '#F7F7F7',
              color: '#556cd6'
            },
            render: game => <span>{game.isHome ? 'vs' : '@'} <Link to={game.opponentLink}>{game.opponent}</Link></span> },
            { title: "Result", field: "gameResult" },
            { title: "Score", field: "score" },
            { title: "Record", field: "record"},
            { title: "Win Probability", field: "winProbability"}
          ]}
          data={results}
          title="Game Results"
        />
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
          date
          elo {
            pregame {
              probability
            }
          }
        }
    }
  }
`