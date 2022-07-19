import { Database } from "bun:sqlite";

const db = Database.open("./database", { readonly: true })

export default {
  port: 3000,
  fetch(req) {
    const url = new URL(req.url)
    const asn = url.searchParams.get('asn')
    const headers = new Headers({'content-type': 'application/json'})
    var result = ''
    var jsonObject = { 
      'data': '',
      'request_name': '',
      'request_param': '',
      'request_time': '',
    }

    if (asn && !Number.isInteger(parseInt(asn))) {
      jsonObject['request_name'] = 'error'
      jsonObject['request_param'] = 'asn must be an integer'
    } else if (url.pathname == '/asn_org') {
      jsonObject['request_name'] = 'asn_org'
      jsonObject['request_param'] = asn
      result = db.query("SELECT * FROM 'asn_org' WHERE asn=$asn").all({
        $asn: asn,
      })
    } else if (url.pathname == '/asn_geo') {
      jsonObject['request_name'] = 'asn_geo'
      jsonObject['request_param'] = asn
      result = db.query("SELECT * FROM 'asn_loc' WHERE asn=$asn").all({
        $asn: asn,
      })
    } else if (url.pathname == '/asn_search') {
      jsonObject['request_name'] = 'asn_search'
      jsonObject['request_param'] = url.searchParams.get('org')
      result = db.query("SELECT * FROM 'asn_org' WHERE source == 'PeeringDB' AND (organization LIKE $query_1 OR organization LIKE $query_2)").all({
        $query_1: '% ' + url.searchParams.get('org') + '%',
        $query_2: url.searchParams.get('org') + '%'
      })
    } else {
      jsonObject['request_name'] = 'unknown'
      jsonObject['request_param'] = ''
    }

    jsonObject['data'] = result
    jsonObject['request_time'] = new Date().toISOString()
    var body = JSON.stringify(jsonObject)
    return new Response(body, { headers, status: 200 })
  }
}

// /asn_org?asn=46997
// /asn_geo?asn=46997
// /asn_search?org=google

// time: "2022-07-17T18:39:30.839140"
// total_count:
// data: 