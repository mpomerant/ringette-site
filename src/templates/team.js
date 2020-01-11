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
    
    marginRight: '10px',
    marginBottom: '20ps'
  }
});

const useStylesTeamCard = makeStyles({
  card: {
    padding: '20px',
    marginBottom: '20px'
  }
});
const {useState} = React;
export default ({ data }) => {
  const classes = useStyles();
  const teamCardClasses = useStylesTeamCard();
  
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const imageClass = matches ? 'team-image-lg' : 'team-image';
  const allTeams = data.allTeamsJson.edges.reduce((acc, curr) => {
    const team = curr.node;
    acc[team.name] = {link: team.fields.slug, record: team.record};
    return acc;
  }, {});
  const team = data.teamsJson

  const upcoming = team.upcoming.sort((a, b) => {
    return a.isoDate - b.isoDate;
  }).map(result => {
    const isHome = team.name === result.home;
    const winProbability = (result.elo.pregame.probability * 100).toFixed(1);
    const opponent = isHome ? result.visitor : result.home;
    const oppData = isHome ? allTeams[result.visitor] : allTeams[result.home];
    const opponentLink = oppData ? oppData.link : 'Not Available';
    const opponentRecord = oppData ? oppData.record : 'Not Available';
    return {
      isHome,
      opponentLink,
      opponent,
      opponentRecord,
      date: `${result.date} ${result.time}`,
      isoDate: result.isoDate,
      winProbability
    } 
  });

  const nextGames = upcoming.slice(0, Math.min(5, upcoming.length));
  const results = team.results.sort((a, b) => {
    return a.isoDate - b.isoDate;
}).map(result => {
    const isHome = team.name === result.home;
    const winProbability = (result.elo.pregame.probability * 100).toFixed(1);
    const opponent = isHome ? result.visitor : result.home;
    const oppData = isHome ? allTeams[result.visitor] : allTeams[result.home];
    const opponentLink = oppData ? oppData.link : 'Not Available';
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
      date: result.date,
      time: result.time,
      isoDate: result.isoDate,
      resultClass,
      score,
      record: result.record,
      winProbability
    } 
  });
  return (
  
    <Layout>
      
      <div>
        <Card className={teamCardClasses.card}>
          
        <div class="team-card">
          <div class={imageClass}><Img fluid={data.allFile.edges[0].node.childImageSharp.fluid} alt="No Image Found"></Img></div>
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
        search: false,
        paging: false,
        pageSize: 100,
        headerStyle: {
          backgroundColor: '#44bac8',
          color: '#FFF',
          textAlign: 'center',
          whitSpace: 'nowrap'
        },
        cellStyle: {
         textAlign: 'center',
         whitSpace: 'nowrap'
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
            
            { title: "Date", 
            field: "date",
            cellStyle: {
              textAlign: 'center'
              
            },
            whiteSpace: 'nowrap' 
          },
          { title: "Opponent Record", field: "opponentRecord",cellStyle: {
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }},  
          { title: "Win Probability", field: "winProbability",cellStyle: {
            textAlign: 'center'
            
          }}
          ]}
          data={nextGames}

          
          title="Upcoming Games"
        />
        
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
            { title: "Date", 
            field: "date",
            cellStyle: {
              textAlign: 'center'
              
            },
            whiteSpace: 'nowrap' 
          },
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
        results{
          home
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