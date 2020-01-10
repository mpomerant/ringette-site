/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const { createFilePath } = require(`gatsby-source-filesystem`)
const path = require(`path`)
exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    if (node.internal.type === `GamesJson`) {
        const slug = createFilePath({ node, getNode, basePath: `pages` })
        createNodeField({
        node,
        name: `slug`,
        value: slug,
        })
      } else if (node.internal.type === `TeamsJson`) {
        const slug = createFilePath({ node, getNode, basePath: `pages` })
        createNodeField({
        node,
        name: `slug`,
        value: slug,
        });

    
        const name = node.name.indexOf('-') > 0 ? node.name.substring(0, node.name.lastIndexOf('-')).trim() : node.name;
        createNodeField({
        node,
        name: `name`,
        value: name,
        });
      } 

      
    
}

exports.createPages = async ({ graphql, actions }) => {
    // **Note:** The graphql function call returns a Promise
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise for more info
    const { createPage } = actions
    const result = await graphql(`
      query {
        allGamesJson {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
        allTeamsJson {
            edges {
              node {
                fields {
                  slug
                  name
                }
              }
            }
          }
      }
    `)
    result.data.allGamesJson.edges.forEach(({ node }) => {
        createPage({
          path: node.fields.slug,
          component: path.resolve(`./src/templates/game.js`),
          context: {
            // Data passed to context is available
            // in page queries as GraphQL variables.
            slug: node.fields.slug,
          },
        })
      })
    
      result.data.allTeamsJson.edges.forEach(({ node }) => {
        createPage({
          path: node.fields.slug,
          component: path.resolve(`./src/templates/team.js`),
          context: {
            // Data passed to context is available
            // in page queries as GraphQL variables.
            slug: node.fields.slug,
            name: node.fields.name
          },
        })
      })

      
  }