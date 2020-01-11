const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    
    const browser = await puppeteer.launch({
        headless: true
    });

    const getOptionMap = async function(){
        const page = await browser.newPage();
        page.setViewport({
            width: 1024,
            height: 768
        });
        await page.goto('http://score2stats.com/s2s_new/User/DashBoard.aspx?eu=301&du=3114&pool=All+Pools&dn=')
        const optionMap = await page.evaluate(() => {
            const options = Array.from(document.querySelectorAll('select[name="ctl00$DropDownListEvents"]>option'));
            const map = options.reduce((acc, curr) => {
                const name = curr.textContent.trim();
                if (name.indexOf('2020') > -1){
                    acc[name] = curr.value;
                }
                return acc;
            }, {});
            return map;
        });

        console.table(optionMap);
        return optionMap;
    }
    const tournamentAction = async function(tournament, optionMap){

        try {
        const page = await browser.newPage();
        page.setViewport({
            width: 1024,
            height: 768
        });
        await page.goto('http://score2stats.com/s2s_new/User/DashBoard.aspx?eu=301&du=3114&pool=All+Pools&dn=');
        const regex = /(\d+)\s+([\w|\s]+)( Ringette)? Tournament/mg;
        const matches = regex.exec(tournament);
        if (matches) {
            console.log('---------------------------------------------------------');
            console.log(`${tournament}`);
            const id = matches[2].split(' ').join('_').split('-').join('_').toLowerCase();
            await page.select('select[name="ctl00$DropDownListEvents"]', optionMap[tournament]);
            await page.waitForNavigation();
            await Promise.all([
                page.waitForNavigation(),
                page.click('#LinkButtonSchedules')
            ]);
            const divisionMap = await page.evaluate(() => {
                const options = Array.from(document.querySelectorAll('select[name="ctl00$DropDownListDivisions"]>option'))
                const map = options.reduce((acc, curr) => {
                    acc[curr.textContent.trim()] = curr.value;
                    return acc;
                }, {});
                return map;
            });
            console.table(divisionMap);
            if (divisionMap['U14 A']){
            await page.select('select[name="ctl00$DropDownListDivisions"]', divisionMap['U14 A']);
            await page.waitForNavigation();
            await page.screenshot({
                path: `screenshots/${id}_schedule_page.png`
            });

            const resultMap = await page.evaluate((id, tournament) => {
                const corrections = {
                    "2020 Waterloo Ringette Tournament": {
                        "West Ottawa": "West Ottawa - F"
                    }
                };
            
                const correctName = function(tournament, name){
                    if (corrections[tournament] && corrections[tournament][name]){
                        return corrections[tournament][name];
                    }
            
                    return name;
                }
                const games = Array.from(document.querySelectorAll('#MainContent_GridViewSchedule>tbody>tr')).filter((game) => {
                    return game.className !== 'mytableMobileScheduleHdr';
                });
                return games.filter(game => {
                    const gameData = Array.from(game.querySelectorAll('td'));
                    const status = gameData[9].textContent.trim();
                    return status === 'Official';
                }).map((game) => {
                    const gameData = Array.from(game.querySelectorAll('td'));
                    return {
                        id: `${id}_${gameData[0].textContent.trim().split('-').join('_').toLowerCase()}`,
                        tournament: id,
                        type: gameData[1].textContent.trim(),
                        date: gameData[2].textContent.trim(),
                        visitor: correctName(tournament, gameData[5].querySelector('a').textContent.trim()),
                        visitorScore: gameData[6].textContent.trim(),
                        home: correctName(tournament, gameData[7].querySelector('a').textContent.trim()),
                        homeScore: gameData[8].textContent.trim(),
                        status: gameData[9].textContent.trim(),
                    }
                });
            }, id, tournament);
            if (resultMap.length){
                console.table(resultMap);
                fs.mkdirSync('results/games', {recursive: true});
                resultMap.forEach(game => {
                    fs.writeFileSync(`results/games/${game.id}.json`, JSON.stringify(game, null, 4));
                })
            } else {
                console.log('NO GAMES');
            }
            } else {
                console.log(`No U14A Division in ${tournament}`)
            }
        } else {
            console.log(`${tournament} is not a provincial tournament`);
        }
        } catch (e) {
          console.log(e);
        }
    }
    

    

    const optionMap = await getOptionMap();
    const promises = Object.keys(optionMap).map((tournament) => {
        return tournamentAction(tournament, optionMap);
    });

try {
    await Promise.all(promises);
} catch (e) {
    console.log('CLOSING BROWSER');
    await browser.close();
}
await browser.close();
})();
