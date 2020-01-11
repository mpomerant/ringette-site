import React from 'react';
import MaterialTable from "material-table";
import PropTypes from "prop-types"
import Link from './link';

const UpcomingGamesTable = ({nextGames}) => {

    return (
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
    )
}
UpcomingGamesTable.propTypes = {
    nextGames: PropTypes.arrayOf(PropTypes.object),
  }
export default UpcomingGamesTable;