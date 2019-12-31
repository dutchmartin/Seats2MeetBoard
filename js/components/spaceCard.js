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
            /**
             * ToDo: get current meeting
             */
            // console.info('>>> ' + this.$options.filters.timeToMinutes(this.currentTime))
            let currentMinutes =  this.$options.filters.timeToMinutes(this.currentTime);
            let currentMeeting = null;

            currentMeeting = this.meetings.find((_meeting, index) => {
                let _startMinutes = _meeting.StartMinutes - 30;
                let _endMinutes = _meeting.EndMinutes - 30;
                if((currentMinutes >= _startMinutes && currentMinutes <= _endMinutes)) {
                    return _meeting
                }
            });

            if(currentMeeting) {
                this.meeting = currentMeeting;
            }

            // for(let i in this.meetings) {
            //     let _meeting = this.meetings[i];
            //     let _startMinutes = _meeting.StartMinutes - 30;
            //     let _endMinutes = _meeting.endMinutes - 30;

            //     // f (z >= x && z <= y)
            //     if(currentMinutes >= _startMinutes && currentMinutes <= _endMinutes) {

            //     }
            // }

            // this.meeting = this.meetings[0]
        }
    }
  })
