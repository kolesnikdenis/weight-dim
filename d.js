'use strict';
var fs =  require('fs');


        const execFile = require('child_process').execFile;
        const child = execFile('./start_read.sh', (error, stdout, stderr) => {
                if (error) {
                        console.error('stderr', stderr);
                } else {
		  var arr= stdout.split("\n\n");
		  var result_weight=NaN;
		  for ( var i=0; i< arr.length; i++){
			var ves = arr[i].split("=");
			var weight1="";
			var sovp=0;
			for (var ii=0; ii<ves.length; ii++){
				if ((ves[ii].length==7) && (+ves[ii]) ) {
					var weight= ves[ii].split("").reverse().join("");
					console.log(weight);
					if ( weight1.indexOf(weight) == -1 ) {  
						weight1 += " " +weight;
					} else { 
						sovp++; 
						if ( sovp > 5 ) {
							sovp=0;
							result_weight = weight;
							console.log("stable: "+(+weight)+" same "+10 + " i: "+i);
						}
					}
		       	       }
			}
			//console.log("stabel: " +weight1+ " sovp: " + sovp);
		  }
                        console.log('pages/add_ves', {set_weight: result_weight} );
                }
        });
console.log("test");
