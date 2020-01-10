import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import MuiLink from '@material-ui/core/Link';
import {  graphql } from "gatsby"
import Layout from "../components/layout"
import Link from '../components/link';
import MaterialTable from "material-table";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';



export default function Index({data}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const teams = data.allTeamsJson.edges.map(team => team.node);


  return (
    <Layout>

      
      <MaterialTable
      options={{
        search: false,
        paging: false,
        pageSize: 100,
        headerStyle: {
          backgroundColor: '#000',
          color: '#FFF',
          maxWidth: '50px'
        }
        
      }}
          columns={[
            { title: "Team", 
            field: "name",
            cellStyle: {
              backgroundColor: '#F7F7F7',
              color: '#556cd6',
              maxWidth: '100px'
            },
            headerStyle: {
              maxWidth: '100px'
            },
            render: team => <Link to={team.fields.slug}>{team.name}</Link> },
            { title: "Record", field: "record",cellStyle: {
              maxWidth: '50px'
            } },
            { title: "PTS", field: "points", type: "numeric", hidden: matches},
            { title: "%", field: "pct", type: "numeric",
            render: team => <span>{team.pct.toFixed(3)}</span>,
            hidden: matches},
            { title: "Power Ranking", field: "elo", type: "numeric",
            render: team => <span>{team.elo.toFixed(3)}</span> },
            { title: "Strength of Schedule", field: "strengthOfSchedule", type: "numeric",
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