var fs =  require('fs');

var d = new Date();

function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}
var savetime=(pad(d.getMonth())+"-"+pad(d.getDay())+" " +pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds()));

var config={};
var config_file="./config.json";
if (fs.existsSync(config_file)) {
	 fs.readFile(config_file, function readFileCallback(err, data) {
		   if (err) {
			     } else {
				        config = JSON.parse(data);
				     	 if (config.weight_url[0]){ save(config.weight_url[0]) }
				       }
		  })
}


const axios = require('axios');
function save(url){ 
 axios.get(url)
  .then(response => {
                  var stdout=response.data
                  var arr= stdout.split("\n\n");
                  var result_weight=0;
                  for ( var i=0; i< arr.length; i++){
                        //console.log("string: "+arr[i]);
                        var ves = arr[i].split("=");
                        var weight1="";
                        var sovp=0;
                        for (var ii=0; ii<ves.length; ii++){
                                if ((ves[ii].length==7) && (+ves[ii]) ) {
                                        var weight= ves[ii].split("").reverse().join("");
                                        //console.log("w:",weight);
                                        if ( weight1.indexOf(weight) == -1 ) {
                                                weight1 += " " +weight;
                                        } else {
                                                sovp++;
                                                if ( sovp > 5 ) {
                                                        sovp=0;
                                                        result_weight=weight;
                                                        //console.log("stable: "+(+weight)+" same "+sovp + " i: "+i);
                                                }
                                        }
                               }
                        }
                        console.log("url:"+url+" time: "+savetime+" stabel: " +weight1+ " sovp: " + sovp);
                }


  })
  .catch(error => {
    //console.log(error);
  });

}

