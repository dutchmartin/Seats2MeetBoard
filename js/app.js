var board = new Vue({
    el: '#board',
    data() {
        return {
            initialLoadReady: false, 
            locationId: 85,
            apiUrl: 'http://localhost:50210/api',
            apiNewUrl: 'http://localhost:51279/api/v1',
            apiToken: 398140257,
            greetingTextIndex: 0,
            greetingTexts: [
                this.getGreetingText(),
                'Leuk dat je er bent!',
                'Welkom',
                'Wat is jouw meetingspace vandaag?'
            ],
            location: null,
            spaces: [],
            meetings: [],
            virtualmanager: null
        }
    },

    created() {
        this.init();
    },

    methods: {
        init(){
            let self = this;
            axios.all([this.getLocation(), this.getSpaces(), this.getVirtualManager(), this.getPublicEvents()])
            .then(axios.spread(function (locationResponse, spacesResponse, virtualManagerResponse, publicEventsResponse) {
              /**
               * Requests are now complete 
               * */ 

              // Process location data
              if(locationResponse.status === 200) {
                self.location = locationResponse.data;
                self.greetingTexts[2] += '  bij ' + self.location.Name;
              }

              // Process spaces
              if(spacesResponse.status === 200) {
                self.spaces = spacesResponse.data.Results;
              }

              // Process virtual  manager
              if(virtualManagerResponse.status === 200) {
                self.greetingTexts.splice(3, 0, 'Mijn naam is '+ virtualManagerResponse.data.Name +', Ik ben de host op deze locatie');
                self.virtualmanager = virtualManagerResponse.data;
              }

              // Process events
              if(publicEventsResponse.status === 200) {
                self.meetings = publicEventsResponse.data.filter(e => e.Id.startsWith('R'));
              }
            }))
            .finally(function(){
                self.initialLoadReady = true;
            });
        },

        /**
         * Get greeting text
         */
        getGreetingText() {
            let d = new Date()
            if (d.getHours() < 12) {
            return 'Goedemorgen';
            } else if (d.getHours() >= 12 && d.getHours() < 18) {
            return 'Goedenmiddag';
            } else {
            return 'Goedenavond';
            }
        },

        /**
         * Get location data
         */
        getLocation() {
            return axios.get(this.apiNewUrl + '/location/' + this.locationId, {
                headers: {
                    'Content-type': 'application/json',
                    apiToken: this.apiToken
                }
            });
        },

        /**
         * Get public events
         */
        getPublicEvents() {
            return axios.get(this.apiNewUrl + '/event/public/location/' + this.locationId, {
                headers: {
                    'Content-type': 'application/json',
                    apiToken: this.apiToken
                },
                params: {
                    date: '2019-12-12'
                }
            });
        },

        /**
         * Get spaces
         */
        getSpaces() {
            return axios.get(this.apiNewUrl + '/space/location/'+ this.locationId, {
                headers: {
                    'Content-type': 'application/json',
                    apiToken: this.apiToken
                },
                params: {
                    meetingtypeId: 1,
                    page: 0,
                    itemsPerPage: 0
                }
            });
        },
        
        /**
         * Get virtual manager
         */
        getVirtualManager() {
            return axios.get(this.apiUrl + '/manager/active/' + this.locationId, {
                headers: {
                    'Content-type': 'application/json',
                    token: this.apiToken
                }
            });
        }
    }
  })