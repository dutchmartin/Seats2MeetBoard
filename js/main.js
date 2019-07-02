/**
 * id number of the location.
 * 85 for Utrecht Centraal CS
 * 378 for Utrecht Centraal CS
 * @type {number}
 */

const LocationId = 85;

const contentCardsHolder = document.getElementById("content-cards-holder");

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append("token", "398140257");

function printDate(date) {
    if (date == ''){
        return 'NVT'
    }
    else{
        return moment(date).format("H:mm");
    }
}

function updateCards() {
    fetch('http://staging.seats2meet.com/api/meetingspace/location/' + LocationId, {
        headers: headers,
        method: 'GET',
        cache: 'no-cache',
    })
        .then(response => response.json())
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
        const url = 'http://staging.seats2meet.com/api/event/public/location/' + LocationId;
        fetch(url, {
            headers: headers,
            method: 'GET',
            cache: 'no-cache',
        })
            .then(response => response.json())
            .then(
                function(data){
                    for(let meeting of data){
                        console.log(meeting);
                        for(let meetingspace of meeting.Meetingspaces){
                            // search for meetingspace.
                            console.log(meetingspace);
                            let index = rooms.findIndex(room => meetingspace === room.Name);
                            if(index >= 0) {
                                rooms[index].Title = meeting.Name;
                                rooms[index].CompanyName = meeting.CompanyName;
                                rooms[index].StartTime = meeting.StartTime;
                                rooms[index].EndTime = meeting.EndTime;
                            }
                            else {
                                console.log('did not find' + meetingspace)
                            }
                        }
                    }

                    rooms.sort((a, b) => (a.Name > b.Name) ? 1 : -1);
                    contentCardsHolder.innerHTML = "";
                    for(let item of rooms) {
                        console.log(item);
                        contentCardsHolder.innerHTML +=
                            "            <div class=\"col\" id=\"roomtile\">" +
                            "                <div id=\"roomtilecurrent\">" +
                            "                    <u class=\"roomtitle\">"+ item.Name +"</u>" +
                            "                    <br/>" +
                            "                    <span class=\"coursetitle\">"+ item.Title +"</span>" +
                            "                    <br/>" +
                            "                    <span class=\"companytitle\">" + item.CompanyName + "</span>" +
                            "                    <br/>" +
                            "                    <span class=\"bookedtime\">"+ printDate(item.StartTime) +"-"+ printDate(item.EndTime) +"</span>" +
                            "                </div>" +
                            // "                <div id=\"roomtilenext\">\n" +
                            // "                    <span class=\"next-company\">00:00 - volgend bedrijf</span>" +
                            // "                </div>" +
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
updateCards();
