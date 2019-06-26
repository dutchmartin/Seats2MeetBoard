/**
 * id number of the location.
 * 85 for Utrecht Centraal CS
 * 378 for Utrecht Centraal CS
 * @type {number}
 */

const LocationId = 85;

const contentCardsHolder = document.getElementById("content-cards-holder");

function updateCards() {

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append("token", "398140257");

    const url = 'http://staging.seats2meet.com/api/event/public/location/' + LocationId;
    fetch(url, {
        headers: headers,
        method: 'POST',
        cache: 'no-cache',
    })
        .then(response => response.json())
        .then(
        function(data){

        contentCardsHolder.innerHTML = "";
        for(let item of data) {
            contentCardsHolder.innerHTML +=
                "            <div class=\"col\" id=\"roomtile\">" +
                "                <div id=\"roomtilecurrent\">" +
                "                    <u class=\"roomtitle\">"+ item.Meetingspaces[0] +"</u>" +
                "                    <br/>" +
                "                    <span class=\"coursetitle\">"+ item.Name +"</span>" +
                "                    <br/>" +
                "                    <span class=\"companytitle\">" + item.CompanyName + "</span>" +
                "                    <br/>" +
                "                    <span class=\"bookedtime\">"+ moment(item.StartTime).format("H:mm") +"-"+ moment(item.EndTime).format("H:mm") +"</span>" +
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
    console.log("tick..");
    setTimeout(updateCards, 100000);
}


// Run the app.
updateCards();
