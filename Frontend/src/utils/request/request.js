import { datadogLogs } from '@datadog/browser-logs'

function request(url, options) {
  return fetch(`${url}`, {
    ...options,
    credentials: 'include'
  })
    .then(checkStatus)
    .catch((err) => {
      console.log(err)
      datadogLogs.logger.error('requests.js', {}, err)
    })
    .then(parseResponse)
}

const requesObj = { request }

export default requesObj
