/**
 * Register the meeting card component
 */
Vue.component('space-card', {
    template: '#spaceCard',
    props: {
        currentTime: Date,
        meetings: Array,
        spaceName: String
    },

    data() {
      return {
          meeting: null
      }
    },

    created() {
        this.showBooking()
    },

    watch: {
        currentTime(val) {
        }
    },
    
    methods: {
        showBooking() {
            let self = this;

            /**
             * ToDo: get current meeting
             */
            let currentMinutes =  this.$options.filters.timeToMinutes(this.currentTime);
            let currentMeeting = null;

            if(this.meetings.length === 1) {
                if(currentMinutes <= this.meetings[0].EndMinutes) {
                    currentMeeting = this.meetings[0];
                }
            } else {
                for(let i in this.meetings) {
                    let _meeting = this.meetings[i];
                    let _startMinutes = _meeting.StartMinutes - 30;
                    let _endMinutes = _meeting.EndMinutes - 30;

                    if((currentMinutes >= _startMinutes && currentMinutes <= _endMinutes)) {
                        currentMeeting = _meeting;
                        break;
                    } else if(Number(i + 1) < this.meetings.length) {
                        if(currentMinutes <= this.meetings[Number(i + 1)].StartMinutes) {
                            currentMeeting = this.meetings[Number(i + 1)];
                            console.info(currentMeeting.Name)
                            break;
                        }
                    }
                }
            }

            if(currentMeeting) {
                this.meeting = currentMeeting;
            }
        }
    }
  })
