/**
 * Register the meeting card component
 */
Vue.component('meeting-card', {
    template: '#meetingCard',
    props: {
      companyName: String,
      meetingTitle: String,
      spaceName: String,
      StartMinutes: Number,
      EndMinutes: Number
    },
    data() {
      return {
      }
    },
    
    methods: {
    }
  })


/**
 * App startup code
 */
var board = new Vue({
    el: '#board',
    mode: 'development',

    data() {
        return {
            apiUrl: 'https://www.seats2meet.com/api',
            apiNewUrl: 'https://api.seats2meet.com/api/v1',
            apiToken: 398140257,
            currentTime: new Date(),
            greetingTextInterval: null,
            greetingTextIntervalTimer: 6000,
            greetingTextIndex: 0,
            greetingTexts: [
                this.getGreetingText(),
                'Leuk dat je er bent!',
                'Welkom',
                'Wat is jouw meetingspace vandaag?'
            ],
            initialLoadReady: false,
            languageId: 65,
            locationId: 85,
            location: null,
            meetings: [],
            spaces: [],
            virtualManager: null,
            timeInterval: null
        }
    },

    created() {
        this.init();
    },

    beforeDestroy() {
        clearInterval(this.greetingTextInterval);
        clearInterval(this.timeInterval);
    },

    methods: {
        init(){
            let self = this;

            // Set current time
            this.timeInterval = setInterval(() => {
                self.currentTime = new Date();
            }, 1000 * 60);
            
            // Set locale
            let locale = 'en'
            var url = new URL(window.location.href);
            if(url.searchParams.has('locale')) {
                locale = url.searchParams.get('locale');
            }
            this.setLanguageId(locale);

            /**
             * Load data
             */
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
                self.spaces = spacesResponse.data.Results.filter(room => !room.Name.startsWith('[hidden]'));
              }

              // Process virtual  manager
              if(virtualManagerResponse.status === 200) {
                self.greetingTexts.splice(3, 0, 'Mijn naam is '+ virtualManagerResponse.data.Name +', Ik ben de host op deze locatie');
                self.virtualManager = virtualManagerResponse.data;
              }

              // Process events
              if(publicEventsResponse.status === 200) {
                  self.processMeetings(publicEventsResponse.data.filter(e => e.Id.startsWith('R')));
              }
            }))
            .finally(function(){
                self.initialLoadReady = true;
                self.greetingTextInterval = setInterval(function() {
                    if (self.greetingTextIndex >= self.greetingTexts.length - 1) {
                        self.greetingTextIndex = 0
                      } else {
                        self.greetingTextIndex = self.greetingTextIndex + 1
                      }
                }, 6000);
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
            return 'Goedemiddag';
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
        },

        /**
         * Process meetings
         * Add meetings in current meetingspace
         * @param {array} meetings 
         */
        processMeetings(meetingsData) {
            let self = this
            let _meetings = [];

            /**
             * Build meetings array
             */
            this.spaces.forEach(function(space){
                let description = space.Descriptions.find(d => d.LanguageId === self.languageId);
                _meetings.push({
                    InternalName: space.Name,
                    Name: description.Name,
                    Meetings: []
                });
            });

            /**
             * Add meetings to current space
             */
            for(let i = 0, l = meetingsData.length; i < l; i++) {
                for(let x = 0, lx = meetingsData[i].Meetingspaces.length; x < lx; x++) {
                    let meeting = meetingsData[i];
                    let spaceIndex = _meetings.findIndex(s => s.InternalName === meeting.Meetingspaces[x]);
                    _meetings[spaceIndex].Meetings.push(meeting)
                }
            }

            /**
             * Order
             */
            for(let i in _meetings) {
                _meetings[i].Meetings = this.$options.filters.sortedItems(_meetings[i].Meetings, 'StartMinutes')
            }
            this.meetings = _meetings;
        },

        /**
         * Set language ID
         * @param {string} val 
         */
        setLanguageId(val) {
            this.languageId = (val === 'nl') ? 52 : 65;
        }
    }
  });