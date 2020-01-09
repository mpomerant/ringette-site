const fs = require('fs');
const EloUtils = require('elo-utils');
const gamesFiles = fs.readdirSync('results/games');

const games = gamesFiles.map((file) => {
    return JSON.parse(fs.readFileSync(`results/games/${file}`));
});


const teams = games.reduce((acc, curr) => {
    function normalizeName(name) {
        return name.replace('  ', ' ');
    }
    const homeScore = parseInt(curr.homeScore);
    const visitorScore = parseInt(curr.visitorScore);
    const home = normalizeName(curr.home);
    const visitor = normalizeName(curr.visitor);
    class Team {
        constructor(name) {
            this.name = name;
            this.win = 0;
            this.loss = 0;
            this.tie = 0;
            this.for = 0;
            this.against = 0;
            this.elo = 1500;
        
            Object.defineProperties(this, {
                _results: {
                    value: [],
                    enumerable: false
                },
                results: {
                    get: function() { return this._results.sort((a, b) => {
                        const _a = new Date(a.date);
                        const _b = new Date(b.date);
                        if (_a.getMonth() > 9) {
                            _a.setFullYear(2019);
                        } else {
                            _a.setFullYear(2020);
                        }
                        if (_b.getMonth() > 9) {
                            _b.setFullYear(2019);
                        }else {
                            _b.setFullYear(2020);
                        }
                        return _a - _b;
                    });},
                    enumerable: true
                },
                pct: {
                    get: function () { return this.points / ((this.win + this.loss + this.tie)*2); },
                    enumerable: true
                },
                points: {
                    get: function () { return (this.win * 2) + this.tie; },
                    enumerable: true
                },
                games: {
                    get: function () { return this.win + this.loss + this.tie },
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
    acc[home].results.push(curr);

    acc[visitor].results.push(curr);

    acc[home].for += homeScore;
    acc[visitor].against += homeScore;

    acc[home].against += visitorScore;
    acc[visitor].for += visitorScore;
    let winner = EloUtils.RESULT.R1;
    if (homeScore > visitorScore){
        acc[home].win += 1;
        acc[visitor].loss += 1;
    } else if (homeScore < visitorScore){
        acc[home].loss += 1;
        acc[visitor].win += 1;
        winner = EloUtils.RESULT.R2;
    } else {
        acc[home].tie += 1;
        acc[visitor].tie += 1;
        winner = EloUtils.RESULT.TIE;
    }

    const elo = EloUtils.elo(acc[home].elo, acc[visitor].elo, winner);
    acc[home].elo = elo.R1;
    acc[visitor].elo = elo.R2;
    return acc;
}, {});

//console.log(teams);

fs.mkdirSync('results/teams', {recursive: true});

Object.keys(teams).forEach(team => {
    const teamId = team.split(' ').join('_').split('-').join('_').toLowerCase();
    fs.writeFileSync(`results/teams/${teamId}.json`, JSON.stringify(teams[team], null, 4));
})