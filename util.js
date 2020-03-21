// Basic distance between two points
const util = {
    Distance: function(x1, x2, y1, y2) {
        var a = x1 - x2;
        var b = y1 - y2;
        return Math.sqrt( a*a + b*b );
    },
    GetDatesForCurrentWeek: function(date){
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
    ParseGTFSDate: function(gtfsStringDate){
        var year  = gtfsStringDate.slice(0, 4),
            month = gtfsStringDate.slice(4, 6),
            day   = gtfsStringDate.slice(6, 8);
        return new Date(parseInt(year), parseInt(month), parseInt(day));
    },
    ToGTFSDate: function(date){return "" + date.getFullYear() + getMonth() + getDate()},
    IsDateBetweenGTFSDates: function(date, gtfsDate1, gtfsDate2) {
        var g1 = this.ParseGTFSDate(gtfsDate1).getTime(),
            g2 = this.ParseGTFSDate(gtfsDate2).getTime();
        return g1 <= date.getTime() && date.getTime() < g2; 
    }
}