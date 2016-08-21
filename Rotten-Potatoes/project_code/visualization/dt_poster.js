$("document").ready(function(){
    //Draw lines from tier to tier iteratively
    //Note: For each button in one tier, we get the two corresponding buttons in the next tier and draw a path with text saying either Yes/No
    var numTiers = 4;
    var header = 77; //Put pixel height above the svg here
    var buttonheight = 40;
    var buttonwidth = 120; //Put in new values if they change TODO: More robust, get them yourself
    var tierwidth = $("#tier1").width();
    var tierheight = $("#tier1").height();

    //Draw paths from node to node by creating intermediate svgs.
    for(var i = 1; i < numTiers; i++){
        var top = header + buttonheight + tierheight*(i-1);
        var id = "tree"+i;
        d3.select("#content").append("svg")
            .attr("width", tierwidth)
            .attr("height", tierheight - buttonheight)
            .style("top", top)
            .attr("id", id)
            .classed("tree", true);
    }

    for(var i = 1; i < numTiers; i++){
        $("#tier"+i+" .node").each(function(index) {
            var parentid = $(this).parent().attr("id");
            var parenttier = parseInt(parentid.charAt(4));
            //For some index, we want to draw lines to the next tier's index*2 and (index*2+1)
            if($(this).css("margin") == "0px"){
                var myx = $(this).position()["left"] + buttonwidth/2;
            }else{
                var myx = $(this).position()["left"] + buttonwidth/2 + parseInt($(this).css("margin").split(" ")[1].split('p')[0]);
            }

            for(var c = index*2; c <= index*2+1; c++){
                var child = $("#tier"+(parenttier+1)).children().eq(c);
                var childx = child.position()["left"] + child.width()/2 + 6 + parseInt(child.css("margin").split(" ")[1].split('p')[0]);

                var middlex = (myx + childx)/2;

                var text = "Yes";
                var color = "#a3ff89";

                if(c%2 == 0){
                    text = "No";
                    var color = "#ffaa81";
                }

                d3.select("#tree"+parenttier).append("path")
                    .attr("d", "M"+myx+" 0 L"+childx+" 80")
                    .attr("stroke", color);

                d3.select("#tree"+parenttier).append("text")
                    .text(text)
                    .attr("y", 40)
                    .attr("x", middlex)
                    .attr("text-anchor", "middle")
                    .classed("yesno", true);
            }
            
        });
    }
    //The tree is now fully drawn.

    //Let's add a tooltip for each bubble. I guess. //TODO
    //An attempt to read information from the dot file:
    var treedata = [];
    var treelinks = [];
    var treelines = [];
    var classifiers = [];
    d3.text("../dt_graphic_representation/DT_undersampled.dot", function(text){
        var lines = text.split("\n");
        treedata[0] = $("#tier1").children().eq(0);
        //First, map the nodes of the tree
        for(var i = 0; i < lines.length; i++){
            var line = lines[i];
            if(line == "}"){
                break;
            }

            if(line.charAt(2) == "-" && line.charAt(3) == ">"){
                var parenttier = parseInt(treedata[line.charAt(0)].parent().attr("id").charAt(4));
                var parentindex = treedata[line.charAt(0)].index();
                if(line.charAt(6) == " "){
                    var topush = line.charAt(5);
                }else{
                    var topush = line.charAt(5)+line.charAt(6);
                }
                if(line.charAt(0) in treelinks){
                    treelinks[line.charAt(0)].push(topush);
                    if(parenttier != numTiers){
                        var childindex = parentindex*2 + 1;
                        treedata[topush] = $("#tier"+(parenttier + 1)).children().eq(childindex);
                    }
                }else{
                    treelinks[line.charAt(0)] = [topush];
                    if(parenttier != numTiers){
                        var childindex = parentindex*2;
                        treedata[topush] = $("#tier"+(parenttier + 1)).children().eq(childindex);
                    }
                }
            }else if(line.charAt(3) == "-" && line.charAt(4) == ">"){
                var parenttier = parseInt(treedata[(line.charAt(0)+line.charAt(1))].parent().attr("id").charAt(4));
                var parentindex = treedata[(line.charAt(0)+line.charAt(1))].index();
                if((line.charAt(0)+line.charAt(1)) in treelinks){
                    treelinks[(line.charAt(0)+line.charAt(1))].push(line.charAt(6)+line.charAt(7));
                    if(parenttier != numTiers){
                        var childindex = parentindex*2 + 1;
                        treedata[(line.charAt(6)+line.charAt(7))] = $("#tier"+(parenttier + 1)).children().eq(childindex);
                    }
                }else{
                    treelinks[(line.charAt(0)+line.charAt(1))] = [(line.charAt(6)+line.charAt(7))];
                    if(parenttier != numTiers){
                        var childindex = parentindex*2;
                        treedata[(line.charAt(6)+line.charAt(7))] = $("#tier"+(parenttier + 1)).children().eq(childindex);
                    }
                }
            }else if(line.charAt(2) == "["){
                treelines[line.charAt(0)] = line;
                if(line.split("label=\"")[1].charAt(0) != "X"){
                    classifiers[line.charAt(0)] = line;
                }
            }else if(line.charAt(3) == "["){
                treelines[line.charAt(0)+line.charAt(1)] = line;
                if(line.split("label=\"")[1].charAt(0) != "X"){
                    classifiers[line.charAt(0)+line.charAt(1)] = line;
                }
            }
        }

        //We now have all the information we need to create a tooltip for the thing
        //Treelines are in form 0 [label="X[9] <= 0.5\ngini = 0.5\nsamples = 3332\nvalue = [1666, 1666]"] ;
        for(var key in treelinks){
            var tip = treedata[key].text() + "<br>";
            var myline = treelines[key];
            var gini = myline.split("\\")[1].split(" = ")[1];
            var samples = myline.split("\\")[2].split(" = ")[1];
            var children = treelinks[key];
            
            var parenttier = parseInt(treedata[key].parent().attr("id").charAt(4));
            if(parenttier == numTiers-1){
                var child1 = treelines[children[0]].split("\\")[1].split(" = ")[1];
                var child2 = treelines[children[1]].split("\\")[1].split(" = ")[1];
            }else{
                var child1 = treelines[children[0]].split("\\")[2].split(" = ")[1];
                var child2 = treelines[children[1]].split("\\")[2].split(" = ")[1];
            }
            
            tip += "Samples: "+samples+"<br>";
            tip += "No: "+child1+"<br>";
            tip += "Yes: "+child2+"<br>";
            tip += "GINI: "+gini+"<br>";


            var id = treedata[key].attr("id")+"tool";

            if(treedata[key].css("margin") == "0px"){
                var myx = treedata[key].position()["left"] + treedata[key].width()*1.05;
            }else{
                var myx = treedata[key].position()["left"] + treedata[key].width()*1.05 + parseInt(treedata[key].css("margin").split(" ")[1].split('p')[0]);
            }
            
            var myy = treedata[key].position()["top"] + treedata[key].height()*1/4;

            d3.select("#content").append("div")
                .html("<p class = 'tooltext'>"+tip+"</p>")
                .style("left", myx+"px")
                .style("top", myy+"px")
                .attr("id", id)
                .classed("tooltip", true)
        }

        //Now, we can make a separate tooltip for the final results ($/$$ and $$$/$$$$)
        for(var key in classifiers){
            var myline = classifiers[key];
            var id = treedata[key].attr("id")+"tool";

            var samples = myline.split("\\")[1].split(" = ")[1];
            var myx = treedata[key].position()["left"] + parseInt(treedata[key].css("margin").split(" ")[1].split('p')[0]);
            var myy = treedata[key].position()["top"] + treedata[key].height() + 5;

            var tip = samples + " out of 3332";

            d3.select("#content").append("div")
                .html("<p class = 'tooltext'>"+tip+"</p>")
                .style("left", myx+"px")
                .style("top", myy+"px")
                .attr("id", id)
                .classed("tooltip classtip", true)
        }
            
    });


    //TODO: Scraper stuff???? No longer sure if possible

    //YQL doesn't work either. I don't think we can do this in live-time, would have to scrape beforehand and have a search function instead.

    /* Tried to use the Yelp API to search businesses. Yelp's API doesn't provide the same attributes as the dataset challenge, unfortunately
{
    "consumer-key": "bYH7b5GAqAxC0mHaBjnLNA"
    "consumer-secret": "QRWobYxWDGhDQ_JrAGHWFbkzBTk"
    "token": "U8k-ZWJ874iILPxIdr9QW5zLUZZuPOnQ"
    "token-secret": "KTSlXy-ruQPRB2POImIh3Ohncdk"
}
    
    //Code Credit: https://github.com/levbrie/mighty_marks/blob/master/yelp-search-sample.html (small edits made)
    $("#scrape").on("click", function(event){
        var url = $("#input").val();
        var check = url.split("biz/");
        if(check.length != 2){ //TODO: More robust checking
            alert("Sorry, your URL wasn't in a form we could process. Try again?");
            return;
        }
        var urlbiz = check[1];

	    var auth = {
		    //
		    // Update with your auth tokens.
		    //
		    consumerKey : "bYH7b5GAqAxC0mHaBjnLNA",
		    consumerSecret : "QRWobYxWDGhDQ_JrAGHWFbkzBTk",
		    accessToken : "U8k-ZWJ874iILPxIdr9QW5zLUZZuPOnQ",
		    // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
		    // You wouldn't actually want to expose your access token secret like this in a real application.
		    accessTokenSecret : "KTSlXy-ruQPRB2POImIh3Ohncdk",
		    serviceProvider : {
			    signatureMethod : "HMAC-SHA1"
		    }
	    };

		var terms = urlbiz;
		var near = 'USA';
		var accessor = {
			consumerSecret : auth.consumerSecret,
			tokenSecret : auth.accessTokenSecret
		};
		parameters = [];
		parameters.push(['term', terms]);
		parameters.push(['location', near]);
		parameters.push(['callback', 'cb']);
		parameters.push(['oauth_consumer_key', auth.consumerKey]);
		parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
		parameters.push(['oauth_token', auth.accessToken]);
		parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
		var message = {
			'action' : 'http://api.yelp.com/v2/search',
			'method' : 'GET',
			'parameters' : parameters
		};
		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);
		var parameterMap = OAuth.getParameterMap(message.parameters);
		parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
		console.log(parameterMap);
		$.ajax({
			'url' : message.action,
			'data' : parameterMap,
			'cache' : true,
			'dataType' : 'jsonp',
			'jsonpCallback' : 'cb',
			'success' : function(data, textStats, XMLHttpRequest) {
				var restaurant = data[0]; //Assumes first result is the right one
			}
		});
    });
    */
});
