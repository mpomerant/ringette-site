import React from 'react';
import MaterialTable from "material-table";
import PropTypes from "prop-types"
import Link from './link';

const GameResultTable = ({results}) => {

    return (
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
    )
}
GameResultTable.propTypes = {
    results: PropTypes.arrayOf(PropTypes.object),
  }
export default GameResultTable;