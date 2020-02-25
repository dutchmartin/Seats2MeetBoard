/**
 * Erase cookie. Includes wildcard cookie
 * @param {string} cName
 */
function eraseCookie(cName) {
  if (getCookie(cName) !== '') {
    document.cookie = cName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    document.cookie = cName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.seats2meet.com'
  }
}

/**
 * Get cookie data
 * @param {string} cName
 * @returns string
 */
function getCookie(cName) {
  if (document.cookie.length > 0) {
    var arr = document.cookie.split(';')
    cName = cName + '='
    var value = ''
    for (var i = 0, arrLength = arr.length; i < arrLength; i++) {
      value = arr[i].trim()
      if (value.indexOf(cName) !== -1 && value.indexOf(cName) === 0) {
        value = value.substr(cName.length)
        break
      }
      value = ''
    }
    return value
  }
  return ''
}

/**
 * Set cookie
 * @param {string} cName
 * @param {string} value
 * @param {number} days
 * @param {boolean} isWildcard
 * @param {boolean} reload
 * @returns boolean
 */
function setCookie(cName, value, days = 1, reload = false) {
  var expires = ''
  var domain = ''
  if (typeof days === 'number') {
    var date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }

  document.cookie = cName + '=' + value + expires + domain + '; path=/' // Refresh the page
  if (reload) {
    location.reload(true)
  }
  return true
}
