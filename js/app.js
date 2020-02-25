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
            currentHour: new Date().getHours(),
            getPublicEventsToken: null,
            greetingTextInterval: null,
            greetingTextIntervalTimer: 6000,
            greetingTextIndex: 0,
            greetingTexts: {
                en: [
                    ['Good morning','Good afternoon','Good evening'],
                    'Nice to have you here!',
                    'Welcome to ##locationName##',
                    'My name is ##host##, I am the host at this location',
                    'What is your meeting space today?'
                ],
                nl: [
                    ['Goedemorgen','Goedemiddag','Goedenavond'],
                    'Leuk dat je er bent!',
                    'Welkom bij ##locationName##',
                    'Mijn naam is ##host##, Ik ben de host op deze locatie',
                    'Wat is jouw meetingspace vandaag?'
                ]
            },
            hostTexts: [],
            initialLoadReady: false,
            languageId: 65,
            locale: 'nl',
            locationId: 0,
            location: null,
            meetings: [],
            showDate: true,
            spaces: [],
            specificMeetingDay: '',
            virtualManager: null,
            timeInterval: null,
            page: 1,
            pageAnimationSpeed: 10, // 10 seconds
            noPages: 0,
            itemsPerPage: 0,
            pageInterval: null,
            webUrl: window.location.href
        }
    },

    created() {
        this.init();
    },

    beforeDestroy() {
        clearInterval(this.greetingTextInterval);
        clearInterval(this.pageInterval);
        clearInterval(this.timeInterval);
    },

    methods: {
        checkForUpdates() {
            let version = getCookie('version')

            axios.get('/version', {
                headers: {
                    'Content-type': 'application/json'
                }})
                .then(response => {
                    debugger
                    if(Number(response.data) !== Number(getCookie('version'))){
                        setCookie('version', response.data,365,true)
                    }
                })
        },

        /**
         * Calculate content container height
         * and determine how many items must show on page
         */
        calculateContentHeight() {
            let self = this;

            let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            let contentHeight = h - this.$refs.topbar.clientHeight;
            
            this.itemsPerPage = 16;
            if(contentHeight < 980) {
                this.itemsPerPage = 12;
            }
             
            /**
             * Start page animation
             * This will be triggerd when transition is ready
             */
            this.animatePages();
        },
        
        /**
         * Startup project
         */
        init(){
            let self = this;
            let url = new URL(window.location.href);

            /**
             * Set current time
             */
            this.timeInterval = setInterval(() => {
                self.currentTime = new Date();

                if(self.currentTime.getHours() !== self.currentHour) {
                    self.updateMeetings()
                    self.currentHour = self.currentTime.getHours();
                }
            }, 1000 * 60);
            
            /**
             * Set locale
             */
            if(url.searchParams.has('locale')) {
                this.locale = url.searchParams.get('locale');
            }
            this.setLanguageId(this.locale);

            /**
             * Get location ID
             */
            if(url.searchParams.has('l')) {
                this.locationId = url.searchParams.get('l');
            }
            else {
                this.initialLoadReady = true;
                return;
            }

            /**
             * Specific day
             * Only used for development
             * yyyy-mm-dd
             */
            if(url.searchParams.has('d')) {
                this.specificMeetingDay = url.searchParams.get('d')
            }

            // Check for update
            // this.checkForUpdates()

            /**
             * Load data
             */
            axios.all([this.getLocation(), this.getVirtualManager(), this.getSpaces()])
            .then(axios.spread(function (locationResponse, virtualManagerResponse, spacesResponse) {
              /**
               * Requests are now complete 
               * */ 

              // Process location data
              if(locationResponse.status === 200) {
                self.location = locationResponse.data;
              }

              // Process virtual  manager
              if(virtualManagerResponse.status === 200) {
                self.virtualManager = virtualManagerResponse.data;
              }

              // Process spaces
              if(spacesResponse.status === 200) {
                self.spaces = spacesResponse.data.Results.filter(space => !space.Name.startsWith('[hidden]'));
              }

                self.updateMeetings()
            }))
            .finally(function(){
                self.buildHostTexts();
            });
        },

        /**
         * Page animation
         */
        animatePages(){
            let self = this;
            
            this.noPages = Math.ceil(this.meetings.length / this.itemsPerPage);
            if(this.pageInterval !== null) {
                clearInterval(this.pageInterval);
            }
            this.page = 1;
            if(this.noPages > 1) {
                this.pageInterval = setInterval(function(){
                    if(self.noPages === self.page) {
                        self.page = 1;
                    } else {
                        self.page = self.page + 1;
                    }
                }, 1000 * this.pageAnimationSpeed);
            }
        },

        /**
         * Build host texts
         */
        buildHostTexts(){
            let self = this;
            
            this.hostTexts.push(self.greetingTexts[self.locale][0][self.getDayTimeIndex()]);
            this.hostTexts.push(this.greetingTexts[this.locale][1]);
            if(this.location){
                this.hostTexts.push(this.greetingTexts[this.locale][2].replace('##locationName##', this.location.Name));
            }
            if(this.virtualManager) {
                this.hostTexts.push(this.greetingTexts[this.locale][3].replace('##host##', this.virtualManager.Name));
                
            }
            this.hostTexts.push(this.greetingTexts[this.locale][4]);
            
            if(this.greetingTextInterval) {
                clearInterval(this.greetingTextInterval);
            }
            this.greetingTextInterval = setInterval(function() {
                self.showDate = !self.showDate
                if (self.greetingTextIndex >= self.hostTexts.length - 1) {
                    self.hostTexts[0] = self.greetingTexts[self.locale][0][self.getDayTimeIndex()];
                    self.greetingTextIndex = 0
                  } else {
                    self.greetingTextIndex = self.greetingTextIndex + 1
                  }
            }, 6000);
        },

        /**
         * Get day time index
         */
        getDayTimeIndex() {
            let d = new Date();

            if (d.getHours() < 12) {
                return 0;
            } else if (d.getHours() >= 12 && d.getHours() < 18) {
                return 1;
            } else {
                return 2;
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
        getPublicEvents(specificMeetingDay, currentTime) {
            let self = this

            if(this.getPublicEventsToken) {
                this.getPublicEventsToken.cancel();
            }
            this.getPublicEventsToken = axios.CancelToken.source();

            return axios.get(this.apiNewUrl + '/event/public/location/' + this.locationId, {
                cancelToken: self.getPublicEventsToken.token,
                headers: {
                    'Content-type': 'application/json',
                    apiToken: this.apiToken
                },
                params: {
                    date: specificMeetingDay === '' ? self.$options.filters.dateObjectIsoDateString(currentTime) : specificMeetingDay
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
         * Get schedule
         */
        getSchedule(specificMeetingDay, currentTime) {
            return axios.get(this.apiNewUrl + '/Schedule', {
                params: {
                    locationId: this.locationId,
                    meetingtypeId: 1,
                    date: specificMeetingDay === '' ? this.$options.filters.dateObjectIsoDateString(currentTime) : specificMeetingDay
                },
                headers: {
                    'Content-type': 'application/json',
                    apiToken: this.apiToken
                }
            });
        },

        /**
         * Update current meetings
         */
        updateMeetings() {
            let self = this;
            axios.all([this.getSchedule(this.specificMeetingDay, this.currentTime), this.getPublicEvents(this.specificMeetingDay, this.currentTime)])
            .then(axios.spread((scheduleResponse, publicEventsResponse) => {
                let publicEvents = publicEventsResponse.data.filter(e => e.Id.startsWith('R'));
                let schedule = scheduleResponse.data.Spaces.filter(space => !space.SpaceName.startsWith('[hidden]'));
                schedule.forEach(space => {
                    let foundSpace = self.spaces.find(s => s.Id === space.SpaceId)
                    space.PublicName = ''
                    if(foundSpace !== 'undefined') {
                        space.PublicName = foundSpace.Descriptions.find(d => d.LanguageId === self.languageId).Name;
                    }
                    foundSpace = null
                    space.Items.forEach(reservation => {
                        reservation.CompanyName = ''
                        let foundEvent = publicEvents.find(e => e.ReservationId === reservation.ItemId && reservation.Type === 'Reservation')
                        if(typeof foundEvent !== 'undefined') {
                            reservation.CompanyName = foundEvent.CompanyName
                        }
                    })
                })
                self.meetings = schedule
            }))
            .finally(()=> {
                self.initialLoadReady = true;
            })
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