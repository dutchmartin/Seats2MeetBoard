/**
 * -----------------------------
 * Object helpers
 * -----------------------------
 */
Vue.filter('sortedItems', (val, orderKey = 'StartMinutes') => {
    return val.slice().sort((a, b) => {
      // Sort by votes
      // If the first item has a higher number, move it down
      // If the first item has a lower number, move it up
      if (a[orderKey] > b[orderKey]) return 1
      if (a[orderKey] < b[orderKey]) return -1
    });
});

/**
 * -----------------------------
 * Date helpers
 * -----------------------------
 */
Vue.filter('dateObjectIsoDateString', dateObj => {
    if (typeof dateObj !== 'undefined') {
      let newDateObj = new Date();
      if (typeof dateObj === 'string') {
        newDateObj = parseIsoDateStringToDate(dateObj);
      } else {
        newDateObj = dateObj;
      }
      let day = newDateObj.getDate().toString();
      let month = (newDateObj.getMonth() + 1).toString();
      let year = newDateObj.getFullYear().toString();
  
      if (month.length === 1) {
        month = '0' + month.toString();
      }
  
      if (day.length === 1) {
        day = '0' + day.toString();
      }
  
      return year + '-' + month + '-' + day;
    }
    return '';
  })

  // Global function
  function parseIsoDateStringToDate(dateString) {
    let time = ('' + dateString).replace(/-/g, '/').replace(/[TZ]/g, ' ');
    let date = new Date(time);
    return date;
  }


 /**
 * -----------------------------
  * Time helpers
 * -----------------------------
  */
 Vue.filter('timeToMinutes', val => {
    let d = new Date(val);
    let hours = d.getHours();
    let minutes = d.getMinutes();
  
    return Number((hours * 60 ) + minutes);
  });

 Vue.filter('minutesToTime', val => {
    let realmin = val % 60;
    let hours = Math.floor(val / 60);
    return ('0' + hours).slice(-2) + ':' + ('0' + realmin).slice(-2);
});

Vue.filter('timeNotation', val => {
    return ('0' + val.getHours()).slice(-2) + '<span class="blink">:</span>' + ('0' + val.getMinutes()).substr(-2);
});

/**
 * -----------------------------
 * Image helper
 * -----------------------------
 */
const azureStorageUrl = 'https://az691754.vo.msecnd.net/website';
/**
 * Build virtual manage image url
 * @param {string} filename 
 * @param {number} locationId 
 * @param {number} size
 */
Vue.filter('getVirtualManagerImageSrc', (filename = '', locationId = 0, size = null) => {
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
        return `${azureStorageUrl}/${locationId.toString()}/${filename}`;
    } else {
        return getSizedJPGVersion(locationId.toString(), filename, virtualManagerPhotoSize[size]);
    }
});

/**
 * Get sized JPG version
 * @param {string} prefix 
 * @param {string} filename 
 * @param {string} size 
 */
function getSizedJPGVersion(prefix = '', filename = '', size = '') {
    if (prefix !== '') {
        prefix = '/' + prefix;
    }
    
    let filenameNoExtension = filename.substring(0, filename.lastIndexOf('.'));
    
    let position = Number(filename.indexOf('.'));
    let imageLength = Number(filename.length);
    let imageExtension = filename.substring(position, imageLength);
    
    return `${azureStorageUrl}${prefix}/${size}${filenameNoExtension}${imageExtension}`;
}