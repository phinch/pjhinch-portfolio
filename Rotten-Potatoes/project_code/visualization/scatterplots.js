$("document").ready(function(){
    var height = $(".box").width();
    var width = $(".box").width();
    var rows = 4;
    var normalizer = 100; //Play with this value to change the number of dots
    var variance = 20; //Play with this value to change how spread out the dots are
    var map = ["price", "reservations", "attire", "takeout"];
    var axes = {
        "price": ["$,$$", "$$$,$$$$"],
        "reservations": ["No", "Yes"],
        "attire": ["Casual", "Formal"],
        "takeout": ["No", "Yes"]
    };

    d3.csv("../cleaned_data/philip.csv", function(d){
        var data = d;
        drawViz(data);
    });

    function drawViz(data){
        for(var i = 0; i < rows; i++){ //Row
            for(var j = 0; j < rows; j++){ //Column
                var boxid = "#box"+i+j;

                //if i = j, no scatterplot; just a label instead
                if(i == j){
                    d3.select(boxid).html("<p class = 'name'>"+map[i]+"</p><br><p class = 'descrip'>"+axes[map[i]][0]+" / "+axes[map[i]][1]+"</p>");
                }

                else{
                    var plot = d3.select(boxid).append("svg").attr("height", height+10).attr("width", width+10);
                    plot.append("line")
                        .attr("stroke-width", 1)
                        .attr("stroke", "#bbbbbb")
                        .attr("x1", 0)
                        .attr("y1", height/4)
                        .attr("x2", width)
                        .attr("y2", height/4);

                    plot.append("line")
                        .attr("stroke-width", 1)
                        .attr("stroke", "#bbbbbb")
                        .attr("x1", 0)
                        .attr("y1", height*3/4)
                        .attr("x2", width)
                        .attr("y2", height*3/4);

                    plot.append("line")
                        .attr("stroke-width", 1)
                        .attr("stroke", "#bbbbbb")
                        .attr("x1", width/4)
                        .attr("y1", 0)
                        .attr("x2", width/4)
                        .attr("y2", height);

                    plot.append("line")
                        .attr("stroke-width", 1)
                        .attr("stroke", "#bbbbbb")
                        .attr("x1", width*3/4)
                        .attr("y1", 0)
                        .attr("x2", width*3/4)
                        .attr("y2", height);

                    plot.append("text")
                        .text(axes[map[i]][0])
                        .attr("x", width/4)
                        .attr("y", height+10)
                        .attr("text-anchor", "middle")
                        .classed("label x", true);

                    plot.append("text")
                        .text(axes[map[i]][1])
                        .attr("x", width*3/4)
                        .attr("y", height+10)
                        .attr("text-anchor", "middle")
                        .classed("label x", true);

                    var h = Math.sqrt(Math.pow((width+2), 2) + Math.pow((height*3/4), 2));
                    var a = Math.PI/2 - Math.atan((height*3/4)/(width+2));
                    var x = h*Math.cos(a);
                    var y = h*Math.sin(a);
                    console.log(h, a, x, y);
                    plot.append("text")
                        .text(axes[map[j]][0])
                        .attr("x", x)
                        .attr("y", -y)
                        .attr("text-anchor", "middle")
                        .classed("label y", true);

                    var h = Math.sqrt(Math.pow((width+2), 2) + Math.pow((height/4), 2));
                    var a = Math.PI/2 - Math.atan((height/4)/(width+2));
                    var x = h*Math.cos(a);
                    var y = h*Math.sin(a);
                    plot.append("text")
                        .text(axes[map[j]][1])
                        .attr("x", x)
                        .attr("y", -y)
                        .attr("text-anchor", "middle")
                        .classed("label y", true);

                    d3.selectAll(".y").attr("transform", "rotate(90)");

                    //Count data
                    var topleft = 0;
                    var topright = 0;
                    var botleft = 0;
                    var botright = 0;

                    //i is x axis, j is y axis
                    for(object in data){
                        var restaurant = data[object];
                        if(restaurant[map[i]] == "True" && restaurant[map[j]] == "True"){
                            topright += 1;
                        }else if(restaurant[map[i]] == "True" && restaurant[map[j]] == "False"){
                            botright += 1;
                        }else if(restaurant[map[i]] == "False" && restaurant[map[j]] == "True"){
                            topleft += 1;
                        }else if(restaurant[map[i]] == "False" && restaurant[map[j]] == "False"){
                            botleft += 1;
                        }
                    }

                    var basex;
                    var basey;

                    topleft = Math.ceil(topleft/normalizer);
                    basex = width/4;
                    basey = height/4;
                    circles(plot, basex, basey, topleft);

                    topright = Math.ceil(topright/normalizer);
                    basex = width*3/4;
                    basey = height/4;
                    circles(plot, basex, basey, topright);

                    botleft = Math.ceil(botleft/normalizer);
                    basex = width/4;
                    basey = height*3/4;
                    circles(plot, basex, basey, botleft);

                    botright = Math.ceil(botright/normalizer);
                    basex = width*3/4;
                    basey = height*3/4;
                    circles(plot, basex, basey, botright);
                }
            }
        }
    }

    function circles(plot, basex, basey, count){
        for(var x = 0; x < count; x++){
            var radius = Math.random()*variance;
            var angle = Math.random()*360;

            var myy = basey + Math.sin(angle)*radius;
            var myx = basex + Math.cos(angle)*radius;

            plot.append("circle")
                .attr("cx", myx)
                .attr("cy", myy)
                .attr("r", 1)
                .attr("stroke", "black")
                .attr("fill", "black");
        }
    }
});
