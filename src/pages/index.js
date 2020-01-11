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
import './main.css';


export default function Index({data}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const teams = data.allTeamsJson.edges.map(team => team.node);
  const games = data.allGamesJson.edges.map(team => team.node)
  .filter(game => game.status === 'Official')
  .sort((a, b) => {
    return a.isoDate - b.isoDate;
  })
  .map(item => {
    const game = {...item};
    game.gameDate = `${game.date} ${game.time}`;
    return game;
  });
const lastGames = games.slice(Math.max(games.length - 5, 1));

const unoffialGames = data.allGamesJson.edges.map(team => team.node)
  .filter(game => game.status !== 'Official')
  .sort((a, b) => {
    return a.isoDate - b.isoDate;
  })
  .map(item => {
    const game = {...item};
    game.gameDate = `${game.date} ${game.time}`;
    return game;
  });;

const nextGames = unoffialGames.slice(0, 5);


  const imageMap = data.allFile.edges.reduce((acc, curr) => {
      const name = curr.node.name;
      acc[name] = curr.node.childImageSharp.fluid;
      return acc;
  }, {})
  console.log(imageMap);
  return (
    <Layout>


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
            { title: "Team", 
            field: "name",
            cellStyle: {
              backgroundColor: '#F7F7F7',
              color: '#556cd6',
              maxWidth: '160px'
            },
            headerStyle: {
              maxWidth: '160px'
            },
            render: (team) => {
              const name = team.name.indexOf('-') > 0 ? team.name.substring(0, team.name.lastIndexOf('-')).trim() : team.name;
              return (<Link class="team-link" to={team.fields.slug}><div class="team-thumb"><Img fluid={imageMap[name]} alt="No Image Found"></Img></div>{team.name}</Link>);
            }},
            { title: "Record", field: "record",cellStyle: {
              maxWidth: '50px'
            } },
            { title: "PTS", field: "points", type: "numeric"},
            { title: "%", field: "pct", type: "numeric",
            render: team => <span>{team.pct.toFixed(3)}</span> },
            { title: "Ranking", field: "elo", type: "numeric",
            render: team => <span>{team.elo.toFixed(3)}</span> },
            { title: "SoS", field: "strengthOfSchedule", type: "numeric",
            render: team => <span>{team.strengthOfSchedule.toFixed(3)}</span> },
          ]}
          data={teams}

          
          title="Team Rankings"
        />

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

          
          title="Last 5 Results"
        />
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
          visitorScore
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
