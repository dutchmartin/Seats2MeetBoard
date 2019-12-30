/**
 * Object helpers
 */
Vue.filter('sortedItems', (val, starTime = 'StartMinutes') => {
    return val.slice().sort((a, b) => {
      // Sort by votes
      // If the first item has a higher number, move it down
      // If the first item has a lower number, move it up
      if (a[starTime] > b[starTime]) return 1
      if (a[starTime] < b[starTime]) return -1
    });
});

/**
 * Date helpers
 */


 /**
  * Time helpers
  */
 Vue.filter('minutesToTime', val => {
    let realmin = val % 60
    let hours = Math.floor(val / 60)
    return ('0' + hours).slice(-2) + ':' + ('0' + realmin).slice(-2)
})

Vue.filter('timeNotation', val => {
    return ('0' + val.getHours()).slice(-2) + '<span class="blink">:</span>' + ('0' + val.getMinutes()).substr(-2)
});

/**
 * Image helper
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