/**
 * Id number of the location.
 * 85 for Utrecht CS
 * 378 for Den Bosch CS
 * @type {number}
 */
const LocationId = 85;
const apiUrl = 'http://localhost:50210/api';
const apiNewUrl = 'http://localhost:51279/api/v1';
const apiToken = 398140257;

const excludePrefix = "[hidden]";

const sorting = (function (){
    try {
        return new URL(window.location.href).searchParams.get("sort");
    }
    catch (e) {
        return "";
    }
}());

const contentCardsHolder = document.getElementById("content-cards-holder");

const headers = {
    'Content-type': 'application/json',
    apiToken: 398140257
};

function printDate(date) {
    if (date == ''){
        return 'NVT'
    }
    else {
        return moment(date).format("H:mm");
    }
}

const filterOnTime = function(a, b) {
    if (a.StartTime === '') {
        return 1
    }
    if (b.StartTime === '') {
        return -1
    }
    if (moment().diff(moment(a.StartTime), 'minutes') > moment().diff(moment(b.StartTime), 'minutes')) {
        return -1;
    }
    if (moment().diff(moment(a.StartTime), 'minutes') < moment().diff(moment(b.StartTime), 'minutes')) {
        return 1;
    }
};

/**
 * Get data
 */

        // .then(response => response.json())
        // .then(function(data){
        //     virtualManager = data;
        //     dom_hostImage.style.backgroundImage = 'url(https://az691754.vo.msecnd.net/website/284/160x160_5a80f0bc-6d38-4ffa-b3b2-0032a7042045.jpg)';
        // });
// axios.all([getLocation(), getSpaces(), getVirtualManager(), getPublicEvents()])

/**
 * Get location data
 */
function getLocation() {
    return axios.get(apiNewUrl + '/location/' + LocationId, {
        headers: {
            'Content-type': 'application/json',
            apiToken: apiToken
        }
    });
}

/**
 * Get public events
 */
function getPublicEvents() {
    return axios.get(apiNewUrl + '/event/public/location/' + LocationId, {
        headers: {
            'Content-type': 'application/json',
            apiToken: apiToken
        },
        params: {
            date: '2019-12-12'
        }
    });
}

/**
 * Get spaces
 */
function getSpaces() {
    return axios.get(apiNewUrl + '/space/location/'+ LocationId, {
        headers: {
            'Content-type': 'application/json',
            apiToken: apiToken
        },
        params: {
            meetingtypeId: 1,
            page: 0,
            itemsPerPage: 0
        }
    });
}


/**
 * Get virtual manager
 */
// var virtualManager = null;
// const dom_hostImage = document.getElementById('hostImage');
// const greetingTexts = [
//     getGreetingText(),
//     'Leuk dat je er bent!',
//     'Welkom bij ##locationName##',
//     'Mijn is ##hostName##, Ik ben de host op deze locatie',
//     'Wat is jouw meetingspace vandaag?'
// ];

// function getVirtualManager() {
//     return axios.get(apiUrl + '/manager/active/' + LocationId, {
//         headers: {
//             'Content-type': 'application/json',
//             token: apiToken
//         }
//     });
// }

// function getGreetingText() {
//     var d = new Date()
//     if (d.getHours() < 12) {
//         return 'Goedemorgen';
//       } else if (d.getHours() >= 12 && d.getHours() < 18) {
//         return 'Goedenmiddag';
//       } else {
//         return 'Goedenavond';
//       }
//   }

function updateCards() {
    fetch(apiUrl + '/meetingspace/location/' + LocationId, {
        headers: headers,
        method: 'GET',
        cache: 'no-cache'
    })
        .then(response => response.json())
        .then(function(data){
            data.Results = data.Results.filter(room => !room.Name.startsWith(excludePrefix));
            return data;
        })
        .then(
            function(data){
                let rooms = [];
                for (let item of data.Results) {
                    rooms.push({
                        'Name': item.Name,
                        'Title': 'beschikbaar',
                        'CompanyName': ' ',
                        'StartTime': "",
                        'EndTime': "",
                    })
                }
                return rooms;
            }).then(function (rooms) {
        const url = apiUrl + '/event/public/location/' + LocationId;
        fetch(url, {
            headers: headers,
            method: 'GET',
            cache: 'no-cache',
        })
            .then(response => response.json())
            .then(
                function(data){
                    for(let meeting of data){

                        for(let meetingspace of meeting.Meetingspaces){
                            // search for meetingspace.
                            let index = rooms.findIndex(room => meetingspace === room.Name);
                            if(index >= 0) {
                                rooms[index].Title = meeting.Name;
                                rooms[index].CompanyName = meeting.CompanyName;
                                rooms[index].StartTime = meeting.StartTime;
                                rooms[index].EndTime = meeting.EndTime;
                            }
                            else {
                                console.log('did not find ' + meetingspace)
                            }
                        }
                    }

                    switch (sorting) {
                        case "time":
                            rooms.sort(filterOnTime);
                            break;
                        case "roomname":
                            rooms.sort((a, b) => (a.Name > b.Name) ? 1 : -1);
                            break;
                        case "eventname":
                            rooms.sort((a, b) => (a.Title > b.Title) ? 1 : -1);
                            break;
                        default:
                            rooms.sort(filterOnTime);
                            break;
                    }

                    contentCardsHolder.innerHTML = "";
                    for(let item of rooms) {
                        contentCardsHolder.innerHTML +=
                            "            <div class=\"col shadow-sm\" id=\"roomtile\">" +
                            "                <div id=\"roomtilecurrent\">" +
                            "                    <u class=\"roomtitle\">"+ item.Name +"</u>" +
                            "                    <br/>" +
                            "                    <span class=\"coursetitle\">"+ item.Title +"</span>" +
                            "                    <br/>" +
                            "                    <span class=\"companytitle\">" + item.CompanyName + "</span>" +
                            "                    <br/>" +
                            "                    <span class=\"bookedtime\">"+ printDate(item.StartTime) +"-"+ printDate(item.EndTime) +"</span>" +
                            "                </div>" +
                            "            </div>"
                    }
                })
            .catch(function(error) {
                console.log('There has been a problem with your fetch operation: ', error.message);
            });

    }).catch(function(error) {
        console.log('There has been a problem with your fetch operation: ', error.message);
    });

    setTimeout(updateCards, 100000);
}


// Run the app.
// updateCards();
