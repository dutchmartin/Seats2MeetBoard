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

            for(let i in this.meetings) {
                console.info(Number(i + 1) + ' - ' + this.meetings.length);
                let _meeting = this.meetings[i];
                let _startMinutes = _meeting.StartMinutes - 30;
                let _endMinutes = _meeting.EndMinutes - 30;

                if((currentMinutes >= _startMinutes && currentMinutes <= _endMinutes)) {
                    currentMeeting = _meeting;
                    break;
                }
                // Return next meeting when
                // if(Number(i + 1) < this.meetings.length 
                //     && (currentMinutes >= _endMinutes && this.meetings[Number(i + 1)].StartMinutes <= currentMinutes)) {
                //     currentMeeting = this.meetings[i + 1];
                //     break;
                // }
            }

            if(currentMeeting) {
                this.meeting = currentMeeting;
            }
        }
    }
  })
