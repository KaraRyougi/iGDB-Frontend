import { Database } from "bun:sqlite";

const db = Database.open("");

export default {
  port: 3000,
  fetch(request) {
      
    var asn_name = db.query("");
    var asn_loc = db.query("");
    asn_name.all();
    },
};
