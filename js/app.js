/**
 * Register the meeting card component
 */
Vue.component('meeting-card', {
    template: '#meetingCard',
    props: {
      companyName: String,
      meetingTitle: String,
      spaceTitle: String
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
            apiUrl: 'http://localhost:50210/api',
            apiNewUrl: 'http://localhost:51279/api/v1',
            apiToken: 398140257,
            azureStorageUrl: 'https://az691754.vo.msecnd.net/website',
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
            locationId: 85,
            location: null,
            meetings: [],
            spaces: [],
            virtualManager: null,
        }
    },

    created() {
        this.init();
    },

    beforeDestroy() {
        clearInterval(self.greetingTextInterval);
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
                self.virtualManager = virtualManagerResponse.data;
              }

              // Process events
              if(publicEventsResponse.status === 200) {
                self.meetings = publicEventsResponse.data.filter(e => e.Id.startsWith('R'));
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
                }, 6000)
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
         * Build virtual manage image url
         * @param {string} filename 
         * @param {number} locationId 
         * @param {number} size
         */
        getVirtualManagerImageSrc(filename = '', locationId = 0, size = null) {
            let virtualManagerPhotoSize = {
                80: '84x84_',
                160: '160x160_',
                240: '240x240_'
              };

            if (filename === '' || locationId === 0) {
              return '';
            }
            if (size === null || size === 0) {
              // Original photo size
              return `${this.azureStorageUrl}/${locationId.toString()}/${filename}`;
            } else {
              return this.getSizedJPGVersion(locationId.toString(), filename, virtualManagerPhotoSize[size]);
            }
        },

        /**
         * Get sized JPG version
         * @param {string} prefix 
         * @param {string} filename 
         * @param {string} size 
         */
        getSizedJPGVersion(prefix = '', filename = '', size = '') {
            if (prefix !== '') {
              prefix = '/' + prefix;
            }
          
            let filenameNoExtension = filename.substring(0, filename.lastIndexOf('.'));
          
            let position = Number(filename.indexOf('.'));
            let imageLength = Number(filename.length);
            let imageExtension = filename.substring(position, imageLength);
          
            return `${this.azureStorageUrl}${prefix}/${size}${filenameNoExtension}${imageExtension}`;
          }
    }
  })