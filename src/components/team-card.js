import React from "react"
import { Card, CardHeader, CardContent, Typography } from "@material-ui/core"
import Img from "gatsby-image"
import { makeStyles } from "@material-ui/core/styles"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useTheme } from "@material-ui/core/styles"

const useStyles = makeStyles({
  card: {
    maxWidth: 120,
    minWidth: 120,

    marginRight: "10px",
    marginBottom: "20ps",
  },
})

const useStylesTeamCard = makeStyles({
  card: {
    padding: "20px",
    marginBottom: "20px",
  },
})

const TeamCard = ({ team, image }) => {
    const classes = useStyles();
    const teamCardClasses = useStylesTeamCard();
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.up("md"))
    const imageClass = matches ? "team-image-lg" : "team-image"
    return (
        <Card className={teamCardClasses.card}>
            <div class="team-card">
                <div class={imageClass}>
                    <Img fluid={image.fluid} alt="No Image Found"></Img>
                </div>
                <div class="team-details">
                    <div class="team-name">{team.name}</div>
                    <div class="team-record">
                        Record: {team.win} - {team.loss} - {team.tie}
                    </div>
                    <div class="team-record">
                        Opponents: {team.opponentRecord.w} - {team.opponentRecord.l} -{" "}
                        {team.opponentRecord.t}
                    </div>
                </div>
                <div class="team-stats">
                    <Card className={classes.card}>
                        <CardHeader
                            titleTypographyProps={{ align: "center" }}
                            title="For"></CardHeader>
                        <CardContent>
                            <Typography
                                align="center"
                                gutterBottom
                                variant="h6"
                                component="h2">
                                {team.for}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card className={classes.card}>
                        <CardHeader
                        titleTypographyProps={{ align: "center" }}
                        title="Against">
                        </CardHeader>
                        <CardContent>
                            <Typography
                                align="center"
                                gutterBottom
                                variant="h6"
                                component="h2">
                                {team.against}
                            </Typography>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Card>
    )
}

export default TeamCard
