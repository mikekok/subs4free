// Dependencies
const request = require('request')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')

// Greek Encoding
const encoding = 'iso-8859-7'

// Base URL
const URL = 'http://www.subs4free.com'

// Search by query
let getSubs = (query, cb) => {
  let searchURL = `${URL}/search_report.php?search=${query}`
  request(searchURL, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      let $ = cheerio.load(body)

      // Movies List [{id, title}]
      let movies = []
      $('select.style10 option').each(function() {
        let id = $(this).val().split('-').pop().split('.')[0]
        let title = $(this).text()
        let info = {id, title}
        movies.push(info)
      })
      movies.shift()

      // Subtitles List [{lang, name, uploader, downloads, link}]
      let subs = []
      $('.page_header table tr:nth-child(2) td table').each(function() {
        let lang = $(this).find('tr').first().find('td').eq(1).find('img').attr('src') != undefined ? $(this).find('tr').first().find('td').eq(1).find('img').attr('src').split('/').pop().split('.')[0] : ''
        let name = $(this).find('tr').first().find('td').eq(2).find('b').text().trim() != '' ? $(this).find('tr').first().find('td').eq(2).find('b').text().trim() : ''
        let uploader = $(this).find('tr').eq(1).find('td').first().find('table tr td b').text().trim() != '' ? $(this).find('tr').eq(1).find('td').first().find('table tr td b').text().trim() : ''
        let downloads = $(this).find('tr').eq(1).find('td:nth-child(2) b').text().trim() != '' ? $(this).find('tr').eq(1).find('td:nth-child(2) b').text().trim() : ''
        let link = $(this).find('tr').first().find('td').eq(3).find('a').attr('href') != undefined ? URL + $(this).find('tr').first().find('td').eq(3).find('a').attr('href') : ''
        
        if (lang != '' && name != '' && uploader != '' && downloads != '' && link != '') {
          let sub = {lang, name, uploader, downloads, link}
          subs.push(sub)
        }
      })

      // Languages [lang, lang...]
      let langs = Array.from(new Set(subs.map(x => x.lang)))

      if (movies.length > 0 && subs.length > 0) {
        // Results callback
        cb(null, {movies_count: movies.length, subs_count: subs.length, langs, movies, subs})
      } else {
        // No movies found callback
        cb(null, {movies: 'No movies or subtitles were found'})
      }
    } else {
      // Error callback
      cb(err)
    }
  })
}

// Search by movie id
let getSubsById = (movie_id, cb) => {
  let searchURL = `${URL}/movie-${movie_id}.html`
  request({url: searchURL, encoding: null}, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      body = iconv.decode(body, encoding)
      let $ = cheerio.load(body)

      // Subtitles List [{lang, name, uploader, downloads, link}]
      let subs = []
      $('#subsTR table tr:nth-child(2) td table').each(function() {
        let lang = $(this).find('tr').first().find('td').eq(1).find('img').attr('src') != undefined ? $(this).find('tr').first().find('td').eq(1).find('img').attr('src').split('/').pop().split('.')[0] : ''
        let name = $(this).find('tr').first().find('td').eq(2).find('b').text().trim() != '' ? $(this).find('tr').first().find('td').eq(2).find('b').text().trim() : ''
        let uploader = $(this).find('tr').eq(1).find('td').first().find('table tr td b').text().trim() != '' ? $(this).find('tr').eq(1).find('td').first().find('table tr td b').text().trim() : ''
        let downloads = $(this).find('tr').eq(1).find('td:nth-child(2) b').text().trim() != '' ? $(this).find('tr').eq(1).find('td:nth-child(2) b').text().trim() : ''
        let link = $(this).find('tr').first().find('td').eq(3).find('a').attr('href') != undefined ? URL + $(this).find('tr').first().find('td').eq(3).find('a').attr('href') : ''
        
        if (lang != '' && name != '' && uploader != '' && downloads != '' && link != '') {
          let sub = {lang, name, uploader, downloads, link}
          subs.push(sub)
        }
      })

      // Languages [lang, lang...]
      let langs = Array.from(new Set(subs.map(x => x.lang)))

      if (subs.length > 0) {
        // Results callback
        cb(null, {subs_count: subs.length, langs, subs: subs})
      } else {
        // No subtitles found callback
        cb(null, {subs: 'No subtitles were found'})
      }
    } else {
      // Error callback
      cb(err)
    }
  })
}

// Export Functions
module.exports = {getSubs, getSubsById}
