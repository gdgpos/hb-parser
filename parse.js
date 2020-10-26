const csv = require('csv-parser')
const fs = require('fs')


function formatSocials(socials){
    let res = [];
    for(let social of socials.split(',')){
        if(social.toLowerCase().includes('facebook')){
            res.push({
                "icon":"facebook",
                "link": social.trim(),
                "name":"Facebook"
            });
        } else if(social.toLowerCase().includes('github')){
            res.push({
                "icon":"github",
                "link": social.trim(),
                "name":"Github"
            });
        } else if(social.toLowerCase().includes('linkedin')){
            res.push({
                "icon":"linkedin",
                "link": social.trim(),
                "name":"LinkedIn"
            });
        } else if(social.toLowerCase().includes('twitter')){
            res.push({
                "icon":"twitter",
                "link": social.trim(),
                "name":"Twitter"
            });
        } else {
            res.push({
                "icon":"website",
                "link": social.trim(),
                "name":"Website"
            });
        }
    }
    return res;
}

function exportSpeakerJSON(records){
    let res = {};
    let count = 0;
    for(let rec of records){
        let {speakerId, bio, company, country, name, photoUrl, shortBio, socials, title } = rec;
        res[speakerId] = {
            bio,
            company,
            country,
            name,
            photoUrl,
            shortBio,
            socials: formatSocials(socials),
            title,
            pronouns:"",
            featured,
            companyLogoUrl:"",
            companyLogo:"",
            photo:"",
            order: count++
        };
    }
    fs.writeFileSync('speakers.json', JSON.stringify(res, null, 2));
}

function exportSessionJSON(records){
    let res = {};
    for(let rec of records){
        let {sessionId, complexity, description, speakers, tags, title, language } = rec;
        res[sessionId] = {
           complexity,
           description,
           speakers: speakers.split(','),
           tags: tags.split(','),
           title,
           language,
        };
    }
    fs.writeFileSync('sessions.json', JSON.stringify(res, null, 2));
}

function isNewTrack(tracks, track){
    return tracks.reduce( 
        (acc, cur) => acc || cur.title !== track,
        false
    );
}

function insertSession(timeslots, startTime, endTime, sessionId){
    const found = false;
    for(let slot of timeslots){
        if(slot.startTime == startTime && slot.endTime == endTime){
            slot.sessions.items.push(sessionId);
            found = true;
        }
    }
    if(!found)
        timeslots.push({
            startTime,
            endTime,
            sessions: { items: [sessionId.toString()] }
        })
}

function exportScheduleJSON(records){

    let schedule = {};
    for(let rec of records){
        
        let {sessionId, day, month, year, startTime, endTime, track } = rec;
        let key = `${year}-${month}-${day}`;
        
        if ( !(key in schedule) ){
            schedule[key] = {
                key:{
                    date: key,
                    dateReadable: '',
                    timeslots:[],
                    tracks:[]
                }
            };
        }

        let sessionDay = schedule[key];

        if(isNewTrack(sessionDay.tracks, track))
            sessionDay.tracks.push({title: track});
        
        insertSession(sessionDay, startTime, endTime, sessionId)
      
    }
    fs.writeFileSync('schedule.json', JSON.stringify(res, null, 2));
}

function parseData(file, callback){
    const results = [];

    fs.createReadStream(file)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            callback(results);
        });
}

parseData('./data/speakers.csv', exportSpeakerJSON);
parseData('./data/sessions.csv', exportSessionJSON);
parseData('./data/sessions.csv', exportScheduleJSON);