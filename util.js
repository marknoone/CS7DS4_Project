// Basic distance between two points
const util = {
    Distance: function(x1, x2, y1, y2) {
        var a = x1 - x2;
        var b = y1 - y2;
        return Math.sqrt( a*a + b*b );
    },
    GetDatesForWeek: function(date){
        // Source: https://stackoverflow.com/questions/8381427/get-start-date-and-end-date-of-current-week-week-start-from-monday-and-end-with/24625489
        var today = date || new Date().setHours(0, 0, 0, 0);
        var day = today.getDay();
        var date = today.getDate() - day;

        // Grabbing Start/End Dates
        var dates = [new Date(today.setDate(date))];
        for(var i = 1; i < 7; i++)
            dates.push(new Date(today.setDate(date + i)));

        return dates;
    },
    GetCalendarDateOperation: function(calendarDates, serviceID, d){
        var date = this.ToGTFSDate(d)
        calendarDates.forEach(function(d){
			if (d.service_id === serviceID && d.date === date) {
				return d.ExceptionType
			}
        })
        return -1
    },
    GetSecondsFromDate: function(a){ 
        var minutes = (a.getHours() * 60) + a.getMinutes();
        return (minutes * 60) + a.getSeconds();
    },
    GetSecondsFromArr: function(a){ 
        var minutes = (a[0] * 60) + a[1];
        return (minutes * 60) +  a[2];
    },
    GetOrigID: function(s){ return s.split(":")[1]},
    ParseGTFSDate: function(gtfsStringDate){
        var year  = gtfsStringDate.slice(0, 4),
            month = gtfsStringDate.slice(4, 6),
            day   = gtfsStringDate.slice(6, 8);
        return new Date(parseInt(year), parseInt(month), parseInt(day));
    },
    GetGTFSTime: function(gtfsStringTime){
        var [h, m, s] = gtfsStringTime.split(":");
        return [parseInt(h), parseInt(m), parseInt(s)];
    },
    ToGTFSDate: function(d){
        var month = d.getMonth() < 10? "0"+d.getMonth():d.getMonth();
        var date  = d.getDate() < 10? "0"+d.getDate():d.getDate();
        return "" + d.getFullYear() + month + date},
    IsTimeBetweenGTFSTimesMin: function(date, gtfsTime1, gtfsTime2) {
        var g1 = this.GetGTFSTime(gtfsTime1),
            g2 = this.GetGTFSTime(gtfsTime2);
        var dateSec = this.GetSecondsFromDate(date);
        return this.GetSecondsFromArr(g1) <= dateSec && dateSec < this.GetSecondsFromArr(g2); 
    },
    IsDateBetweenGTFSDates: function(date, gtfsDate1, gtfsDate2){
        var g1 = this.ParseGTFSDate(gtfsDate1).getTime(),
        g2 = this.ParseGTFSDate(gtfsDate2).getTime();
        return g1 <= date.getTime() && date.getTime() < g2;
    },
    PointBetweenPerc: function(points, perc){
        return {
            lat: parseFloat(points.lat1) + perc * (parseFloat(points.lat2) - parseFloat(points.lat1)),
            lng: parseFloat(points.lng1) + perc * (parseFloat(points.lng2) - parseFloat(points.lng1))
        }
    },
    WrapRadar: function(text, width) {
        text.each(function() {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.4, // ems
              y = text.attr("y"),
              x = text.attr("x"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
              
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
          }
        });
    }
}