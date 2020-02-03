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
                const include = [ 'Guelph', 'Newmarket'];
                
                if (include.find( tour => name.indexOf(tour) > 0)){
                    acc[name] = curr.value;
                }
                return acc;
            }, {});
            return map;
        });

        console.table(optionMap);
        return optionMap;
    }
    const optionMap = await getOptionMap();
    await browser.close();
    const tournamentAction = async function(tournament, optionMap){
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();
        try {
        page.setDefaultTimeout(30000);
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
            const tournamentName = matches[2].replace('Ringette', '').trim();
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
            //console.table(divisionMap);
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
                return games.map((game) => {
                    const gameData = Array.from(game.querySelectorAll('td'));
                    const status = gameData[9].textContent.trim();
                    const isOfficial = status.toLowerCase().includes('official');
                    const type = gameData[1].textContent.trim();
                    const isRR = type === 'RR' || type === 'SRR';
                    const visitorLink = gameData[5].querySelector('a');
                    const homeLink = gameData[7].querySelector('a');
                    
                    return {
                        id: `${id}_${gameData[0].textContent.trim().split('-').join('_').toLowerCase()}`,
                        tournament: id,
                        type: type,
                        date: gameData[2].textContent.trim(),
                        time: gameData[3].textContent.trim(),
                        visitor: visitorLink ? correctName(tournament, visitorLink.textContent.trim()) : 'Not Available',
                        visitorScore: isOfficial ? gameData[6].textContent.trim() : "0",
                        home: homeLink ? correctName(tournament, homeLink.textContent.trim()) : 'Not Available',
                        homeScore: isOfficial ? gameData[8].textContent.trim() : "0",
                        status
                    }
                });
            }, id, tournament);
            if (resultMap.length){
                //console.table(resultMap);
                fs.mkdirSync('results/games', {recursive: true});
                resultMap.forEach(game => {
                    const timeReg = function(time){
                        const timeregex = /(\d{1,2}):(\d{1,2})(\w)/gm;
                        const result = timeregex.exec(time);
                        const newTime = result[3] === 'P' && result[1] !== '12' ? `${parseInt(result[1]) + 12}:${result[2]}`: `${result[1] < 10 ? '0' : ''}${result[1]}:${result[2]}`;
                        return newTime + ':00.000+05:00';
                    }

                    const dateReg = function(date){
                        const dateRegex = /(\w+) (\w+) (\d+)/gm;
                        const result = dateRegex.exec(date);
                        let year = 2020
                        switch (result[2]) {
                            case 'Sept':
                            case 'Oct':
                            case 'Nov':
                            case 'Dec': 
                                year = 2019;   
                                break;
                            default:
                                break;
                        }

                        let month = '01';
                        switch (result[2]) {
                            case 'Jan':
                                month = '01';
                                break;
                            case 'Feb':
                                month = '02';
                                break;
                            case 'Mar':
                                month = '03';
                                break;
                            case 'Apr':
                                month = '04';
                                break;
                            case 'May':
                                month = '05';
                                break;
                            case 'Jun':
                                month = '06';
                                break;
                            case 'Jul':
                                month = '07';
                                break;
                            case 'Aug':
                                month = '08';
                                break;
                            case 'Sept':
                                month = '09';
                                break;
                            case 'Oct':
                                month = '10';
                                break;
                            case 'Nov':
                                month = '11';
                                break;
                            case 'Dec':
                                month = '12';
                                break;
                            default:
                                break;
                        }
                        const newDate = `${year}-${month}-${result[3] < 10 ? '0' : ''}${result[3]}`;
                        return newDate;
                    }
                    const iso = new Date(dateReg(game.date) + 'T' + timeReg(game.time));
                    
                        
                    
                    game.isoDate = iso.getTime();
                    game.tournamentName = tournamentName;
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
           console.log(tournament, e);
        } finally {
            console.log("COMPLETED " + tournament);
           await browser.close();
        }
    }
    

    

    
   

    for (const tournament of Object.keys(optionMap)){
        await tournamentAction(tournament, optionMap);
    }

    

})();
