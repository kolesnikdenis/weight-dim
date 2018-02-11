#stty -F /dev/ttyUSB0 1200 raw -echo 

#while true 
#do
exec 3</dev/ttyUSB0                    #REDIRECT SERIAL OUTPUT TO FD 3
  cat <&3 > /tmp/ttyDump.dat &          #REDIRECT SERIAL OUTPUT TO FILE
    PID=$!                                #SAVE PID TO KILL CAT
	    sleep 1.0s                          #WAIT FOR RESPONSE
	      kill $PID                             #KILL CAT PROCESS
	      exec 3<&-                               #FREE FD 3
	      cat /tmp/ttyDump.dat  
	      echo "";
	      echo ""
	      #sleep 0.5s
#      done

