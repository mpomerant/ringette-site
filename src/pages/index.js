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
          maxWidth: '50px',
          textAlign: 'center'
        },
        cellStyle: {
         textAlign: 'center'
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
            { title: "PTS", field: "points", type: "numeric", hidden: matches},
            { title: "%", field: "pct", type: "numeric",
            render: team => <span>{team.pct.toFixed(3)}</span>,
            hidden: matches},
            { title: "Ranking", field: "elo", type: "numeric",
            render: team => <span>{team.elo.toFixed(3)}</span> },
            { title: "SoS", field: "strengthOfSchedule", type: "numeric",
            render: team => <span>{team.strengthOfSchedule.toFixed(3)}</span> },
          ]}
          data={teams}

          
          title="Team Rankings"
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