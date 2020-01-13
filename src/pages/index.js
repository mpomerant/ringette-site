import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Img from 'gatsby-image';
import {  graphql } from "gatsby"
import Layout from "../components/layout"
import Link from '../components/link';
import MaterialTable from "material-table";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

import TabPanel from "../components/tab-panel";
import { Tabs, Tab } from "@material-ui/core"
import './main.css';


export default function Index({data}) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const imgClass = matches ? 'team-thumb-sm' : 'team-thumb';
  const teams = data.allTeamsJson.edges.map(team => team.node).map((_team, index) => {
    const team = {..._team};
    console.log(team);
    team.rank = index + 1;
    return team;
  });
  const games = data.allGamesJson.edges.map(team => team.node)
  .filter(game => game.status.toLowerCase().includes('official'))
  .sort((a, b) => {
    return a.isoDate - b.isoDate;
  })
  .map(item => {
    const game = {...item};
    game.gameDate = `${game.date} ${game.time}`;
    return game;
  });
const lastGames = games.slice(Math.max(games.length - 10, 1));

const unoffialGames = data.allGamesJson.edges.map(team => team.node)
  .filter(game => !game.status.toLowerCase().includes('official'))
  .sort((a, b) => {
    return a.isoDate - b.isoDate;
  })
  .map(item => {
    const game = {...item};
    game.gameDate = `${game.date} ${game.time}`;
    return game;
  });;

const nextGames = unoffialGames.slice(0, Math.min(unoffialGames.length,25));


  const imageMap = data.allFile.edges.reduce((acc, curr) => {
      const name = curr.node.name;
      acc[name] = curr.node.childImageSharp.fluid;
      return acc;
  }, {})
  console.log(imageMap);
  return (
    <Layout>


    <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Standings"></Tab>
          <Tab label="Last Results"></Tab>
          <Tab label="Upcoming"></Tab>
        </Tabs>
        <TabPanel value={value} index={0}>
        <MaterialTable
      options={{
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
            { title: "Team (Rank)", 
            field: "name",
            cellStyle: {
              backgroundColor: '#F7F7F7',
              color: '#556cd6',
              maxWidth: '200px',
              
              textAlign: 'left',
              
            },
            headerStyle: {
              minWidth: '185px'
            },
            customSort: (a, b) => a.rank - b.rank,
            render: (team) => {
              const name = team.name.indexOf('-') > 0 ? team.name.substring(0, team.name.lastIndexOf('-')).trim() : team.name;
               return (<Link class="team-link" to={team.fields.slug}><div class={imgClass}><Img fluid={imageMap[name]} alt="No Image Found"></Img></div>{team.name} ({team.rank})</Link>);
            },
            },
            { title: "Record", field: "record",cellStyle: {
              maxWidth: '70px',
              whiteSpace: 'nowrap'
            },
            headerStyle: {
              maxWidth: '70px'
            } },
            { title: "PTS", field: "points", type: "numeric",cellStyle: {
              maxWidth: '60px',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            },
            headerStyle: {
              maxWidth: '60px',
              minWidth: '80px'
            }},
            { title: "%", field: "pct", type: "numeric",
            render: team => <span>{team.pct.toFixed(3)}</span> },
            
            { title: "SoS", field: "strengthOfSchedule", type: "numeric",
            render: team => <span>{team.strengthOfSchedule.toFixed(3)}</span> },
          ]}
          data={teams}

          
          title="Team Rankings"
        />
        </TabPanel>
        <TabPanel value={value} index={1}>
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
            { title: "Tournament", 
            field: "tournamentName",
            cellStyle: {
              textAlign: 'center'
              
            },
            whiteSpace: 'nowrap' 
          },
            { title: "Date", 
            field: "gameDate",
            },
            { title: "Home", 
            field: "home",
            },
            { title: "", 
            field: "homeScore",
            },
            { title: "", 
            field: "visitorScore",
            },
            { title: "Visitor", 
            field: "visitor",
            }
          ]}
          data={lastGames}

          
          title="Last 10 Results"
        />
        </TabPanel>
        <TabPanel value={value} index={2}>
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
            { title: "Tournament", 
            field: "tournamentName",
            cellStyle: {
              textAlign: 'center'
              
            },
            whiteSpace: 'nowrap' 
          },
            { title: "Date", 
            field: "gameDate",
            },
            { title: "Home", 
            field: "home",
            },
            
            { title: "Visitor", 
            field: "visitor",
            }
          ]}
          data={nextGames}

          
          title="Upcoming Games"
        />
          </TabPanel>


      

    </Layout>
  );
}



export const query = graphql`
  query {
    allFile(filter: {extension: {eq: "png"}, relativeDirectory: {eq: "team"}}) {
      edges {
        node {
          name
          childImageSharp {
            fluid(maxHeight: 50) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
    allGamesJson {
      edges {
        node {
          date
          time
          isoDate
          home
          status
          visitor
          homeScore
          visitorScore,
          tournamentName
        }
      }
    }
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
          record
          pct
          elo
          strengthOfSchedule
          games
          fields {
            slug
          }
        }
      }
    }
  }
`
