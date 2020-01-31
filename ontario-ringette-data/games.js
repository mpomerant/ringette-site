const fs = require('fs');
const EloUtils = require('elo-utils');
const gamesFiles = fs.readdirSync('results/games');

const games = gamesFiles.map((file) => {
    return JSON.parse(fs.readFileSync(`results/games/${file}`));
}).sort((a, b) => {
    return a.isoDate - b.isoDate;
});


const teams = games.reduce((acc, curr) => {
    function normalizeName(name) {
        const normalized = name.replace(/\s\s+/g, ' ').replace('St Marys', 'St. Marys').trim();
        return normalized;
    }
    const homeScore = parseInt(curr.homeScore);
    const visitorScore = parseInt(curr.visitorScore);
    const home = normalizeName(curr.home);
    const visitor = normalizeName(curr.visitor);
    const status = curr.status;
    const isOfficial = status.toLowerCase().includes('official');

    const homeGame = {...curr, home, visitor};
    const visitorGame = {...curr, visitor, home};
    
    class Team {
        constructor(name) {
            this.name = name;
            this.win = 0;
            this.loss = 0;
            this.tie = 0;
            this.for = 0;
            this.officialWin = 0;
            this.officialLoss = 0;
            this.against = 0;
            this.elo = 1500;
            this.upcoming = [];
            Object.defineProperties(this, {
                _results: {
                    value: [],
                    enumerable: false
                },
                results: {
                    get: function() { return this._results.sort((a, b) => {

                        return a.isoDate - b.isoDate;
                    });},
                    enumerable: true
                },
                pct: {
                    get: function () { return this.points / ((this.officialWin + this.officialLoss + this.tie)*2); },
                    enumerable: true
                },
                points: {
                    get: function () { return (this.officialWin * 2) + this.tie; },
                    enumerable: true
                },
                games: {
                    get: function () { return this.win + this.loss + this.tie },
                    enumerable: true
                },
                opponentRecord: {
                    get: function() {
                        const total = this.results.reduce((acc, curr) => {
                            const opponent = normalizeName(curr.home === this.name ? curr.visitor : curr.home);
                            if (teams[opponent]){
                                acc.w +=  teams[opponent].win;
                                acc.l +=  teams[opponent].loss;
                                acc.t +=  teams[opponent].tie;
                                acc.g +=  teams[opponent].games;
                            } else {
                                console.log(opponent);
                            }
                            return acc;
                        }, { w: 0, l: 0, t:0, g:0});
                        return total;
                    },
                    enumerable: true
                },
                strengthOfSchedule: {
                    get: function () {
                        const total = this.results.reduce((acc, curr) => {
                            const opponent = normalizeName(curr.home === this.name ? curr.visitor : curr.home);
                            if (teams[opponent]){
                                acc.w +=  teams[opponent].opponentRecord.w;
                                acc.l +=  teams[opponent].opponentRecord.l;
                                acc.t +=  teams[opponent].opponentRecord.t;
                                acc.g += teams[opponent].opponentRecord.g;
                            } else {
                                console.log(opponent);
                            }
                            return acc;
                        }, { w: 0, l: 0, t:0, g:0});
                        const opopPct = ((total.w * 2) + (total.t)) / (total.g * 2);
                        const opRecord = this.opponentRecord;
                        const opPct = ((opRecord.w * 2) + (opRecord.t)) / (opRecord.g * 2);
                        return ((2 * opPct) + opopPct) / 3 ;
                     },
                    enumerable: true
                },
                record:  {
                    get: function() {
                        return `${this.win} - ${this.loss} - ${this.tie}`
                    },
                    enumerable: true
                },
                image: {
                    get: function () { 
                        const dash = this.name.lastIndexOf('-');
                        const name = this.name.substring(0, dash > 0 ? dash : undefined);
                        return  `${name.trim()}.png`;
                     },
                    enumerable: true
                }
            });

        }

    }
    acc[home] = acc[home] || new Team(home);

    acc[visitor] = acc[visitor] || new Team(visitor);

    const probability = EloUtils.probabilty(acc[home].elo, acc[visitor].elo);
        homeGame.elo = {
            pregame: {
                opp: acc[visitor].elo,
                elo: acc[home].elo,
                probability: probability.r1
            }
        };
        visitorGame.elo = {
            pregame: {
                opp: acc[home].elo,
                elo: acc[visitor].elo,
                probability: probability.r2
            }
        };

    if (isOfficial){
        acc[home].for += homeScore;
        acc[visitor].against += homeScore;
    
        acc[home].against += visitorScore;
        acc[visitor].for += visitorScore;
        let winner = EloUtils.RESULT.R1;
        if (homeScore > visitorScore){
            acc[home].win += 1;
            acc[visitor].loss += 1;
            if (curr.type === 'RR') {
                acc[home].officialWin += 1;
                acc[visitor].officialLoss += 1;
            }
        } else if (homeScore < visitorScore){
            acc[home].loss += 1;
            acc[visitor].win += 1;
            if (curr.type === 'RR') {
                acc[home].officialLoss += 1;
                acc[visitor].officialWin += 1;
            }
            winner = EloUtils.RESULT.R2;
        } else {
            acc[home].tie += 1;
            acc[visitor].tie += 1;
            winner = EloUtils.RESULT.TIE;
        }

    const elo = EloUtils.elo(acc[home].elo, acc[visitor].elo, winner);
    acc[home].elo = elo.R1;
    acc[visitor].elo = elo.R2;

    homeGame.elo.postgame = {
        opp: elo.R2,
        elo: elo.R1
    }
    homeGame.record = acc[home].record;
    visitorGame.elo.postgame = {
        opp: elo.R1,
        elo: elo.R2
    };

    visitorGame.record = acc[visitor].record;


    acc[home].results.push(homeGame);
    acc[visitor].results.push(visitorGame);
    } else {
        acc[home].upcoming.push(homeGame);
        acc[visitor].upcoming.push(visitorGame);
    }
    return acc;
}, {});

//console.log(teams);

fs.mkdirSync('results/teams', {recursive: true});
delete teams["Not Available"];
delete teams["Nova Scotia"];

Object.keys(teams).forEach(team => {
    const teamId = team.split(' ').join('_').split('-').join('_').toLowerCase();
    fs.writeFileSync(`results/teams/${teamId}.json`, JSON.stringify(teams[team], null, 4));
})