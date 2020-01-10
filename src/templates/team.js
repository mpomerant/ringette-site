import React from "react"
import {  graphql } from "gatsby"
import { makeStyles } from '@material-ui/core/styles';
import Layout from "../components/layout"
import Link from '../components/link';
import MaterialTable from "material-table";
import {Card, CardHeader, CardContent, Typography} from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import Img from 'gatsby-image';
import './team.css';

const useStyles = makeStyles({
  card: {
    maxWidth: 120,
    minWidth: 120,
    
    marginRight: '10px'
  }
});
const {useState} = React;
export default ({ data }) => {
  const classes = useStyles();
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
    const hs = parseInt(result.homeScore);
    const vs = parseInt(result.visitorScore);
    const calculateResult = (isHome, homeScore, visitorScore) => {
      
        if (homeScore > visitorScore) {
          return isHome ? 'W' : 'L';
        } else if (homeScore < visitorScore) {
          return isHome ? 'L' : 'W';
        } else {
          return 'T';
        }

      
    }
    
    const gameResult = calculateResult(isHome, hs, vs);
    const resultClass = gameResult === 'W' ? 'game-win' : gameResult === 'L' ? 'game-loss' : 'game-tie';
    const score = hs > vs ? `${result.homeScore} - ${result.visitorScore}` : `${result.visitorScore} - ${result.homeScore}`
    return {
      isHome,
      opponentLink,
      opponent,
      gameResult,
      resultClass,
      score,
      record: result.record,
      winProbability
    } 
  });
  return (
  
    <Layout>
      
      <div>
        <Card>
          
        <div class="team-card">
          <div class="team-image"><Img fluid={data.allFile.edges[0].node.childImageSharp.fluid} alt="No Image Found"></Img></div>
          <div class="team-details">
            <div class="team-name">{team.name}</div>
            <div class="team-record">Record: {team.win} - {team.loss} - {team.tie}</div>
            <div class="team-record">Opponents: {team.opponentRecord.w} -  {team.opponentRecord.l} -  {team.opponentRecord.t}</div>
            
          </div> 
          <div class="team-stats">
            <Card className={classes.card}>
              <CardHeader titleTypographyProps={{align: 'center'}} title="For">
              </CardHeader>
              <CardContent>
              <Typography align="center" gutterBottom variant="h6" component="h2">
                {team.for}
              </Typography>
                
                </CardContent>
              
            </Card>
            <Card className={classes.card}>
              <CardHeader titleTypographyProps={{align: 'center'}} title="Against">
              </CardHeader>
              <CardContent>
              
                <Typography align="center" gutterBottom variant="h6" component="h2">
                {team.against}
              </Typography>
              </CardContent>
     
            </Card>
          </div> 
          
        </div>

        </Card>
        
       
        
        
        
        <MaterialTable
      options={{
        sorting: false,
        search: false,
        paging: false,
        pageSize: 100,
        headerStyle: {
          backgroundColor: '#44bac8',
          color: '#FFF',
          textAlign: 'center',
          whiteSpace: 'nowrap'
        },
        cellStyle: {
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }
      }}
          columns={[
            { title: "Opponent",
            cellStyle: {
              backgroundColor: '#F7F7F7',
              color: '#556cd6',
              maxWidth: '150px'
            },
            render: game => <span>{game.isHome ? 'vs' : '@'} <Link to={game.opponentLink}>{game.opponent}</Link></span> },
            { 
              title: "Result",
              cellStyle: {
                textAlign: 'center',
              },
              render: game => <span class={game.resultClass}>{game.gameResult}</span>
          },
            { title: "Score", field: "score",cellStyle: {
              textAlign: 'center'
              
            } },
            { title: "Record", field: "record",cellStyle: {
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }},
            { title: "Win Probability", field: "winProbability",cellStyle: {
              textAlign: 'center'
              
            }}
          ]}
          data={results}
          title="Game Results"
        />
        </div>
    </Layout>
  )
}
export const query = graphql`
  query($name: String!, $slug: String!) {
    allFile(filter: {name: {eq: $name}, extension: {eq: "png"}, relativeDirectory: {eq: "team"}}) {
      edges {
        node {
          name
          childImageSharp {
            fluid(maxHeight: 200) {
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