$("document").ready(function(){
    //First, find the distances between cities and place them in dictionary (associative array)
    var cities = new Array();
    var notset = new Set();
    var yesset = new Set();
    var citydata;
    d3.csv("../city_distances.csv", function(input){
        citydata = input; //city1, city2, miles
        
        for(var i = 0; i < citydata.length; i++){
            cities[citydata[i].city2] = 0;
            cities[citydata[i].city1] = 0;
            notset.add(citydata[i].city1);
            notset.add(citydata[i].city2);
        }
        var basecity = citydata[0].city1;
        cities[basecity] = 0;
        var mindist = 0;
        notset.delete(basecity);
        yesset.add(basecity);
        
        //While we have unset distances on cities, we'll continue iterating through the dataset.
        while (notset.size != 0){
            //For loop through and update distances
            for(var i = 0; i < citydata.length; i++){
                var route = citydata[i];
                var city1 = route.city1;
                var city2 = route.city2;
                var newdist = 0;
                if(yesset.has(city1) && !yesset.has(city2)){ //City 2 is +miles away from City 1
                    newdist = cities[city1] + parseInt(route.miles)/8;
                    cities[city2] = newdist;
                    notset.delete(city2);
                    yesset.add(city2);
                }else if(yesset.has(city2) && !yesset.has(city1)){ //City 1 is -miles away from City 2
                    newdist = cities[city2] - parseInt(route.miles)/8;
                    cities[city1] = newdist;
                    notset.delete(city1);
                    yesset.add(city2);
                }
                if(newdist < mindist){
                    mindist = newdist;
                }
            }
        }

        mindist = -mindist;
        for(var key in cities){
            cities[key] += mindist;
        }

        //cities now contains all of the cities with relative distances, forming the basis for our vertical axis.
        //We can now set about finding a time range using the time csv.
        getTimes(cities);
    });

    function getTimes(cities){
        var timedata;
        //We'll convert 24-hour times into numbers we can use for positioning in d3. 
        //Formula: position = hour*72 + min/5*6. i.e. each hour is 72 apart, each 10-minute interval is 12 apart.
        var earlytime = 1717; //The max possible time, 23:50, would log in conversion to 1716, so this is one over the max.
        var latetime = 0;
        d3.csv("../hyperloop.csv", function(input){
            timedata = input; 
            //Each object is a train with train_name and arrival and departure times in format "[city] [arrive/depart]". Null for invalid stop.
            for(var i = 0; i < timedata.length; i++){
                var train = timedata[i];
                var keys = Object.keys(train);
                for(var j = 1; j < keys.length; j++){ //Setting to 1 cuts out the train_name
                    var times = train[keys[j]].split(":");
                    var hour = parseInt(times[0])*72;
                    var minute = parseInt(times[1])/5*6;
                    var time = hour + minute;
                    if(time == null){
                        continue;
                    }
                    if(time < earlytime){
                        earlytime = time;
                    }
                    if(time > latetime){
                        latetime = time;
                    }
                }
            }

        //We've now found our earliest and latest times, marking the bounds on our horizontal axis.
        //This function is called after we've found our vertical axis, so we now know the information to draw the whole grid.
        drawGrid(cities, timedata, earlytime, latetime);
        });
    }

    function toTime(position){
        //As per the formula outline above, takes a number and converts it to its respective time.
        var minutes = (position%72/6*5).toString();
        if (minutes == "0"){
            minutes = "00";
        }
        var hours = ((position - (position%72))/72).toString();
        if (hours == "0"){
            hours = "00";
        }
        return hours + ":" + minutes;
    }

    function fromTime(time){
        var times = time.split(":");
        var hours = parseInt(times[0]);
        var minutes = parseInt(times[1]);
        return hours*72 + minutes/5*6;
    }

    function drawGrid(cities, timedata, earlytime, latetime){
        var width = latetime - earlytime;
        var names = []
        var height = 0;
        for(var key in cities){
            names.push(key);
            if(cities[key] > height){
                height = cities[key];
            }
        }


        var grid = d3.select("#trains").append("svg")
                        .attr("width", width+100)
                        .attr("height", height + 70)
                        .style("background", "#fff7ec")
                        .classed("grid", true);


        //Add city names
        grid.selectAll(".city")
            .data(names)
            .enter()
            .append("text")
            .classed("city", true)
            .attr("y", function(k){return cities[k] + 55;})
            .attr("width", "80px")
            .text(function(k){return k;});

        //Add horizontal lines at the cities

        grid.selectAll("path")
            .data(names)
            .enter()
            .append("path")
            .classed("cityline", true)
            .attr("d", function(city){return drawCity(cities[city], width);})
            .attr("stroke", "#444444")
            .attr("stroke-width", 1);

        //Add times at the top
        //Add vertical time lines
        for(var t = earlytime; t <= latetime; t+=12){
            var pos = t - earlytime + 100;
            //Always draw a vertical line at position t. If it's on an hour, denote a time label at the top as well.
            grid.append("path")
                .classed("timeline", true)
                .attr("d", "M"+pos+" 55 L"+pos+" "+(height+55))
                .attr("stroke", "#444444");

            var time = toTime(t);
            if (time.split(":")[1] == "00"){
                grid.append("text")
                    .classed("time", true)
                    .text(time)
                    .attr("x", pos-15)
                    .attr("y", 45);
            }
                    
        }

        //Add train lines
        grid.selectAll("trains")
            .data(timedata)
            .enter()
            .append("path")
            .classed("trainline", true)
            .attr("id", function(t){return t.train_name;})
            .attr("d", function(t){return drawTrain(cities, names, t, earlytime, latetime);})
            .attr("stroke", function(t){return genColor(t);})
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .append("svg:title")
            .text(function(t){return genTooltip(t, names, earlytime);});

        //Hover effects
        hoverListen(timedata);
    }

    function drawCity(height, width){
        var path = "M100 ";
        path += height+55;
        path += " L"+(width+100)+" "+(height+55);
        return path;
    }

    function drawTrain(cities, names, times, earlytime, latetime){
        var path = "";
        //Find the starting city (i.e. the one with earliest departure time)
        var a = " arrive";
        var finda;
        var d = " depart"; //For easy access of data
        var findd;
        var firstcity;
        var deptime;
        var earliest = fromTime("24:00");

        for(var city in names){
            findd = names[city] + d;
            deptime = times[findd];
            if(deptime == ""){
                continue;
            }
            if(fromTime(times[findd]) < earliest){
                firstcity = names[city];
                earliest = fromTime(times[findd]);
            }
        }
        console.log(times);

        //Our line starts at (firstcity, 6am) and draws straight until "firstcity depart"; from there it's an iteration
        var x = fromTime("6:00") + 100 - earlytime;
        var y = cities[firstcity] + 55;
        var currtime = fromTime("06:00");
        path += "M"+x+" "+y+" ";

        findd = firstcity + d;
        var departed = true;

        var arrcity;
        var depcity;

        //Find first departure time
        x = fromTime(times[findd]) + 100 - earlytime;
        currtime = fromTime(times[findd]);
        console.log("First Departure: ", firstcity, x, y, toTime(currtime));
        while(departed){
            path += "L"+x+" "+y+" ";
            var arrival = fromTime("24:00");

            for(var city in names){
                finda = names[city] + a;
                var arrtime = times[finda];
                if(arrtime == ""){
                    continue;
                }
                arrtime = fromTime(arrtime);
                if(arrtime > currtime && arrtime < arrival){
                    arrival = arrtime;
                    arrcity = names[city];
                }
            }
            //We now have the next arrival so we can draw a new line
            y = cities[arrcity] + 55;
            x = arrival + 100-earlytime;
            path += "L"+x+" "+y+" ";
            currtime = arrival;
            departed = false;

            console.log("Arrived: ", arrcity, x, y, toTime(currtime));

            //Now, we have to find the next departure, if it exists; if it doesn't we're done
            //Logically, we have to depart from the city from which we arrived
            //(This is the straight line portion of the viz)
            findd = arrcity + d;
            if(times[findd] != "" && fromTime(times[findd]) >= currtime){
                departed = true;
                depcity = arrcity;
                deptime = fromTime(times[findd]);
            }

            if(departed){ //Draw a line to the departure point
                y = cities[depcity] + 55;
                x = deptime + 100-earlytime;
                currtime = deptime;
                console.log("Departed: ", depcity, x, y, toTime(currtime));
            }
            //Then, if the train departed, we restart the process of finding the next arrival
        }
        
        x = latetime + 100 - earlytime; //Jump to the end
        path += "L"+x+" "+y;
        return path;
    }

    function genColor(train){
        var passenger = train.train_name;
        color = "#";
        var letter;
        for(var i in passenger){
            letter = (passenger[i].charCodeAt()%16).toString(16);
            color += letter;
            if(color.length == 7){
                break;
            }
        }
        while (color.length < 7){
            color += Math.floor((Math.random() * 16)).toString(16);
        }
        return color;
    }

    function genTooltip(train, names, earlytime){
        var info = "";
        //Name
        console.log(train);
        info += "Name: "+train.train_name+"\n";
        
        //Find stations in order and add them
        var currtime = earlytime;
        var deptime = fromTime("24:00");
        var depcity;
        var arrtime = fromTime("24:00");
        var arrcity;
        var mytime;
        var d = " depart";
        var a = " arrive";
        var departed = true;
        var city;
        var findd;
        var finda;

        //Find first departure
        for(var city in names){
            findd = names[city] + d;
            mytime = train[findd];
            if(mytime == ""){
                continue;
            }
            if(fromTime(mytime) < deptime){
                depcity = names[city];
                deptime = fromTime(mytime);
            }
        }
        
        info += depcity + ":\n  Departs: "+toTime(deptime)+"\n";
        currtime = deptime;

        while(departed){
            //First, find next arrival
            for(var i in names){
                city = names[i];
                finda = city + a;
                if(train[finda] == ""){
                    continue;
                }
                mytime = fromTime(train[finda]);
                if(mytime < arrtime && mytime > currtime){
                    arrtime = mytime;
                    arrcity = city;
                }
            }

            info += arrcity + ":\n  Arrives: "+toTime(arrtime)+"\n";
            currtime = arrtime;
            arrtime = fromTime("24:00");
            departed = false;

            //Next find equivalent departure, if exists
            findd = arrcity + d;
            if(train[findd] == ""){
                break;
            }
            
            departed = true;
            deptime = fromTime(train[findd]);
            currtime = deptime;

            info += "  Departs: "+toTime(deptime)+"\n";
        }

        return info;
    }

    function hoverListen(timedata){
        $(".trainline").mouseenter(function(event){
            var train = event.target.id;
            $("#"+train).attr("stroke-width", "4px");
        });
        $(".trainline").mouseleave(function(event){
            var train = event.target.id;
            $("#"+train).attr("stroke-width", "2px");
        });
    }
});
