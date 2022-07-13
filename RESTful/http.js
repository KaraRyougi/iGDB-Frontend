import { Database } from "bun:sqlite";

const db = Database.open("./database", { readonly: true })

export default {
  port: 3000,
  fetch(req) {
    const url = new URL(req.url)
    const asn = url.searchParams.get('asn')
    const headers = new Headers({'content-type': 'application/json'})
    var body = ''
    
//     if (asn is not a number) {
//       return new Response({})
//     }
    
    if (url.pathname == '/asn_org') {
      const asn_org = db.query("SELECT * FROM 'asn_org' WHERE asn=$asn").all({
        $asn: asn,
      })
      body = JSON.stringify(asn_org)
    } else if (url.pathname == '/asn_geo') {
      const asn_geo = db.query("SELECT * FROM 'asn_loc' WHERE asn=$asn").all({
        $asn: asn,
      })
      body = JSON.stringify(asn_geo)
//     } else {
//       return new Response({})
    }
    return new Response(body, { headers, status: 200 })
  }
}

// 
// /asn_org?asn=46997
// /asn_geo?asn=46997
// 
// 
// {
// "asn":
// "data": [
//   {
//     "source": [
//       "RIPEAtlas",
//       "PeeringDB",
//     ]
//     "location": {
//       "city":"",
//       "state":"",
//       "country_code":"",
//       "coordinate": {
//         "latitude":"",
//         "longitude":""
//       }
//     },
//     "last_update":"",
//   },
// ]}